import { Game, ID, Scorecard } from "../types";
import statsServices from "./statsService";
import userService from "./userService";
const MIN_PLAYER_COUNT = 3;
const MALMIS_ID = '61ffbbc9dc4b6f65e2514ee9';
// Testaukseen '63135c3519500ea7ed409c1b';

import achievements from "../utils/achievements";
import pushNotificationsService from "./pushNotificationsService";

type UserAndGame = {
    userId?: ID,
    game?: Game
}

type AchievementID = 'winAllHoles' | 'loseAllHoles' | '100Malmis' | '0Pars' | 'HoleInOne' | 'GoldenBox';

export const addAchievement = async ({userId, game}: UserAndGame, id: AchievementID, multiple = false) => {
    if (!userId || !game) return;
    const user = await userService.getUser(undefined, userId);
    if (!user) return;

    if (!multiple) {
        if (user?.achievements?.find(achievement => {
            if (game.layout_id && game.layout_id.toString() === achievement.layout_id && achievement.id === id) return true;
            else if (!game.layout_id && achievement.id === id) return true;
            return false;
        })) return;
    }
    // eslint-disable-next-line no-console
    console.log('Achievement', id, 'added for', userId);
    user.achievements?.push({
        id,
        game: game.id,
        layout_id: game.layout_id
    });
    await user.save();
    pushNotificationsService.sendNotification([userId], achievements.achievements[id].notification);
};

export const checkAchievements = async (game: Game) => {
    if (game.scorecards.length < MIN_PLAYER_COUNT) return;
    addAchievement(checkWinAllHoles(game), 'winAllHoles');
    addAchievement(checkWinAllHoles(game, false), 'loseAllHoles');
    addAchievement(checkGoldenBox(game), 'GoldenBox');
    (await checkSadasMalmis(game)).forEach(player => {
        addAchievement(player, '100Malmis');
    });
    checkZeroPars(game).forEach(player => {
        addAchievement(player, '0Pars');
    });
    checkHoleInOnes(game).forEach(player => {
        addAchievement(player, 'HoleInOne');
    });

};

export const checkHoleInOnes = (game: Game): UserAndGame[] => {
    return game.scorecards.filter(sc => {
        return !!sc.scores.find(score => score === 1);
    }).map(sc2 => ({game, userId: sc2.user.id})) || [];
};

export const checkSadasMalmis = async (game: Game): Promise<UserAndGame[]> => {
    if (game.layout_id.toString() !== MALMIS_ID) {
         return [];
    }
    const stats = await statsServices.getStatsForLayoyt(MALMIS_ID, game.scorecards.map(sc => sc.user.id));
    return stats.filter(player => {
        return player.games >= 100;
    }).map(player => ({userId: player.playerId, game})) ?? {};
};

export const checkZeroPars = (game: Game): UserAndGame[] => {
    const winners = game.pars.reduce((p, c, index) => {
        let list: Scorecard[] = [...p];
        for (const scorecard of p) {
            if ((scorecard.scores[index] ?? 0) <= c) {
                list = list.filter(sc => sc.user.id !== scorecard.user.id);
            }
        }
        return list;
    }, game.scorecards);
    return winners.map(sc => ({userId: sc.user.id, game}));
};

export const checkWinAllHoles = (game: Game, findWinner=true): UserAndGame => {
    const winner: Scorecard | undefined = getBestForHole(game.scorecards, 0, findWinner);
    if (!winner) return {};
    const holes = game.pars.length;
    for (let i = 1; i < holes; i++) {
        const holeWinner = getBestForHole(game.scorecards, i, findWinner);
        if (holeWinner?.user?.id !== winner?.user.id) {
            return {};
        }
    }
    return { userId: winner?.user.id, game };
};

export const checkGoldenBox = (game: Game): UserAndGame => {
    const firsrHoleWinner = getBestForHole(game.scorecards, 0, true);
    if (!firsrHoleWinner) return {}; // You need to win the first hole to get the golden box

    for (let i=1; i<game.pars.length; i++) {
        const bestScoreForHole = Math.min(...game.scorecards.map(sc => sc.scores[i]))
        if (bestScoreForHole < firsrHoleWinner.scores[i]) {
            return {};
        }
    }

    return {userId: firsrHoleWinner.user.id, game};
};

export const getBestForHole = (cards: Scorecard[], hole: number, findWinner: boolean): Scorecard | undefined => {
    if (cards.length < 2) return;
    const clonedCards = JSON.parse(JSON.stringify(cards)) as Scorecard[];
    const sorted = clonedCards.sort((a, b) =>(a.scores[hole] - b.scores[hole]));
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
