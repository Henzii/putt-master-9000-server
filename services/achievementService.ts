import { Game, ID, Scorecard } from "../types";
import statsServices from "./statsService";
import userService from "./userService";
const MIN_PLAYER_COUNT = 3;
const MALMIS_ID = 'malmisId';

type UserAndLayout = {
    userId?: ID,
    layoutId?: ID,
}

export const addAchievement = async ({userId, layoutId}: UserAndLayout, id: string, multiple = false) => {
    if (!userId) return;
    const user = await userService.getUser(undefined, userId);
    if (!user) return;
    if (!multiple) {
        if (user?.achievements?.find(achievement => {
            if (layoutId && layoutId === achievement.layout_id && achievement.id === id) return true;
            else if (!layoutId && achievement.id === id) return true;
            return false;
        })) return;
    }
    user.achievements?.push({ layout_id: layoutId || '', id });
    user.save();
};

export const checkAchievements = async (game: Game) => {
    if (game.scorecards.length < MIN_PLAYER_COUNT) return;
    addAchievement(checkWinAllHoles(game), 'winAllHoles');
    addAchievement(checkWinAllHoles(game, false), 'loseAllHoles');
    (await checkSadasMalmis(game)).forEach(player => {
        addAchievement(player, '100Malmis');
    });
};

export const checkWinAllHoles = (game: Game, findWinner=true): UserAndLayout => {
    const winner: Scorecard | undefined = getBestForHole(game.scorecards, 0, findWinner);
    const holes = game.pars.length;
    for (let i = 1; i < holes; i++) {
        const holeWinner = getBestForHole(game.scorecards, i, findWinner);
        if (!winner || holeWinner?.id !== winner.id) {
            return { userId: undefined };
        }
    }
    return { userId: winner?.user.id, layoutId: game.layout_id };
};
export const checkHoleInOnes = (game: Game): UserAndLayout[] => {
    return game.scorecards.filter(sc => {
        return !!sc.scores.find(score => score === 1);
    }).map(sc2 => ({layoutId: game.layout_id, userId: sc2.user.id})) || [];
};

export const checkSadasMalmis = async (game: Game): Promise<UserAndLayout[]> => {
    if (game.layout_id !== MALMIS_ID) return [];
    const stats = await statsServices.getStatsForLayoyt(MALMIS_ID, game.scorecards.map(sc => sc.user.id));
    return stats.filter(player => player.games >= 100).map(player => ({userId: player.playerId, layoutId: game.layout_id})) ?? {};
};

export const checkZeroPars = (game: Game) => {
    const winners = game.pars.reduce((p, c, index) => {
        let list: Scorecard[] = [...p];
        for (const player of p) {
            if ((player.scores[index] || 0) <= c) {
                list = list.filter(sc => sc.id !== player.id);
            }
        }
        return list;
    }, game.scorecards);

    return winners.map(sc => sc.user.id);
};

export const getBestForHole = (cards: Scorecard[], hole: number, findWinner: boolean): Scorecard | undefined => {
    if (cards.length < 2) return;
    const sorted = [...cards].sort((a, b) =>(a.scores[hole] - b.scores[hole]));
    if (!findWinner) {
        sorted.reverse();
    }
    if (sorted[0].scores[hole] === sorted[1].scores[hole]) {
        return;
    }
    return sorted[0];
};

export default {
    checkAchievements
};
