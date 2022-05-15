import mongoose from 'mongoose';
import GameModel from '../models/Game';
import { ID } from '../types';

export const getPlayersScores = async (course: string, layout: string, playerIds: ID[]) => {
    // Tehdään stringilistasta mongoosen objectId-lista.
    const playerIdObjects = playerIds.map(pid => new mongoose.Types.ObjectId(pid));
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