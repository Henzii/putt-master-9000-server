import { ContextWithUser } from "../types";

export const requireAuth = (context: ContextWithUser) => {
    if (!context.user?.id) {
        throw new Error('Unauthorized');
    }
};