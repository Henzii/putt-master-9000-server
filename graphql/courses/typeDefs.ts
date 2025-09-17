import gql from "graphql-tag";

export default gql`
    type BestPoolForLayoutResponse {
        game: Game!
        totalPar: Int!
        totalScore: Int!
        gamesCount: Int!
    }
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
        teeSigns: [TeeSign!]
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

    type TeeSign {
        index: Int!
        publicId: String!
        url: String!
        uploadedAt: String!
        uploadedBy: SafeUser!
    }

    type TeeSignUploadSignature {
        signature: String!
        apiKey: String!
        publicId: String!
        cloudName: String!
        timestamp: Int!
        overwrite: String!
        folder: String!
        invalidate: String!
    }

    type Query {
        getCourses(limit: Int!, offset: Int!, search: String, coordinates: [Float], maxDistance: Int, searchCoordinates: [Float]): GetCoursesResponse
        getLayout(layoutId: ID!): Layout
        getLayoutStats(layoutId: ID!, playersIds: [ID!]): [LayoutStats!]!
        getBestPoolForLayout(players: Int!, layoutId: ID!): BestPoolForLayoutResponse
    }

    type Mutation {
        addCourse(name: String!, coordinates: InputLocation, courseId: ID): Course!
        addLayout(courseId: ID!, layout: NewLayout!): Course!
        deleteCourse(courseId: ID!): Boolean!

        getTeeSignUploadSignature(layoutId: ID!, holeNumber: Int!): TeeSignUploadSignature!
    }
`;