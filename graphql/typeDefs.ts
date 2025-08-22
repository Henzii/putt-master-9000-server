import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar Date

  type HandshakeResponse {
    latestVersion: Int!
  }
  type LogEntry {
    message: String!
    type: String!
    context: String!
    user: User
    createdAt: String!
  }

  type Query {
    ping: String
    handShake(pushToken: String): HandshakeResponse!
    getLogs: [LogEntry]
  }

  type Mutation {
    sendFeedback(email: String, subject: String!, text: String!): Boolean
  }
`;
