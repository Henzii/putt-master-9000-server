import { Game, ID, Course } from "../types";
import GameModel from '../models/Game';
import CourseModel from "../models/Course";
import { Document } from "mongoose";
import { SetScoreArgs } from "../graphql/mutations";
import { getPlayersScores } from "./statsService";
import { calculateHc } from "../utils/calculateHc";

export const getGame = async (id: ID) => {
    return await GameModel.findById(id) as Document & Game;
};
export const getGames = async (userId: ID) => {
    const games = await GameModel.find({
        'scorecards.user': userId
    }).sort({ date: -1 }) as (Document & Game)[];
    return games;
};
export const addPlayersToGame = async (gameId: ID, playerIds: ID[]) => {
    // Haetaan tasoitukset
    const peli = await GameModel.findById(gameId) as Document & Game;
    const scoresTable = await getPlayersScores(peli.course, peli.layout, playerIds);
    try {
        const game = await GameModel.findOneAndUpdate(
            { _id: gameId },
            {
                $addToSet: {
                    scorecards: playerIds.map((p) => {
                        return {
                            user: p,
                            scores: [],
                            hc: calculateHc(peli.pars, scoresTable.find(ps => ps.id.toString() === p)?.scores || []),
                        };
                    })
                }
            }, {
                returnDocument: 'after',
            }
        ) as Document & Game;
        return game;
    // eslint-disable-next-line no-console
    } catch (e) { console.log(e); }
};
export const createGame = async (courseId: ID, layoutId: ID) => {
    try {
        const course = await CourseModel.findById(courseId) as Document & Course;
        if (!course) {
            throw new Error('Course not found!!');
        }
        const layout = course.layouts.find(l => l.id === layoutId);
        if (!layout) {
            throw new Error('Layout not found!!');
        }
        const newGame = new GameModel({
            date: new Date(),
            layout: layout?.name,
            course: course.name,
            pars: layout?.pars,
            holes: layout?.holes,
            isOpen: true,
            scorecards: [],
        }) as Document & Game;
        await newGame.save();
        return newGame.id;

    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
    }
};
export const setScore = async (args: SetScoreArgs) => {
    const game = await GameModel.findById(args.gameId) as Document & UnpopulatedGame;
    game.scorecards = game.scorecards.map(s => {
        if (s.user.toString() === args.playerId) {
            s.scores[args.hole] = args.value;
            return s;
        }
        return s;
    });
    await game.save();
    return game;
};
export const closeGame = async (gameId: ID) => {
    const game = await GameModel.findByIdAndUpdate(gameId, {
        isOpen: false
    }, { returnDocument: 'after' });
    return game;
};
export const setBeersDrank = async (gameId: ID, playerId: ID, beers: number) => {
    const game = await GameModel.findById(gameId) as Document & Game;
    const scorecard = game.scorecards.find(sc => sc.user.toString() === playerId);
    if (!scorecard) throw new Error('Scorecard not found!');
    scorecard['beers'] = beers;
    await game.save();
    return {
        user: scorecard.user.toString(),
        scorecard,
    }
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
            game.scorecards = game.scorecards.filter(sc => sc.user.toString() !== playerId)
            await game.save();
            return true;
        }
    } catch (e) {
        return false;
    }
};
export default { getGame, getGames, createGame, addPlayersToGame, setScore, closeGame, setBeersDrank, abandonGame };

interface UnpopulatedGame extends Omit<Game, 'scorecards'> {
    scorecards:
    {
        user: string,
        scores: number[]
    }[]
}