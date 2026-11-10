import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar Date

  type HandshakeResponse {
    latestVersion: Int!
  }

  type Query {
    ping: String
    handShake(pushToken: String): HandshakeResponse!
  }

  type Mutation {
    sendFeedback(email: String, subject: String!, text: String!): Boolean
  }
`;
