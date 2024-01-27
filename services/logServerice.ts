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
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Error while logging', e);
    }
};

export default addEntry;