import { LegType, Pool } from "../graphql/games/types";
import { Game } from "../types";
import { cartesianProduct } from "../utils/betting";
import { total } from "../utils/calculators";

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

export const getTotalWinningStakes = (pool: Pool, result: Result) => {
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

export const getPoolResult = (game: Game): Pool[] => {
    if (!game.betting) {
        return [];
    }
    const getPoolsWithResults = game.betting?.pools.map(pool => {
        const winningSelection = pool.legs.map(leg => {
            if ([LegType.WINNER, LegType.WINNER_HC].includes(leg.type)) {
                const hcMultiplier = leg.type === LegType.WINNER_HC ? 1 : 0;

                const minScore = Math.min(...game.scorecards.map(sc => total(sc.scores) - (hcMultiplier * sc.hc)));
                const winnerIds = game.scorecards
                    .filter(sc => total(sc.scores) - (hcMultiplier * sc.hc) <= minScore)
                    .map(sc => sc.user.id.toString());
                const winningSelections = leg.selections.filter(sel => winnerIds.includes(sel.value)).map(sel => sel.id);
                return winningSelections;
            }

            if (LegType.HOLE_IN_ONE === leg.type) {
                const holeInOneScorecards = game.scorecards.filter(sc =>
                    sc.scores.some(score => score === 1)
                );

                const winningSelections = leg.selections.filter(sel =>
                    holeInOneScorecards.some(sc => sc.user.id.toString() === sel.value)
                ).map(sel => sel.id);

                return winningSelections;
            }

            return [];
        });
        return {...pool, result: {winningSelection}};
    });

    return getPoolsWithResults;
};