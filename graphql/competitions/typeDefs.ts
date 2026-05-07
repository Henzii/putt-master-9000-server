import gql from "graphql-tag";

export default gql`
    type Competition {
        id: ID!
        name: String!
        date: String!
        time: String!
        playerCount: Int!
        courseName: String!
        courseId: ID
    }

    extend type Query {
        getWeekliesNearMe(coordinates: [Float!]!, maxDistance: Int, date: String, countryCode: String): [Competition!]!
    }
`;
