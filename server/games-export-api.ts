
import type { Request, Response } from 'express';
import gameService from '../services/gameService';
import { UnpopulatedScorecard } from '../types';
import { total } from '../utils/calculators';
import { formatDate } from '../utils/dateTime';
import jwt from 'jsonwebtoken';

enum FIELDS {
    START_TIME = 'startTime',
    END_TIME = 'endTime',
    COURSE = 'course',
    LAYOUT = 'layout',
    USER_NAME = 'userName',
    PAR = 'par',
    TOTAL = 'total',
    HC = 'hc',
    BEERS = 'beers',
    SCORES = 'scores'
}

const makeHeader = (query: Request['query']) => {
    return Object.values(FIELDS).filter(field => field in query).map(field => field.charAt(0).toUpperCase() + field.slice(1)).join(',') ?? '';
};

const getTokenFromCookie = (request: Request) => {
    const serverCookie = request.headers.cookie?.split('; ').find(cookie => cookie.startsWith('serverToken='));
    const [, value] = serverCookie?.split('=') ?? [];
    return value;
};

export const gameExportApi = async (req: Request, res: Response) => {
    const token = getTokenFromCookie(req);
    try {
        const decodedUser = jwt.verify(token, process.env.TOKEN_KEY ?? '') as { name: string, id: string };

        if (!decodedUser) {
            res.sendStatus(401);

            return;
        }

        const query = req.query;

        const data = await gameService.getGames({ userId: decodedUser.id, limit: 0, offset: 0 });

        const csvData = data.games.map(game => {
            const userScorecard = game.scorecards.find(sc => (sc as UnpopulatedScorecard).user.toString() === decodedUser.id);
            if (!userScorecard) return null;
            const par = game.pars.reduce((acc, curr) => acc + curr, 0);
            return [
                FIELDS.START_TIME in query && formatDate(game.startTime),
                FIELDS.END_TIME in query && formatDate(game.endTime),
                FIELDS.COURSE in query && game.course,
                FIELDS.LAYOUT in query && game.layout,
                FIELDS.PAR in query && par,
                FIELDS.USER_NAME in query && decodedUser.name,
                FIELDS.TOTAL in query && total(userScorecard.scores),
                FIELDS.HC in query && userScorecard.hc,
                FIELDS.BEERS in query && userScorecard.beers,
                ...(FIELDS.SCORES in query ? userScorecard.scores : [null]),
            ].filter(part => part || typeof part === 'number').join(',');
        }).join('\n');
        res.setHeader('content-type', 'text/csv');
        const header = makeHeader(query);
        res.send(`${header}\n${csvData}`);
    } catch {
        res.sendStatus(401);
    }
};