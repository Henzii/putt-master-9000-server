import gql from "graphql-tag";

export default gql`
    type RagePuttScorecard {
        id: ID!
        user: SafeUser!
        scores: [Int]
        points: Int
    }
    type RagePuttGame {
        id: ID!
        startTime: String!
        endTime: String
        scorecards: [RagePuttScorecard!]!
        isFinished: Boolean!
        mode: String! 
    }

    type Mutation {
        createRagePuttGame(mode: String = "default", playerIds: [ID!]!): ID!
        updateRagePuttScorecard(gameId: ID!, playerId: ID!, scores: [Int]): RagePuttScorecard!
        deleteRagePuttGame(gameId: ID!): Boolean!
    }

    type Query {
        getRagePuttGame(gameId: ID!): RagePuttGame
        getRagePuttGames: [RagePuttGame!]!
    }
`;