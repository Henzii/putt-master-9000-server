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
    type User {
        id: ID!
        """
        Username
        """
        name: String!
        email: String
        friends: [User!]
        blockFriendRequests: Boolean
        blockStatsSharing: Boolean
        achievements: [Achievement]!
        accountType: String
        groupName: String
    }
    type Achievement {
        id: String!
        layout_id: String!
        game: Game
    }
    type SafeUser {
        id: ID!
        name: String!
        groupName: String
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
    type SearchUserResponse {
        users: [SafeUser]!
        hasMore: Boolean!
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
        getGames(onlyOpenGames: Boolean, limit: Int, offset: Int, search: String): GetGamesResponse!
        ping: String
        """
        Kirjautunut käyttäjä
        """
        getMe: User
        """
        Palauttaa kaikki käyttäjät. Admin only.
        """
        getUsers: [User]!
        getUser (userId: ID!): User
        """
        Palauttaa ratakohtaista tilastoatietoa kirjautuneeesta käyttäjästä.
        """
        getHc (layoutId: ID!, userIds: [String]): [GetHcResponse]!
        """
        Hakee search hakusanalla käyttäjiä ja palauttaa listan (max 10) SafeUsereita (vain id ja nimi) sekä
        booleanin siitä onko hakutuloksia mahdollisesti lisää -> tuleeko hakua tarkentaa.
        Mikäli käyttäjä on blokannut kaveripyynnöt, ei häntä näy hakutuloksissa
        """
        searchUser(search: String!): SearchUserResponse!
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
        createGame(courseId: ID!, layoutId: ID!): ID!
        addPlayersToGame(gameId: ID!, playerIds: [ID!]!): Game
        setScore(gameId: ID!, playerId: ID!, hole: Int!, value: Int!): Game!
        abandonGame(gameId: ID!): Boolean
        closeGame(gameId: ID!, reopen: Boolean): Game
        setBeersDrank(gameId: ID!, playerId: ID!, beers: Int!): UpdatedScorecard
        changeGameSettings(gameId: ID!, settings: GameSettings!): Game
        createUser(name: String!, password: String!, email: String, pushToken: String): String
        login(user: String!, password: String!, pushToken: String): String!
        addFriend(friendId: ID, friendName: String): Boolean
        removeFriend(friendId: ID!): Boolean
        deleteAccount: Boolean
        changeSettings(blockFriendRequests: Boolean, password: String, blockStatsSharing: Boolean, userId: ID, groupName: String, email: String): User
        changeUsername(newUsername: String!): User!

        restoreAccount(name: String, restoreCode: String, password: String): Boolean

    }
`;