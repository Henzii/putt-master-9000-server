import { getGraphQLRateLimiter } from "graphql-rate-limit";

export const feedbackRateLimiter = getGraphQLRateLimiter({identifyContext: (ctx) => ctx?.user?.id ?? 'feedback'});
