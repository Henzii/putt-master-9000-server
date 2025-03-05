import { ID } from "../../types";

export type LoginArgs = {
    user: string,
    password: string,
    pushToken?: string,
}
export type RestoreAccountArgs = {
    name?: string,
    restoreCode?: string,
    password?: string,
}

type SettingsArgs = {
    blockFriendRequests?: boolean,
    userId?: ID
    groupName?: string,
    email?: string
}
export type ChangeSettingsArgs = SettingsArgs & {
    password?: string,
}

export type UserSettingsArgs = SettingsArgs & {
    passwordHash?: string,
    restoreCode?: string,
    pushToken?: string
}

export type GetPastActivityArgs = {
    year?: number
    userId?: ID
}
