import { Course, Layout, NewLayoutArgs } from "../types"

export function getCourses() {
    return courses;
}
export function addCourse(name: string) {
    const id = Math.floor(Math.random() * 9999);
    courses.push({
        name,
        id,
        layouts: []
    })
    return id;
}

export function addLayout(courseId: number | string, layout: NewLayoutArgs) {
    const id = Math.floor(Math.random() * 9999);
    const kurssi = courses.find(c => c.id == courseId)
    if (!kurssi) return null;
    kurssi.layouts.push({ ...layout, id })
    return id;
}
const courses: Course[] = [
    {
        name: 'Malminiitty',
        id: 1,
        layouts: [
            {
                name: 'Main',
                holes: 9,
                id: 3,
                pars: [3, 3, 3, 3, 3, 3, 3, 3, 3]
            },
            {
                name: '2x Malmari',
                holes: 18,
                id: 4,
                pars: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
            }
        ]
    },
    {
        name: 'Siltamäki',
        id: 2,
        layouts: [
            {
                name: 'Main',
                holes: 18,
                id: 5,
                pars: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2]
            }
        ]
    }
]

