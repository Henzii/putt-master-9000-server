import { Document } from "mongoose";
import CourseModel from "../models/Course";
import { Course, NewLayoutArgs } from "../types";
export async function getCourses({ limit, offset, search }: { limit: number, offset: number, search?: string }) {
    const params = (search) ? { name: { $regex: '.*' + search + '*.' }} : {};
    const documents = await CourseModel.count(params);
    const kurssit = await CourseModel.find(params).skip(offset).limit(limit);
    return { data: kurssit, count: documents, hasMore: (offset + limit < documents)};

}
export async function addCourse(name: string) {
    const newCourse = new CourseModel({
        name,
        layouts: [],
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
