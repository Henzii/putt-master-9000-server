import mongoose from 'mongoose';
import GameModel from '../models/Game';
import { ID } from '../types';
import { holestats } from '../utils/calculators';

const mapPlayerIds = (ids: ID[]) => ids.map(p => new mongoose.Types.ObjectId(p));

export const getStatsForLayoyt = async (layoutId: ID, playerIds: ID[]) => {
    const mappedIds = mapPlayerIds(playerIds);
    const response = await GameModel.aggregate([
        {
            '$match': {
            'layout_id': new mongoose.Types.ObjectId(layoutId),
            'isOpen': false,
            'scorecards.user': { '$in': mappedIds }
            }
        }, {
            '$sort': {
            'startTime': 1
            }
        }, {
            '$unwind': {
            'path': '$scorecards'
            }
        }, {
            '$match': {
            'scorecards.user': { '$in': mappedIds }
            }
        }, {
            '$group': {
            '_id': '$scorecards.user',
            'games': {
                '$sum': 1
            },
            'pars': { '$first': '$pars' },
            'scores': {
                '$push': '$scorecards.scores'
            },
            }
        }
    ]);
    const obj = response.map(res => {
        return {
            playerId: res._id.toString(),
            games: res.games,
            holes: holestats(res.scores, res.pars),
        };
    });
    return obj;
};

export const getPlayersScores = async (course: string, layout: string, playerIds: ID[]) => {
    const playerIdObjects = mapPlayerIds(playerIds);
    return GameModel.aggregate([
        // Otetaan kaikki pelit joilla playerIds listalla olevat pelaajat ovat pelanneet
        // ja jotka vastaavat tiettyä rataa
        {
            $match: {
                course: course,
                layout: layout,
                isOpen: false,
                'scorecards.user': { '$in': playerIdObjects }
            }
        },
        // Järjestetään päivämäärän mukaan
        { $sort: { 'startTime': 1 } },

        // Avataan scorecards osa
        { $unwind: '$scorecards' },

        // Suodatetaan muut kuin playerIds listalla olevat pelaajat pois
        { $match: { 'scorecards.user': { $in: playerIdObjects } } },
        {
            $group: {
                _id: '$scorecards.user',
                "games": { $sum: 1 },
                "pars": { $first: '$pars' },
                scores: {
                    $push: {
                        $reduce: {
                            input: '$scorecards.scores',
                            initialValue: 0,
                            in: {
                                $add: ['$$value', '$$this']
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                'id': '$_id',
                'games': '$games',
                'pars': '$pars',
                'scores': '$scores',
            }
        }
    ]);
};

export default {
    getStatsForLayoyt,
};