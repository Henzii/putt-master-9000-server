import { addCourse, addLayout } from "../services/courseService";
import { createGame } from "../services/gameService";
import { ID, Layout, NewLayoutArgs } from "../types";

export const mutations = {
    Mutation: {
        login: (_root: unknown, args: LoginArgs) => {
            return 'RandomShit';
        },
        addCourse: (_root: unknown, args: { name: string }) => {
            return addCourse(args.name)
        },
        addLayout: (_root: unknown, args: { courseId: string | number, layout: NewLayoutArgs }) => {
            return addLayout(args.courseId, args.layout)
        },
        createGame: (_root: unknown, args: { layoutId: ID }): ID => {
            return createGame(args.layoutId);
        }
    }
}

type LoginArgs = {
    user: String,
    password: String
}
