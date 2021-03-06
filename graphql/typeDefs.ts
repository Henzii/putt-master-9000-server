import { gql } from "apollo-server";

export const typeDefs = gql`
    type Event {
        id: ID!
        name: String!
        date: String!
        course: String
        layout: String
        commnet: String
        invites: EventInvites
        registrationOpen: Boolean
        messages: [EventMessage]
        creator: ID!
    }
    type EventMessage {
        message: String!
        user: User!
    }
    type EventInvites {
        invited: [User]!
        rejected: [User]!
        accepted: [User]!
    }
    input CreateEventArgs {
        name: String!
        date: String!
        comment: String
    }
    type GetCoursesResponse {
        courses: [Course]!
        hasMore: Boolean!
        nextOffset: Int
        count: Int!
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
        """
        Username
        """
        name: String!
        email: String
        friends: [User!]
        blockFriendRequests: Boolean
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
    type SearchUserResponse {
        users: [SafeUser]!
        hasMore: Boolean!
    }
    type Query {
        """
        Palauttaa limit:n verran tietokannassa olevista radoista alkaen kohdasta offset.
        Tuloksia voi rajata antamalla search argumentin
        """
        getCourses(limit: Int!, offset: Int!, search: String, coordinates: [Float]): GetCoursesResponse
        """
        Hakee yhden pelin.
        """
        getGame(gameId: ID!): Game 
        getLiveGame(gameId: ID!): Game
        """
        Listaa kirjautuneen k??ytt??j??n pelaamat pelit
        """
        getGames(onlyOpenGames: Boolean): [Game]
        ping: String
        """
        Kirjautunut k??ytt??j??
        """
        getMe: User
        getUsers: [User]!
        """
        Palauttaa ratakohtaista tilastoatietoa kirjautuneeesta k??ytt??j??st??.
        """
        getHc (course: String!, layout: String!): [GetHcResponse]!
        """
        Hakee search hakusanalla k??ytt??ji?? ja palauttaa listan (max 10) SafeUsereita (vain id ja nimi) sek??
        booleanin siit?? onko hakutuloksia mahdollisesti lis???? -> tuleeko hakua tarkentaa.
        Mik??li k??ytt??j?? on blokannut kaveripyynn??t, ei h??nt?? n??y hakutuloksissa
        """
        searchUser(search: String!): SearchUserResponse!

        getEvents: [Event]
    }

    type Mutation {
        addCourse(name: String!, coordinates: InputLocation): Course!
        addLayout(courseId: ID!, layout: NewLayout!): Course!

        createGame(courseId: ID!, layoutId: ID!): ID!
        addPlayersToGame(gameId: ID!, playerIds: [ID!]!): Game
        setScore(gameId: ID!, playerId: ID!, hole: Int!, value: Int!): Game
        abandonGame(gameId: ID!): Boolean
        closeGame(gameId: ID!, reopen: Boolean): Game
        setBeersDrank(gameId: ID!, playerId: ID!, beers: Int!): UpdatedScorecard
        changeGameSettings(gameId: ID!, settings: GameSettings!): Game
        createUser(name: String!, password: String!, email: String, pushToken: String): String
        login(user: String!, password: String!, pushToken: String): String!
        addFriend(friendId: ID, friendName: String): Boolean
        removeFriend(friendId: ID!): Boolean
        deleteAccount: Boolean
        changeSettings(blockFriendRequests: Boolean, password: String): User

        restoreAccount(name: String, restoreCode: String, password: String): Boolean

        createEvent(event: CreateEventArgs!): Event
    }
`;