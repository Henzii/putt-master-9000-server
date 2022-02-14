import { gql } from "apollo-server";

export const typeDefs = gql`
    type GetCoursesResponse {
        courses: [Course]!
        hasMore: Boolean!
        nextOffset: Int
        count: Int!
    }
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
        email: String
        friends: [User!]
    }
    type Game {
        id: ID!
        course: String!
        layout: String!
        holes: Int!
        pars: [Int!]
        par: Int
        date: String!
        myScorecard: Scorecard
        scorecards: [Scorecard!]!
        isOpen: Boolean
    }
    type Scorecard {
        user: User
        scores: [Int]
        total: Int
        beers: Int
        plusminus: Int
    }
    input NewLayout {
        name: String!
        pars: [Int]!
        holes: Int!
    }
    type Query {
        getCourses(limit: Int!, offset: Int!, search: String): GetCoursesResponse

        getGame(gameId: ID!): Game
        getGames: [Game]
        ping: String

        getMe: User
        getUsers: [User]!
    }

    type Mutation {
        addCourse(name: String!): ID!
        addLayout(courseId: ID!, layout: NewLayout!): ID!

        createGame(courseId: ID!, layoutId: ID!): ID!
        addPlayersToGame(gameId: ID!, playerIds: [ID!]!): Game
        setScore(gameId: ID!, playerId: ID!, hole: Int!, value: Int!): Game
        closeGame(gameId: ID!): Game
        setBeersDrank(gameId: ID!, beers: Int!): Game

        createUser(name: String!, password: String!, email: String): String
        login(user: String!, password: String!): String!
        addFriend(friendId: ID, friendName: String): Boolean
    }
`;