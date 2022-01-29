import { Document } from "mongoose";
import mongoose from 'mongoose';
import CourseModel from "../models/Course";
import { Course, Layout, NewLayoutArgs } from "../types"

export async function getCourses({name, courseId}: { name?: string, courseId?: string }) {
    if (courseId) return  [ await CourseModel.findById(courseId)];
    else if (name) {
        return await CourseModel.find({ name: { $regex: '.*' + name + '.*' }})
    }
    return await CourseModel.find({})
}
export async function addCourse(name: string) {
    const newCourse = new CourseModel({
        name,
        layouts: [],
    });
    await newCourse.save();
    return newCourse.id;
}
export async function addLayout(courseId: number | string, layout: NewLayoutArgs) {
    const course = await CourseModel.findById(courseId) as Document & Course
    course.layouts.push(layout);
    await course.save();
    return course.layouts[course.layouts.length-1].id;
}