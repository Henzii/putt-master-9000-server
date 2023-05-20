import { Document } from "mongoose";
import CourseModel from "../models/Course";
import { Course, ID, NewLayoutArgs } from "../types";

type getCoursesArgs = {
    limit: number,
    offset: number,
    search?: string,
    coordinates?: [number, number],
    maxDistance?: number
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
export async function addCourse(name: string, coordinates: { lat: number, lon: number }, creator: ID) {
    const newCourse = new CourseModel({
        name,
        layouts: [],
        location: {
            coordinates: [coordinates.lon, coordinates.lat]
        },
        creator,
    });
    await newCourse.save();
    return newCourse;
}
export async function addLayout(courseId: number | string, layout: NewLayoutArgs) {
    const course = await CourseModel.findById(courseId) as Document & Course;
    // Jos layoutilla on jo id, kyseessä muokkaus, ei lisäys...
    if (layout.id) {
        course.layouts = course.layouts.map(lo => {
            if (lo.id === layout.id) {
                if (lo.creator?.toString() !== layout.creator && course.creator?.toString() !== layout.creator) {
                    throw new Error('Error, layout not created by you!');
                }
                else return {...layout, _id: layout.id};
            }
            return lo;

        });
    } else {
        course.layouts.push(layout);
    }
    await course.save();
    return course;
}
