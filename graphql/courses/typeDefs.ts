import gql from "graphql-tag";

export default gql`
    type Location {
        coordinates: [Float!]!
    }
    type GetCoursesResponse {
        courses: [Course]!
        hasMore: Boolean!
        nextOffset: Int
        count: Int!
    }
    input InputLocation {
        lat: Float!
        lon: Float!
    }
    type Distance {
        meters: Int!
        string: String!
    }
    type Course {
        id: ID!
        name: String!
        location: Location
        layouts: [Layout]!
        distance: Distance
        canEdit: Boolean!
    }
    input NewLayout {
        name: String!
        pars: [Int]!
        holes: Int!
        names: [String]
        deprecated: Boolean
        id: ID
    }
    type Layout {
        id: ID!
        name: String
        pars: [Int]
        holes: Int
        names: [String]!
        par: Int
        canEdit: Boolean!
        deprecated: Boolean!
    }
    type HoleStats {
        index: Int!
        total: Int!
        count: Int!
        best: Int!
        eagle: Int!
        birdie: Int!
        par: Int!
        bogey: Int!
        doubleBogey: Int!
        average: Float!
    }
    type LayoutStats {
        playerId: ID
        games: Int
        best: Int
        hc: Float
        holes: [HoleStats]
    }

    type Query {
        getCourses(limit: Int!, offset: Int!, search: String, coordinates: [Float], maxDistance: Int): GetCoursesResponse
        getLayout(layoutId: ID!): Layout
        getLayoutStats(layoutId: ID!, playersIds: [ID!]): [LayoutStats!]!
    }

    type Mutation {
        addCourse(name: String!, coordinates: InputLocation): Course!
        addLayout(courseId: ID!, layout: NewLayout!): Course!
        deleteCourse(courseId: ID!): Boolean!
    }
`;