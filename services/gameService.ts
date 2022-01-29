import { Game, ID, Course } from "../types";
import GameModel from '../models/Game';
import CourseModel from "../models/Course";
import { Document } from "mongoose";
import { SetScoreArgs } from "../graphql/mutations";

export const getGame = async (id: ID) => {
    return await GameModel.findById(id).populate({
        path: 'scorecards',
        populate: {
            path: 'user'
        }
    }) as Document & Game;
}
export const getGames = async (populateUsers = false) => {

    if (populateUsers) {
        return await GameModel.find({}).populate({
            path: 'scorecards',
            populate: {
                path: 'user'
            }
        }) as (Document & Game)[]
    } else {
        return await GameModel.find({}) as (Document & Game)[];
    }

}
export const addPlayersToGame = async (gameId: ID, playerIds: ID[]) => {
    console.log(gameId, playerIds)
    const game = await GameModel.findOneAndUpdate(
        { _id: gameId },
        {
            $addToSet: {
                scorecards: playerIds.map(p => {
                    return { user: p, scores: [] }
                })
            }
        }
    )
    console.log(game);
    return game;
}
export const createGame = async (layoutId: ID) => {
    try {
        const course = await CourseModel.findOne({ "layouts.id": layoutId }) as unknown as Document & Course;
        const layout = course.layouts.find(l => l.id === layoutId)
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
        console.log(e)
    }
}
export const setScore = async (args: SetScoreArgs) => {
    const game = await GameModel.findById(args.gameId) as Document & UnpopulatedGame;
    game.scorecards = game.scorecards.map(s => {
        if (s.user.toString() === args.playerId) {
            s.scores[args.hole] = args.value;
            return s
        }
        return s;
    })
    await game.save();
    return game;
}
export default { getGame, getGames, createGame, addPlayersToGame, setScore }

interface UnpopulatedGame extends Omit<Game, 'scorecards'> {
    scorecards:
    {
        user: String,
        scores: number[]
    }[]
}

const games: Game[] = []