import { gql } from "graphql-tag";

export const typeDefs = gql`
    type Subscription {
        test: String
        scorecardUpdated(gameId: ID!): TriggeredScorecard
    }
    type TriggeredScorecard {
        game: Game
        updatedScorecardPlayerId: ID
        updaterId: ID
    }
    type GetCoursesResponse {
        courses: [Course]!
        hasMore: Boolean!
        nextOffset: Int
        count: Int!
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
    type Location {
        coordinates: [Float!]!
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
    type Layout {
        id: ID!
        name: String
        pars: [Int]
        holes: Int
        names: [String]!
        par: Int
        canEdit: Boolean!
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
    }
    type Achievement {
        id: String!
        layout_id: String!
        game: Game
    }
    type SafeUser {
        id: ID!
        name: String!
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
    input NewLayout {
        name: String!
        pars: [Int]!
        holes: Int!
        names: [String]
        id: ID
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
    type SearchUserResponse {
        users: [SafeUser]!
        hasMore: Boolean!
    }
    type Query {
        """
        Palauttaa limit:n verran tietokannassa olevista radoista alkaen kohdasta offset.
        Tuloksia voi rajata antamalla search tai maxDistance argumentin.
        """
        getCourses(limit: Int!, offset: Int!, search: String, coordinates: [Float], maxDistance: Int): GetCoursesResponse
        getLayout(layoutId: ID!): Layout
        """
        Hakee yhden pelin.
        """
        getGame(gameId: ID!): Game 
        getLiveGame(gameId: ID!): Game
        """
        Listaa kirjautuneen käyttäjän pelaamat pelit
        """
        getGames(onlyOpenGames: Boolean, limit: Int, offset: Int, search: String): GetGamesResponse!
        ping: String
        """
        Kirjautunut käyttäjä
        """
        getMe: User
        getUsers: [User]!
        """
        Palauttaa väyläkohtaista tilastoa
        """
        getLayoutStats(layoutId: ID!, playersIds: [ID!]): [LayoutStats!]!
        """
        Palauttaa ratakohtaista tilastoatietoa kirjautuneeesta käyttäjästä.
        """
        getHc (course: String!, layout: String!, userIds: [String]): [GetHcResponse]!
        """
        Hakee search hakusanalla käyttäjiä ja palauttaa listan (max 10) SafeUsereita (vain id ja nimi) sekä
        booleanin siitä onko hakutuloksia mahdollisesti lisää -> tuleeko hakua tarkentaa.
        Mikäli käyttäjä on blokannut kaveripyynnöt, ei häntä näy hakutuloksissa
        """
        searchUser(search: String!): SearchUserResponse!
        handShake: HandshakeResponse!
        """
        Hakee omat ja kavereiden pelit joissa annettu pelaajamäärä ylittyy, rajataan vuoden mukaan
        """
        getAllGames(minPlayerCount: Int!, filterYear: Int!): [Game]!
    }

    type Mutation {
        addCourse(name: String!, coordinates: InputLocation): Course!
        addLayout(courseId: ID!, layout: NewLayout!): Course!

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
        changeSettings(blockFriendRequests: Boolean, password: String, blockStatsSharing: Boolean): User

        restoreAccount(name: String, restoreCode: String, password: String): Boolean

    }
`;