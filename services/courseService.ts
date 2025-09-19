import { Document } from "mongoose";
import CourseModel from "../models/Course";
import { Course, ID, NewLayoutArgs } from "../types";
import userService from "./userService";
import { GraphQLError } from "graphql";
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from "crypto";

type GetCoursesArgs = {
    limit: number,
    offset: number,
    search?: string,
    coordinates?: [number, number], // Player coordinates for distance calculation
    searchCoordinates?: [number, number] // Coordinates from which to search courses up to maxDistance
    maxDistance?: number
}

export async function getLayout(layoutId: ID) {
    const course = await CourseModel.findOne<Course>({ 'layouts._id': layoutId }).populate('layouts.teeSigns.uploadedBy', 'id name');
    const layout = course?.layouts.find(c => c.id === layoutId) ?? null;

    return layout;
}

export async function getCourseWithLayout(layout: ID) {
    const course = await CourseModel.findOne<Course & Document>({ 'layouts._id': layout });
    return course ?? null;
}

export async function getCourse(courseId: ID){
    try {
        const course = await CourseModel.findById(courseId) as Document & Course;
        return course;
    } catch {
        return null;
    }
}

export async function getCourses({ limit, offset, search, coordinates = [0, 0], maxDistance, searchCoordinates }: GetCoursesArgs) {
    const params = (search) ? { name: { $regex: search, $options: 'i' } } : {};
    const documents = await CourseModel.count(params);
    const kurssit = await CourseModel.find({
        ...params,
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: searchCoordinates ?? coordinates },
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
export async function addLayout(courseId: number | string, newLayout: NewLayoutArgs, userId: ID) {
    const course = await CourseModel.findById<Course & Document>(courseId);
    const isAdmin = await userService.isAdmin(userId);
    if (!course) {
        throw new GraphQLError('Course not found');
    }

    if (newLayout.id) {
        course.layouts = course.layouts.map(layout => {
            if (layout.id === newLayout.id) {
                if (layout.creator?.toString() === newLayout.creator || course.creator?.toString() === newLayout.creator || isAdmin) {
                    return {...layout, ...newLayout, _id: newLayout.id};
                }
                throw new GraphQLError('Error, layout not created by you!');
            }
            return layout;

        });
    } else {
        course.layouts.push(newLayout);
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

export const getTeeSignUploadSignature = (public_id?: string) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Environment variables for Cloudinary are not set');
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const publicId = public_id ?? randomUUID();
    const timestamp = Math.round(Date.now() / 1000);
    const folder = process.env.NODE_ENV === 'development' ? 'fudisc-tee-signs-dev' : 'fudisc-tee-signs';
    const params = {
        public_id: publicId,
        timestamp,
        overwrite: 'true',
        folder,
        invalidate: 'true',
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    return {
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
        publicId: publicId,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        timestamp,
        overwrite: 'true',
        folder,
        invalidate: 'true',
    };
};
