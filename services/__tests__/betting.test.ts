import { createBet, getPoolPot } from "../bettingService";
import { mockedPool } from "../mocks/bets";

describe('Betting', () => {
    it('should create a single selection bet', () => {
        const bet = createBet([{leg: 1, selections: [1, 2, 3, 4]}], 100, 'user123');
        expect(bet).toEqual({
            totalStake: 400,
            user: 'user123',
            selections: [{leg: 1, selections: [1, 2, 3, 4]}],
            lines: [
                {stake: 100, line: [{leg:1, selection:1}]},
                {stake: 100, line: [{leg:1, selection:2}]},
                {stake: 100, line: [{leg:1, selection:3}]},
                {stake: 100, line: [{leg:1, selection:4}]},
            ]
        });
    });
    it('should create a multi selection bet', () => {
        const bet = createBet([{leg: 1, selections: [3, 4]}, {leg: 2, selections: [1, 2]}], 50, 'user123');
        expect(bet).toEqual({
            totalStake: 200,
            user: 'user123',
            selections: [{leg: 1, selections: [3, 4]}, {leg: 2, selections: [1, 2]}],
            lines: [
                {stake: 50, line: [{leg:1, selection:3}, {leg:2, selection:1}]},
                {stake: 50, line: [{leg:1, selection:3}, {leg:2, selection:2}]},
                {stake: 50, line: [{leg:1, selection:4}, {leg:2, selection:1}]},
                {stake: 50, line: [{leg:1, selection:4}, {leg:2, selection:2}]},
            ]
        });
    });
    it('should calculate pot size', () => {
        const total = getPoolPot(mockedPool);
        expect(total).toBe(100);
    });
});