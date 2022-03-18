import { Document } from "mongoose";
import CourseModel from "../models/Course";
import { Course, NewLayoutArgs } from "../types";

type getCoursesArgs = {
    limit: number,
    offset: number,
    search?: string,
    coordinates?: [number, number]
}

export async function getCourses({ limit, offset, search, coordinates = [0, 0] }: getCoursesArgs) {
    const params = (search) ? { name: { $regex: search, $options: 'i' } } : {};
    const documents = await CourseModel.count(params);
    const kurssit = await CourseModel.find({
        ...params,
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: coordinates },
            }
        }
    }
    ).skip(offset).limit(limit);
    return { data: kurssit, count: documents, hasMore: (offset + limit < documents) };

}
export async function addCourse(name: string, coordinates: { lat: number, lon: number }) {
    const newCourse = new CourseModel({
        name,
        layouts: [],
        location: {
            coordinates: [coordinates.lon, coordinates.lat]
        },
    });
    await newCourse.save();
    return newCourse;
}
export async function addLayout(courseId: number | string, layout: NewLayoutArgs) {
    const course = await CourseModel.findById(courseId) as Document & Course;
    course.layouts.push(layout);
    await course.save();
    return course;
}
