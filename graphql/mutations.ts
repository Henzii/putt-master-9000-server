import userService from "../services/userService";
import { ContextWithUser } from "../types";
import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { sendEmail } from "../services/mailService";
import config from "../utils/config";
import { feedbackRateLimiter } from "./rateLimiter";

export const mutations = {
    Mutation: {
        sendFeedback: async (root: unknown, args: {subject: string, text: string, email: string}, context: ContextWithUser, info: GraphQLResolveInfo) => {
            if (await feedbackRateLimiter({parent: root, args, context, info}, {max: 1, window: '10s'})) {
                throw new GraphQLError('Feedback rate limit exceed. Try again later.');
            }

            const user = !!context?.user?.id && await userService.getUser(undefined, context.user.id);
            const email = (user && user.email) || args.email || config.feedbackEmailFrom;
            return sendEmail({
                from: email,
                to: config.feedbackEmailTo,
                subject: args.subject,
                text: args.text.concat(`\n\n--- Fudisc feedback ---\nUser: ${context?.user?.name || 'N/A'}\nEmail: ${email || 'N/A'}`)
            });
        }
    }
};
