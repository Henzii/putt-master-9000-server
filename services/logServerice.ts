import Log, { LogContext, LogType } from "../models/Log";
import { ID } from "../types";

const addEntry = (message: string, type: LogType, context: LogContext, userId?: ID) => {
    try {
        Log.create({
            message,
            type,
            context,
            user: userId
        });
        console.log(message, type, context, userId);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Error while logging', e);
    }
};

export const getLogs = async () => {
    try {
        const logs = await Log.find({}).limit(100);
        return logs;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Error while fetching logs', e);
    }
};

export default addEntry;