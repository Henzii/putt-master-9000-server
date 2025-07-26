import gql from "graphql-tag";

export default gql`
    type GetHcResponse {
        id: ID
        games: Int
        scores: [Int]
        hc: Float
    }
    type Activity {
        month: Int!
        games: Int!
    }
    type ActivityResponse {
        from: String!
        to: String!
        months: [Activity]!
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
        groupJoinedDate: String
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
    type UserWithoutGames {
        id: ID!
        name: String!
        createdAt: String
    }
    type SearchUserResponse {
        users: [SafeUser]!
        hasMore: Boolean!
    }

    type Query {
        getMe: User
        getUsersWithoutGames: [UserWithoutGames!]!
        getUsers: [User]!
        getUser (userId: ID!): User
        searchUser(search: String!): SearchUserResponse!
        getPastActivity(userId: ID, year: Int): ActivityResponse!
        getHc (layoutId: ID!, userIds: [String]): [GetHcResponse]!
        """
        Return the members of user's group. Admins can specify a group name to get members of that group.
        """
        getGroupMembers(groupName: String): [SafeUser]!
    }

    type Mutation {
        createUser(name: String!, password: String!, email: String, pushToken: String): String
        addFriend(friendId: ID, friendName: String): Boolean
        removeFriend(friendId: ID!): Boolean
        login(user: String!, password: String!, pushToken: String): String!
        deleteAccount: Boolean
        changeSettings(blockFriendRequests: Boolean, password: String, blockStatsSharing: Boolean, userId: ID, groupName: String, email: String, groupJoinedDate: String): User
        changeUsername(newUsername: String!): User!
        restoreAccount(name: String, restoreCode: String, password: String): Boolean
    }
`;