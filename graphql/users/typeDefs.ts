import gql from "graphql-tag";

export default gql`
    type UserWithoutGames {
        id: ID!
        name: String!
        createdAt: String
    }

    type Query {
        getUsersWithoutGames: [UserWithoutGames!]!
    }
`;