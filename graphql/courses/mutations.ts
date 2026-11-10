import { addCourse, addLayout, deleteCourse, getCourse, getCourseWithLayout, getTeeSignUploadSignature, updateCourse } from "../../services/courseService";
import { ContextWithUser, ID, Layout, NewLayoutArgs } from "../../types";
import { GraphQLError } from 'graphql';
import userService from '../../services/userService';
import { countGamesPlayedOnLayouts } from '../../services/gameService';
import { log as logEvent } from '../../services/logServiceV2';

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
                    logEvent(
                        'course.update',
                        `Course (${name}, ${courseId}) change denied (not the owner)`,
                        'WARN'
                    );
                    throw new GraphQLError('You can only edit courses you have created');
                }

                const updatedCourse = await updateCourse(name, coordinates, courseId);
                if (!updatedCourse) throw new GraphQLError('Course update failed for some reason');
                logEvent('course.update', `Course ${updatedCourse.name} (${courseId}) updated by ${context.user.name} (${context.user.id})`);
                return updatedCourse;
            }
            const course = await addCourse(name, coordinates, context.user.id);
            logEvent('course.create', `New course ${name} created by ${context.user.name} (${context.user.id})`);
            return course;
        },
        addLayout: async (_root: unknown, args: { courseId: string | number, layout: NewLayoutArgs }, context: ContextWithUser) => {
            const layout = await addLayout(args.courseId, { ...args.layout, creator: context.user.id }, context.user.id);
            logEvent('course.update', `New layout ${args.layout.name} created for ${layout.name} by ${context.user.name} (${context.user.id})`);
            return layout;
        },
        deleteCourse: async(_root: unknown, args: { courseId: ID }, context: ContextWithUser) => {
            const course = await getCourse(args.courseId);
            if (!course) throw new GraphQLError('Course not found');
            if (context.user.id !== course.creator?.toString() && !(await userService.isAdmin(context.user.id))) {
                logEvent('course.delete', `Course ${course.name} delete denied (not the owner) by ${context.user.name} (${context.user.id})`, 'WARN');
                throw new GraphQLError('Course was not created by you');
            }

            const layoutIds = course.layouts.map(layout => layout.id as ID);
            const numberOfGamesPlayedOnCourse = await countGamesPlayedOnLayouts(layoutIds);
            if (numberOfGamesPlayedOnCourse > 0) {
                logEvent('course.delete', `Course ${course.name} delete denied (games played on course) by ${context.user.name} (${context.user.id})`, 'WARN');
                throw new GraphQLError(`Found ${numberOfGamesPlayedOnCourse} games played on this course`);
            }

            if (await deleteCourse(args.courseId)) {
                logEvent('course.delete', `Course ${course.name} deleted by ${context.user.name} (${context.user.id})`);
                return true;
            } else {
                logEvent('course.delete', `${context.user.name} (${context.user.id}) tried to delete course ${course.name} but it failed`, 'ERROR');
                return false;
            }
        },
        getTeeSignUploadSignature: async (_root: unknown, args: { layoutId: ID, holeNumber: number }, context: ContextWithUser) => {
            const { layoutId, holeNumber } = args;
            const userId = context.user.id;

            const course = await getCourseWithLayout(layoutId);
            if (!course) {
                throw new GraphQLError('Course not found');
            }
            const layout = course?.layouts.find(l => l.id?.toString() === layoutId.toString());
            if (!layout) {
                throw new GraphQLError('Layout not found');
            }

            if (holeNumber < 0 || holeNumber >= layout.holes) {
                throw new GraphQLError('holeNumber out of bounds');
            }

            const teeSign = layout.teeSigns.find(teeSign => teeSign.index === holeNumber);
            const wasUploadedByUser = teeSign?.uploadedBy?.toString() === userId;

            const canUpload =
                !teeSign || // If tee sign does not exist, anyone can upload
                wasUploadedByUser || // If tee sign exists, the original uploader can re-upload
                course.creator?.toString() === userId || // Course creator can always upload
                layout.creator?.toString() === userId || // Layout creator can always upload
                await userService.isAdmin(userId); // Admins do what they want

            if (!canUpload) {
                logEvent(
                    'course.update',
                    `Tee sign upload denied for layout ${layoutId} (not the owner)`,
                    'WARN'
                );
                throw new GraphQLError('You can only re-upload tee signs that you uploaded, or if you are the course/layout creator.');
            }

            try {
                const signature = getTeeSignUploadSignature(teeSign?.publicId);
                const updatedTeeSign: Layout['teeSigns'][number] = {
                    index: holeNumber,
                    publicId: signature.publicId,
                    uploadedAt: signature.timestamp.toString(),
                    uploadedBy: userId
                };

                const currentTeeSigns = layout.teeSigns || [];
                layout.teeSigns = [...currentTeeSigns.filter(ts => ts.index !== holeNumber), updatedTeeSign];

                await course.save();

                return signature;
            } catch {
                logEvent(
                    'course.update',
                    `Tee sign upload signature generation failed for layout ${layoutId}`,
                    'ERROR'
                );
                throw new GraphQLError('Could not get upload signature, please try again later');
            }
        }
    }
};
