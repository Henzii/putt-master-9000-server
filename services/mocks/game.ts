import { Game, Scorecard } from "../../types";

type MockedGame = Partial<Game> & {
    scorecards?: Partial<Scorecard>[]
}

const game: MockedGame =
    {
        id: 'mockedGame',
        pars: [3,3,3,3,3,3,3,3,3],
        layout_id: '61ffbbc9dc4b6f65e2514ee9',
        scorecards: [
            {
                id: 'card1',
                scores: [3,3,3,3,3,3,3,3,3],
                plusminus: 0,
                beers: 0,
                hc: 0,
                pars: [],
                median10: 0,
                user: {
                    id: 'player1',
                    name: 'User1',
                    passwordHash: '',
                    email: '',
                    friends: [],
                    blockFriendRequests: false,
                }
            },
            {
                id: 'card2',
                scores: [4,4,4,4,4,4,4,4,4],
                plusminus: 0,
                beers: 0,
                hc: 0,
                pars: [],
                median10: 0,
                user: {
                    id: 'player2',
                    name: 'User2',
                    passwordHash: '',
                    email: '',
                    friends: [],
                    blockFriendRequests: false,
                }
            }
        ]
    }


export default game as Game;