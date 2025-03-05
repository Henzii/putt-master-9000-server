import gql from "graphql-tag";

export default gql`
    type GetGamesResponse {
        games: [Game]!
        hasMore: Boolean!
        nextOffset: Int
        count: Int!
    }
    type Game {
        id: ID!
        course: String!
        startTime: String!
        endTime: String
        layout: String!
        layout_id: ID!
        holes: Int!
        pars: [Int!]
        par: Int
        date: String!
        myScorecard: Scorecard
        scorecards: [Scorecard!]!
        isOpen: Boolean
        groupName: String
        bHcMultiplier: Float!
    }

    type Scorecard {
        id: ID!
        user: SafeUser
        scores: [Int]
        total: Int
        beers: Int
        plusminus: Int

        hc: Float
        bHc: Float
        hcTotal: Float
        hcPlusminus: Float
    }
    input GameSettings {
        isOpen: Boolean,
        startTime: String
    }
    type UpdatedScorecard {
        user: ID!
        scorecard: Scorecard
    }

    type Query {
        getGame(gameId: ID!): Game 
        getLiveGame(gameId: ID!): Game
        getLiveGames: [Game!]!
        getGames(onlyOpenGames: Boolean, limit: Int, offset: Int, search: String, onlyGroupGames: Boolean, from: String, to: String): GetGamesResponse!
        getAllGames(minPlayerCount: Int!, filterYear: Int!): [Game]!
        getGroupGames(minPlayerCount: Int!, filterYear: Int!): [Game]!
    }
    
    type Mutation {
        createGame(courseId: ID!, layoutId: ID!, isGroupGame: Boolean, bHcMultiplier: Float): ID!
        addPlayersToGame(gameId: ID!, playerIds: [ID!]!): Game
        setScore(gameId: ID!, playerId: ID!, hole: Int!, value: Int!): Game!
        abandonGame(gameId: ID!): Boolean
        closeGame(gameId: ID!, reopen: Boolean): Game
        setBeersDrank(gameId: ID!, playerId: ID!, beers: Int!): UpdatedScorecard
        changeGameSettings(gameId: ID!, settings: GameSettings!): Game
    }
`;