import { Pool } from "../graphql/games/types";
import { cartesianProduct } from "../utils/betting";

type Selections = {
    leg: number,
    selections: number[]
}

type Result = {
    leg: number,
    selection: number
}[]

export const createBet = (selections: Selections[], stake: number, userId: string) => {
    const lines = buildLines(selections);
    return {
        totalStake: stake * lines.length,
        user: userId,
        selections,
        lines: lines.map(line => ({
            stake,
            line: line
        }))
    };

};

export const getPoolPot = (pool: Pool) => pool.bets.reduce((acc, bet) => acc + bet.totalStake, 0);

export const getTotalWinninStakes = (pool: Pool, result: Result) => {
    return pool.bets.reduce((acc, bet) => {
        const winningLines = bet.lines.filter(line =>
            line.line.every(sel =>
                result.some(res => res.leg === sel.leg && res.selection === sel.selection)
            )
        );
        const totalWinningStake = winningLines.reduce((lineAcc, line) => lineAcc + line.stake, 0);
        return acc + totalWinningStake;
    }, 0);
};

const buildLines = (selections: Selections[]) => {
    const expanded = selections.map(leg =>
      leg.selections.map(sel => ({
        leg: leg.leg,
        selection: sel,
      }))
    );

    return cartesianProduct(...expanded);
  };