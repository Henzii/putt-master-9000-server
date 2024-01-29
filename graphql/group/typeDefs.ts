import gql from "graphql-tag";

export default gql`
    type Group {
        id: ID!
        name: String!
        inviteCode: String!
        owner: User!
        users: [User!]!
        closed: Boolean!
        games: [Game!]!
        minNumberOfPlayers: Int!
    }

    input MutableSettings {
        closed: Boolean
        name: String
        minNumberOfPlayers: Int
    }

    type Query {
        getMyGroups(created: Boolean): [Group!]!
        getGroup(groupId: ID!): Group
    }

    type Mutation {
        createGroup(name: String!): Group
        changeGroupSettings(groupId: ID!, newSettings: MutableSettings): Group!
        connectGroupToGame(groupId: ID!, gameId: ID!): Boolean!
    }
`;