import { Game, ID, Course, GameWithUnpopulatedScorecard } from "../types";
import GameModel from '../models/Game';
import CourseModel from "../models/Course";
import { Document } from "mongoose";
import { SetScoreArgs } from "../graphql/mutations";
import { getPlayersScores } from "./statsService";
import { calculateHc } from "../utils/calculateHc";
import userService from "./userService";
import { GraphQLError } from "graphql";

type GetGamesArgs = {
    userId: ID,
    onlyOpenGames?: boolean,
    limit: number,
    offset: number,
    search?: string,
}
type GamesSearchString = {
    'scorecards.user': ID
    $or: { isOpen: boolean }[]
    course?: { $regex: string, $options: string }
}
export const getGamesWithUser = async (minUserCount: number, userIds: ID[], filterYear: number) => {
    return await GameModel.find({
        [`scorecards.${minUserCount-1}`]: { $exists: true },
        startTime: {
            $gt: `${filterYear}-01-01`,
            $lt: `${filterYear}-12-31`
        },
        'scorecards.user': { $in: userIds }
    }) as (Document & GameWithUnpopulatedScorecard)[];
};

export const getGame = async (id: ID) => {
    return await GameModel.findById(id) as Document & Game;
};
export const getLiveGames = async(userId: ID) => {
    const me = await userService.getUser(undefined, userId);
    if (!me) throw new Error();

    return GameModel.find({
        isOpen: true,
        $or: [
            {'scorecards.user': userId },
            {'scorecards.user': { $in: me.friends }},
        ]
    });
};
export const getGames = async ({userId, onlyOpenGames=false, limit=10, offset=0, search}: GetGamesArgs) => {
    const searchString:GamesSearchString = {

        'scorecards.user': userId,
        $or: [
            { isOpen: true },
            { isOpen: onlyOpenGames },
        ],
    };

    if (search) searchString['course'] = { $regex: search, $options: 'i' };

    const count = await GameModel.count(searchString);
    const games = await GameModel.find(searchString)
        .sort({ startTime: -1 })
        .skip(offset)
        .limit(limit);
    const hasMore = count > offset+limit;
    return {
        games,
        count,
        hasMore,
        nextOffset: hasMore ? offset+limit : null
    };
};
export const addPlayersToGame = async (gameId: ID, playerIds: ID[]) => {
    // Haetaan tasoitukset
    const peli = await GameModel.findById(gameId) as Document & Game;
    const scoresTable = await getPlayersScores(peli.layout_id, playerIds);
    try {
        const game = await GameModel.findOneAndUpdate(
            { _id: gameId },
            {
                $addToSet: {
                    scorecards: playerIds.map((p) => {
                        return {
                            user: p,
                            scores: [],
                            hc: calculateHc(peli.pars, scoresTable.find(ps => ps.id.toString() === p)?.scores.slice(-10) || []),
                        };
                    })
                }
            }, {
                returnDocument: 'after',
            }
        ) as Document & Game;
        return game;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
        throw new GraphQLError('Error while adding players');
    }
};
export const createGame = async (courseId: ID, layoutId: ID) => {
    try {
        const course = await CourseModel.findById(courseId) as Document & Course;
        if (!course) {
            throw new GraphQLError('Course not found!!');
        }
        const layout = course.layouts.find(l => l.id === layoutId);
        if (!layout) {
            throw new GraphQLError('Layout not found!!');
        }
        const newGame = new GameModel({
            date: new Date(),
            layout: layout?.name,
            layout_id: layoutId,
            startTime: new Date(),
            course: course.name,
            pars: layout?.pars,
            holes: layout?.holes,
            isOpen: true,
            scorecards: [],
        });
        await newGame.save();
        return newGame.id;

    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
    }
};

export const setScore = async (args: SetScoreArgs) => {
    const game = await GameModel.findById<Game & Document>(args.gameId).populate('scorecards.user');
    if (!game) throw new GraphQLError('Game not found');

    const scorecard = game.scorecards.find(sc => sc?.user?.id === args.playerId);
    if (!scorecard) throw new GraphQLError('Player\'s scorecard was not found');

    scorecard.scores[args.hole] = args.value;
    await game.save();
    return game;
};
export const closeGame = async (gameId: ID, isOpen = false) => {
    const game = await GameModel.findById(gameId) as Document & Game;
    game.isOpen = isOpen;
    if (!isOpen) game.endTime = new Date();
    await game.save();
    await game.populate('scorecards.user');
    return game;
};
export const setBeersDrank = async (gameId: ID, playerId: ID, beers: number) => {
    const game = await GameModel.findById(gameId) as Document & Game;
    const scorecard = game.scorecards.find(sc => sc.user.toString() === playerId);
    if (!scorecard) throw new GraphQLError('Scorecard not found!');
    scorecard['beers'] = beers;
    await game.save();
    return {
        user: scorecard.user.toString(),
        game,
        scorecard
    };
};
export const changeGameSettings = async( gameId: ID, settings: { isOpen?: boolean, startTime: string | Date }, userId: ID) => {
    const newSettings = { ...settings };
    if (newSettings.startTime) {
        if (isNaN(Date.parse(newSettings.startTime as string))) {
            throw new GraphQLError(`${newSettings.startTime} is not a valid date`);
        }
        newSettings.startTime = new Date(newSettings.startTime);
    }
    const game = await GameModel.findOneAndUpdate(
        {
            _id: gameId,
            isOpen: true,
            'scorecards.user': userId,
        },
        {
            $set: { ...newSettings }
        }
    ).populate('scorecards.user');
    if (!game) {
        throw new GraphQLError('Game for settings change not found. Illeagal parameters?');
    }
    return game;
};
export const abandonGame = async(gameId: ID, playerId: ID) => {
    try {
        const game = await GameModel.findById(gameId) as Game & Document;
        // Pelaajan pitää olla pelissä mukana
        if (!game.scorecards.find(sc => sc.user.toString() === playerId)) {
            return false;
        }
        // Jos peli on auki, poistetaan koko peli
        if (game.isOpen) {
            await GameModel.findByIdAndRemove(gameId);
            return true;
        // Muutoin poistetaan vain pelaajan tuloskortti pelistä
        } else {
            game.scorecards = game.scorecards.filter(sc => sc.user.toString() !== playerId);
            await game.save();
            return true;
        }
    } catch (e) {
        return false;
    }
};

export const getScorecardsDates = async (userId: ID, from: Date, to: Date) => {
    const games = await GameModel.find<GameWithUnpopulatedScorecard>({
        'scorecards.user': userId,
        'startTime': {
            $gte: from,
            $lt: to
        }
    });
    return games.map(game => game.startTime);
};

export const countGamesPlayedOnLayouts = async (layoutIds: ID[]) => {
    const count = await GameModel.count({
        layout_id: { $in: layoutIds }
    });
    return count;
};

export const deleteCourse = async (courseId: ID) => {
    console.log('Poista', courseId);
    try {
        await GameModel.findByIdAndRemove(courseId.toString());
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

export default { getGame, getGames, createGame, addPlayersToGame, setScore, closeGame,
    setBeersDrank, abandonGame, changeGameSettings, getLiveGames, getScorecardsDates, countGamesPlayedOnLayouts };
