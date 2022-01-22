import { gql } from "apollo-server";

export const typeDefs = gql`
    type Course {
        id: ID!
        name: String!
        layouts: [Layout]!
    }
    type Layout {
        id: ID!
        name: String
        pars: [Int]
        holes: Int
        par: Int
    }
    type User {
        id: ID!
        name: String!
        friends: [User!]
    }
    type Game {
        id: ID!
        layout: Layout!
        date: String!
        scorecards: [Scorecard!]!
    }
    type Scorecard {
        id: ID!
        user: User!
        scores: [Int!]
    }
    input NewLayout {
        name: String!
        pars: [Int]!
        holes: Int!
    }
    type Query {
        getMe: User
        getCourses(name: String, id: Int): [Course]

        getGame(gameId: ID!): Game
        getGames: [Game]
        ping: String
    }

    type Mutation {
        login(user: String!, password: String!): String!
        addCourse(name: String!): ID!
        addLayout(courseId: ID!, layout: NewLayout!): ID!

        createGame(layoutId: ID!): ID!
    }
`;