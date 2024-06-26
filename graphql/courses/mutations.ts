import Log from '../../services/logServerice';
import { LogContext, LogType } from "../../models/Log";
import { addCourse, addLayout, deleteCourse, getCourse, updateCourse } from "../../services/courseService";
import { ContextWithUser, ID, NewLayoutArgs } from "../../types";
import { GraphQLError } from 'graphql';
import userService from '../../services/userService';
import { countGamesPlayedOnLayouts } from '../../services/gameService';

type AddCourseArgs = {
    name: string
    coordinates?: {
        lat: number
        lon: number
    }
    courseId?: ID
}

export default {
    Mutation: {
        addCourse: async (_root: unknown, args: AddCourseArgs, context: ContextWithUser) => {
            const {name, coordinates, courseId} = args;
            if (courseId) {
                const course = await getCourse(courseId);
                if (!course) throw new GraphQLError('Course not found');

                if (course.creator?.toString() !== context.user.id && !(await userService.isAdmin(context.user.id))) {
                    Log(
                        `Course (${name}, ${courseId}) change denied (not the owner)`,
                        LogType.WAGNING, LogContext.COURSE, context.user.id
                    );
                    throw new GraphQLError('You can only edit courses you have created');
                }

                const updatedCourse = await updateCourse(name, coordinates, courseId);
                if (!updatedCourse) throw new GraphQLError('Course update failed for some reason');
                Log(`Course ${courseId} updated`, LogType.SUCCESS, LogContext.COURSE, context.user.id);
                return updatedCourse;
            }
            const course = await addCourse(name, coordinates, context.user.id);
            Log(`New course ${name} created`, LogType.SUCCESS, LogContext.COURSE, context.user.id);
            return course;
        },
        addLayout: async (_root: unknown, args: { courseId: string | number, layout: NewLayoutArgs }, context: ContextWithUser) => {
            const layout = await addLayout(args.courseId, { ...args.layout, creator: context.user.id }, context.user.id);
            Log(`New layout ${args.layout.name} created for ${layout.name}`, LogType.SUCCESS, LogContext.LAYOUT, context.user.id);
            return layout;
        },
        deleteCourse: async(_root: unknown, args: { courseId: ID }, context: ContextWithUser) => {
            const course = await getCourse(args.courseId);
            if (!course) throw new GraphQLError('Course not found');
            if (context.user.id !== course.creator?.toString() && !(await userService.isAdmin(context.user.id))) {
                throw new GraphQLError('Course was not created by you');
            }

            const layoutIds = course.layouts.map(layout => layout.id as ID);
            const numberOfGamesPlayedOnCourse = await countGamesPlayedOnLayouts(layoutIds);
            if (numberOfGamesPlayedOnCourse > 0) {
                throw new GraphQLError(`Found ${numberOfGamesPlayedOnCourse} games played on this course`);
            }

            if (await deleteCourse(args.courseId)) {
                Log(`Course ${course.name} deleted by ${context.user.name} (${context.user.id})`, LogType.SUCCESS, LogContext.COURSE);
                return true;
            } else {
                Log(`${context.user.name} (${context.user.id}) tried to delete course ${course.name} but it failed`, LogType.ERROR, LogContext.COURSE);
                return false;
            }
        }
    }
};
