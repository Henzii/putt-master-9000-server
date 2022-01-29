"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_1 = require("apollo-server");
exports.typeDefs = (0, apollo_server_1.gql) `
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
        date: String!
        scorecards: [Scorecard!]!
        isOpen: Boolean
    }
    type Scorecard {
        user: User
        scores: [Int]
    }
    input NewLayout {
        name: String!
        pars: [Int]!
        holes: Int!
    }
    type Query {
        getCourses(name: String, courseId: ID): [Course]

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

        createUser(name: String!, password: String!, email: String): ID
        login(user: String!, password: String!): String!
        addFriend(friendId: ID, friendName: String): Boolean
    }
`;
