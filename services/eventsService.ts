import { ID, User } from "../types";
import Events from '../models/Event';

export const createEvent = async (event: CreateEventArgs, creator: ID) => {
    const newEvent = new Events({
        ...event,
        creator,
    });
    await newEvent.save();
    return newEvent as unknown as Event;
}

export interface CreateEventArgs {
    name: string,
    date: string,
    comment?: string,
    creator: ID
}

interface Event extends CreateEventArgs {
    id: ID,
    course?: string
    layout?: string
    invites?: EventInvites
    registrationOpen?: boolean
    messages?: [EventMessage]
}
type EventInvites = {
    invited?: User[],
    rejected?: User[],
    accepted?: User[],
}
type EventMessage = {
    message: string,
    user: User,
}