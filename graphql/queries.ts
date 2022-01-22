import { getCourses } from "../services/courseService";
import { getGames } from "../services/gameService";
import { Course } from "../types";

const courses = getCourses();

export const queries = {
    Query: {
        getCourses: (_root: unknown, args: getCoursesArgs) => {
            if (args.id) {
                return [courses.find(c => c.id === args.id)]
            }
            if (args.name) {
                return [courses.find(c => c.name.includes(args.name))]
            }
            return courses;
        },
        getMe: () => {
            return {
                name: 'Kovakoodi',
                id: 'KK1',
                friends: [
                    {
                        name: 'Kova kakkonen',
                        id: 'KK2',
                        friends: []
                    },
                    {
                        name: 'Numero kolme',
                        id: 'KK3',
                        friends: []
                    }
                ]
            }
        },
        getGames: () => {
            return getGames();
        },
        ping: (): String => 'pong!'
    }
}

type getCoursesArgs = {
    name: string,
    id: number | string
}