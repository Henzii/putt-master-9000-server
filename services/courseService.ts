import { Document } from "mongoose";
import CourseModel from "../models/Course";
import { Course, ID, NewLayoutArgs } from "../types";
import userService from "./userService";
import { GraphQLError } from "graphql";

type getCoursesArgs = {
    limit: number,
    offset: number,
    search?: string,
    coordinates?: [number, number],
    maxDistance?: number
}

export async function getLayout(layoutId: ID) {
    const course = await CourseModel.findOne<Course>({ 'layouts._id': layoutId });
    return course?.layouts.find(c => c.id === layoutId) ?? null;
}

export async function getCourse(courseId: ID){
    try {
        const course = await CourseModel.findById(courseId) as Document & Course;
        return course;
    } catch {
        return null;
    }
}

export async function getCourses({ limit, offset, search, coordinates = [0, 0], maxDistance }: getCoursesArgs) {
    const params = (search) ? { name: { $regex: search, $options: 'i' } } : {};
    const documents = await CourseModel.count(params);
    const kurssit = await CourseModel.find({
        ...params,
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: coordinates },
                ...(maxDistance ? { $maxDistance: maxDistance } : null)
            }
        }
    }
    ).skip(offset).limit(limit);
    return { data: kurssit, count: documents, hasMore: (offset + limit < documents) };

}

export async function updateCourse(name: string, coordinates: {lat: number, lon: number} | undefined, courseId: ID) {
    try {
        return await CourseModel.findByIdAndUpdate(courseId, {
            name,
            location: coordinates ? {type: 'Point', coordinates: [coordinates?.lon || 0, coordinates?.lat || 0]} : undefined
        }, {returnDocument: 'after'});
    } catch (e) {
        return null;
    }
}
export async function addCourse(name: string, coordinates: { lat: number, lon: number } | undefined, creator: ID) {
    const newCourse = new CourseModel({
        name,
        layouts: [],
        location: {
            coordinates: [coordinates?.lon || 0, coordinates?.lat || 0]
        },
        creator,
    });
    await newCourse.save();
    return newCourse;
}
export async function addLayout(courseId: number | string, layout: NewLayoutArgs, userId: ID) {
    const course = await CourseModel.findById(courseId) as Document & Course;
    const isAdmin = await userService.isAdmin(userId);
    // Jos layoutilla on jo id, kyseessä muokkaus, ei lisäys...
    if (layout.id) {
        course.layouts = course.layouts.map(lo => {
            if (lo.id === layout.id) {
                if (lo.creator?.toString() === layout.creator || course.creator?.toString() === layout.creator || isAdmin) {
                    return {...layout, _id: layout.id};
                }
                throw new GraphQLError('Error, layout not created by you!');
            }
            return lo;

        });
    } else {
        course.layouts.push(layout);
    }
    await course.save();
    return course;
}

export const deleteCourse = async (courseId: ID) => {
    try {
        await CourseModel.findByIdAndRemove(courseId);
        return true;
    } catch (e) {
        return false;
    }
};

