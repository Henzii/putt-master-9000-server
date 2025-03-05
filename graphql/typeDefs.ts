import { gql } from "graphql-tag";

export const typeDefs = gql`
    type Activity {
        month: Int!
        games: Int!
    }
    type ActivityResponse {
        from: String!
        to: String!
        months: [Activity]!
    }
    type GetGamesResponse {
        games: [Game]!
        hasMore: Boolean!
        nextOffset: Int
        count: Int!
    }
    type HandshakeResponse {
        latestVersion: Int!
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
    type GetHcResponse {
        id: ID
        games: Int
        scores: [Int]
        hc: Float
    }
    type BestPoolForLayoutResponse {
        game: Game!
        totalPar: Int!
        totalScore: Int!
        gamesCount: Int!
    }

    type LogEntry {
        message: String!
        type: String!
        context: String!
        user: User
        createdAt: String!
    }

    type Query {
        """
        Hakee yhden pelin.
        """
        getGame(gameId: ID!): Game 
        getLiveGame(gameId: ID!): Game
        """
        Palautaa avoimet pelit joissa pelaa vähintään yksi kaveri
        """
        getLiveGames: [Game!]!
        """
        Listaa kirjautuneen käyttäjän pelaamat pelit
        """
        getGames(onlyOpenGames: Boolean, limit: Int, offset: Int, search: String, onlyGroupGames: Boolean, from: String, to: String): GetGamesResponse!
        ping: String
        """
        Palauttaa ratakohtaista tilastoatietoa kirjautuneeesta käyttäjästä.
        """
        getHc (layoutId: ID!, userIds: [String]): [GetHcResponse]!
        handShake(pushToken: String): HandshakeResponse!
        """
        Hakee omat ja kavereiden pelit joissa annettu pelaajamäärä ylittyy, rajataan vuoden mukaan
        """
        getAllGames(minPlayerCount: Int!, filterYear: Int!): [Game]!
        getGroupGames(minPlayerCount: Int!, filterYear: Int!): [Game]!
        getBestPoolForLayout(players: Int!, layoutId: ID!): BestPoolForLayoutResponse
        """
        Ei vuosilukua = viimeiset 12 kuukautta.
        """
        getPastActivity(userId: ID, year: Int): ActivityResponse!
        getLogs: [LogEntry]
    }

    type Mutation {
        createGame(courseId: ID!, layoutId: ID!, isGroupGame: Boolean, bHcMultiplier: Float): ID!
        addPlayersToGame(gameId: ID!, playerIds: [ID!]!): Game
        setScore(gameId: ID!, playerId: ID!, hole: Int!, value: Int!): Game!
        abandonGame(gameId: ID!): Boolean
        closeGame(gameId: ID!, reopen: Boolean): Game
        setBeersDrank(gameId: ID!, playerId: ID!, beers: Int!): UpdatedScorecard
        changeGameSettings(gameId: ID!, settings: GameSettings!): Game
        sendFeedback(email: String, subject: String!, text: String!): Boolean
    }
`;