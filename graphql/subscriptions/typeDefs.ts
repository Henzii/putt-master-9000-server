import gql from "graphql-tag";

export default gql`
type TriggeredGame {
    game: Game!
    updaterId: ID!
}

type TriggeredScorecard {
    game: Game
    updatedScorecardPlayerId: ID
    updaterId: ID
}

type Subscription {
    test: String
    """
    Deprecated
    """
    scorecardUpdated(gameId: ID!): TriggeredScorecard
    gameUpdated(gameId: ID!): TriggeredGame
}
`;