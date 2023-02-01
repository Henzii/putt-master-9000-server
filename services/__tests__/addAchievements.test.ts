import { user } from "../mocks/user";
import { checkWinAllHoles, checkSadasMalmis,addAchievement } from "../achievementService";
import game from "../mocks/game";
import stats from "../mocks/stats";

jest.mock('../userService');

const clonedUser = () => ({...JSON.parse(JSON.stringify(user)), save: () => null});

jest.mock('../statsService', () => ({
    getStatsForLayoyt: jest.fn()
})
);

import { getUser } from '../userService';
import { getStatsForLayoyt } from '../statsService';

describe('Achievements are added correctly', () => {
    it('add win all holes', async () => {
        const clone = clonedUser();
        (getUser as jest.Mock).mockImplementation(() => clone);
        await addAchievement(checkWinAllHoles(game), 'winAll');
        expect(clone.achievements).toEqual(
            expect.arrayContaining([expect.objectContaining({ layout_id: game.layout_id, id: 'winAll'})])
        );
    });

    it('100 malmis is not added if count < 100', async () => {
        const clone = clonedUser();
        //clone2.achievements = []
        (getStatsForLayoyt as jest.Mock).mockReturnValue(stats);
        (getUser as jest.Mock).mockImplementation(() => clone);


        (await checkSadasMalmis(game)).forEach(async player => await addAchievement(player, '100Malmis'));

        expect(clone.achievements).toHaveLength(0);
    });
    it ('100 malmis is added if count > 100', async () => {
        const clone = clonedUser();
        const stats2 = [...stats];
        stats2[1].games = 100;
        stats2[1].playerId = clone.id as string;

        (getUser as jest.Mock).mockImplementation(() => clone);
        (getStatsForLayoyt as jest.Mock).mockReturnValue(stats2);
        const players = await checkSadasMalmis(game);
        await Promise.all(players.map(player => addAchievement(player, 'SATAMalmis')));

        expect(clone.achievements).toHaveLength(1);
        expect(clone.achievements).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: 'SATAMalmis'})])
        );
    });

    it ('only one achievement is added per layout', async () => {
        const clone = clonedUser();
        (getUser as jest.Mock).mockImplementation(() => clone);
        expect(clone.achievements).toHaveLength(0);
        await addAchievement(checkWinAllHoles(game), 'winAll');
        await addAchievement(checkWinAllHoles(game), 'winAll');
        await addAchievement(checkWinAllHoles(game), 'winAll');
        expect(clone.achievements).toHaveLength(1);
    });

    it ('multiple achievement can be added per layout', async () => {
        const clone = clonedUser();
        (getUser as jest.Mock).mockImplementation(() => clone);
        expect(clone.achievements).toHaveLength(0);
        await addAchievement(checkWinAllHoles(game), 'loseAll', true);
        await addAchievement(checkWinAllHoles(game), 'loseAll', true);
        await addAchievement(checkWinAllHoles(game), 'loseAll', true);
        expect(clone.achievements).toHaveLength(3);
    });
});
