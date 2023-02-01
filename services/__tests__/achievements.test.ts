import { checkWinAllHoles, checkSadasMalmis, checkZeroPars, checkHoleInOnes } from "../achievementService";
import game from "../mocks/game";
import stats from "../mocks/stats";

jest.mock('../statsService', () => ({
        getStatsForLayoyt: jest.fn()
    })
);
const clonedGame = () => JSON.parse(JSON.stringify(game));
import { getStatsForLayoyt } from '../statsService';

describe('Achievements', () => {
    describe('Hole in one', () => {
        it('no hole in ones', () => {
            const holeInOnes = checkHoleInOnes(clonedGame());
            expect(holeInOnes).toHaveLength(0);
        });
        it('one hole in one', () => {
            const games2 = clonedGame();
            games2.scorecards[0].scores[3] = 1;
            const holeInOnes = checkHoleInOnes(games2);
            expect(holeInOnes).toHaveLength(1);
            expect(holeInOnes[0]).toEqual(expect.objectContaining({
                userId: games2.scorecards[0].user.id,
                layoutId:games2.layout_id }));
        });
        it('dos hole in ones', () => {
            const games2 = clonedGame();
            games2.scorecards[0].scores[2] = 1;
            games2.scorecards[1].scores[5] = 1;
            const holeInOnes = checkHoleInOnes(games2);
            expect(holeInOnes).toHaveLength(2);
        });

    });
    describe('Win/Lose all holes', () => {
        it('winner is found', () => {
            const winner = checkWinAllHoles(game);
            expect(winner?.userId).toBe('player1');
        });
        it('loser is found', () => {
            const loser = checkWinAllHoles(game, false);
            expect(loser?.userId).toBe('player2');
        });
        it('returns undefined if even one hole is tied', () => {
            const games2 = game;
            games2.scorecards[0].scores[4] = 4;
            const winner = checkWinAllHoles(games2);
            expect(winner?.userId).toBeUndefined();
        });
    });

    describe('100. Malmis', () => {
        it('99 games - not good enough', async () => {
            (getStatsForLayoyt as jest.Mock).mockReturnValue(stats);
            const res = await checkSadasMalmis(game);
            expect(res).toHaveLength(0);
        });
        it('100 games - winner winner chicken dinner', async () => {
            const stats2 = [...stats];
            stats2[1].games = 100;
            (getStatsForLayoyt as jest.Mock).mockReturnValue(stats2);
            const res = await checkSadasMalmis(game);
            expect(res).toHaveLength(1);
            expect(res[0].userId).toEqual('player2');
        });

    });
    describe('0 Pars', () => {
        it('incomplete or empty scorecard is ignored', () => {
            const game2 = game;
            game2.scorecards[0].scores = [];
            game2.scorecards[1].scores = [5,5,5];
            expect(checkZeroPars(game2)).toHaveLength(0);
        });
        it('no joy with just one par', () => {
            game.scorecards[0].scores = [2,2,2,3,3,3,2,3,2];
            game.scorecards[1].scores = [4,5,5,4,3,7,7,9,10];
            expect(checkZeroPars(game)).toHaveLength(0);
        });
        it('just hole in ones ;)', () => {
            const game2 = {...game};
            game2.scorecards[0].scores = [1,1,1,1,1,1,1,1,1,1];
            game2.scorecards[1].scores = [1,1,1,1,1,1,1,1,1,1];
            expect(checkZeroPars(game2)).toHaveLength(0);
        });
        it('one player with all above pars', () => {
            game.scorecards[0].scores = [2,2,2,3,3,3,2,3,2];
            game.scorecards[1].scores = [4,5,5,4,4,7,7,9,10];
            const res = checkZeroPars(game);
            expect(res).toHaveLength(1);
            expect(res).toContainEqual('player2');
        });
        it('both players with all above pars', () => {
            game.scorecards[0].scores = [4,5,5,4,4,7,7,9,10];
            game.scorecards[1].scores = [4,4,4,5,6,7,11,12,13];
            const res = checkZeroPars(game);
            expect(res).toHaveLength(2);
            expect(res).toContainEqual('player1');
            expect(res).toContainEqual('player2');
        });
    });
});
