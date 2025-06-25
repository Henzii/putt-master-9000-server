import { GraphQLError } from "graphql";
import userService from "../../services/userService";
import { ContextWithUser, ID } from "../../types";
import { GetPastActivityArgs } from "./types";
import { addMonths, addYears, endOfMonth, format, startOfMonth } from "date-fns";
import { getPlayersScores } from "../../services/statsService";
import gameService from "../../services/gameService";

export default {
    Query: {
        getMe: async (_root: unknown, args: unknown, context: ContextWithUser) => {
            if (!context?.user?.id) return null;
            return await userService.getUser(undefined, context.user?.id);
        },
        getUsersWithoutGames: async () => {
            const users = await userService.getUsersWithoutGames();
            const mapepdUsers = users.map(user => ({
                id: user.id,
                name: user.name,
                createdAt: user.createdAt
            }));

            return mapepdUsers;
        },
        getUsers: async () => {
            return userService.getUsers();
        },
        getUser: async (_root: unknown, args: {userId: ID}) => {
            return await userService.getUser(undefined, args.userId);
        },
        searchUser: async (_root: unknown, args: { search: string }, context: ContextWithUser) => {
            const res = await userService.searchUser(args.search);
            if (!context.user?.id) {
                res.users = res.users.map(user => {
                    return {...user, id: 'null'};
                });
            }
            return res;
        },
        getPastActivity: async (_root: unknown, args: GetPastActivityArgs, context: ContextWithUser) => {
            if (args.userId) {
                const me = await userService.getUser(undefined, context.user.id);
                if (!me?.friends.includes(args.userId)) {
                    throw new GraphQLError('Unauthorized');
                }
            }

            const userId = args.userId ?? context.user.id;

            const fromDate = args.year ? new Date(args.year, 0, 1, 0, 0) : startOfMonth(addYears(new Date(), -1));
            const toDate = args.year ? new Date(args.year, 11, 31, 23, 59) : endOfMonth(addMonths(new Date(), -1));
            const dates = await gameService.getScorecardsDates(userId, fromDate, toDate);
            const monthNumbers = dates.map(date => +format(date, 'M'));

            const groupedMonths: {month: number, games: number}[] = [];
            const startingMonth = +format(fromDate, 'M');

            for(let i = 0; i <= 11; i++) {
                const monthIndex = startingMonth + i > 12 ? startingMonth - 12 + i : startingMonth + i;
                const count = monthNumbers.reduce((acc, curr) => curr === monthIndex ? acc + 1 : acc, 0);
                groupedMonths.push({month: monthIndex, games: count});
            }

            return {
                from: fromDate.toLocaleDateString(),
                to: toDate.toLocaleDateString(),
                months: groupedMonths
            };

        },
        getHc: async (_root: unknown, args: {layoutId: ID, userIds: ID[] }, context: ContextWithUser) => {
            const res = await getPlayersScores(args.layoutId, args.userIds || [context.user.id]);
            return res.map(user => {
                return {
                    id: user._id,
                    games: user.games,
                    scores: user.scores,
                    pars: user.pars,
                };
            });
        },
        getGroupMembers: async (_root: unknown, args: { groupName?: string }, context: ContextWithUser) => {
            if (args.groupName && !userService.isAdmin(context.user.id)) {
                throw new GraphQLError('Unauthorized, only admins can specify group name');
            }

            const groupName = args.groupName || (await userService.getUser(undefined, context.user.id))?.groupName;

            if (!groupName) {
                return []; // If no group name is specified, return empty array
            }

            const groupUsers = await userService.getGroupUsers(groupName);
            return groupUsers.map(user => ({
                id: user.id,
                name: user.name,
                groupName: user.groupName
            }));
        }

    }
};