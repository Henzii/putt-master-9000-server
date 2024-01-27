import gql from "graphql-tag";

export default gql`
    type Group {
        name: String!
        inviteCode: String!
        owner: User!
        users: [User!]!
        closed: Boolean!
        games: [Game!]!
    }

    type Query {
        createGroup(name: String!): Group
        getMyGroups(created: Boolean): [Group!]!
    }
`;