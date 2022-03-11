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
        """
        Username
        """
        name: String!
        email: String
        friends: [User!]
        blockFriendRequests: Boolean
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
        id: ID!
        user: User
        scores: [Int]
        total: Int
        beers: Int
        plusminus: Int
        hc: Float
    }
    input NewLayout {
        name: String!
        pars: [Int]!
        holes: Int!
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
    
    type Query {
        """
        Palauttaa limit:n verran tietokannassa olevista radoista alkaen kohdasta offset.
        Tuloksia voi rajata antamalla search argumentin
        """
        getCourses(limit: Int!, offset: Int!, search: String): GetCoursesResponse
        """
        Hakee yhden pelin.
        """
        getGame(gameId: ID!): Game 
        """
        Listaa kirjautuneen käyttäjän pelaamat pelit
        """
        getGames: [Game]
        ping: String
        """
        Kirjautunut käyttäjä
        """
        getMe: User
        getUsers: [User]!
        """
        Palauttaa ratakohtaista tilastoatietoa kirjautuneeesta käyttäjästä.
        """
        getHc (course: String!, layout: String!): [GetHcResponse]!
    }

    type Mutation {
        addCourse(name: String!): Course!
        addLayout(courseId: ID!, layout: NewLayout!): Course!

        createGame(courseId: ID!, layoutId: ID!): ID!
        addPlayersToGame(gameId: ID!, playerIds: [ID!]!): Game
        setScore(gameId: ID!, playerId: ID!, hole: Int!, value: Int!): Game
        abandonGame(gameId: ID!): Boolean
        closeGame(gameId: ID!): Game
        setBeersDrank(gameId: ID!, playerId: ID!, beers: Int!): UpdatedScorecard

        createUser(name: String!, password: String!, email: String): String
        login(user: String!, password: String!, pushToken: String): String!
        addFriend(friendId: ID, friendName: String): Boolean
        removeFriend(friendId: ID!): Boolean
        deleteAccount: Boolean
        changeSettings(blockFriendRequests: Boolean): User
    }
`;