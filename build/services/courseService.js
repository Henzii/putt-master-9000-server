"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLayout = exports.addCourse = exports.getCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
function getCourses({ limit, offset, search }) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = (search) ? { name: { $regex: '.*' + search + '*.' } } : {};
        const documents = yield Course_1.default.count(params);
        const kurssit = yield Course_1.default.find(params).skip(offset).limit(limit);
        return { data: kurssit, count: documents, hasMore: (offset + limit < documents) };
    });
}
exports.getCourses = getCourses;
function addCourse(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const newCourse = new Course_1.default({
            name,
            layouts: [],
        });
        yield newCourse.save();
        return newCourse.id;
    });
}
exports.addCourse = addCourse;
function addLayout(courseId, layout) {
    return __awaiter(this, void 0, void 0, function* () {
        const course = yield Course_1.default.findById(courseId);
        course.layouts.push(layout);
        yield course.save();
        return course.layouts[course.layouts.length - 1].id;
    });
}
exports.addLayout = addLayout;
