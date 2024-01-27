import mongoose from "mongoose";
import { User } from "../types";

export enum LogType {
    ERROR = "error",
    INFO = "info",
    SUCCESS = "success",
    WAGNING = 'warning'
}

export enum LogContext {
    USER_CREATION = "userCreation",
    USER_DELETION = "userDeletion",
    USER = "user",
    COURSE = "course",
    LAYOUT = "layout",
    UNKNOWN = "unknown",
}
export type LogEntry = {
    message: string
    type: LogType,
    context?: LogContext
    user?: User
}

type LogEntryDocument = LogEntry & Document

const schema = new mongoose.Schema<LogEntryDocument>({
    message: String,
    type: String,
    context: String,
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true});

export default mongoose.model('Log', schema);