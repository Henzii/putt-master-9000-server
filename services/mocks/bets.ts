import { Pool } from "../../graphql/games/types";

export const mockedPool: Pool = {
    type: "WINNER",
    bets: [
        {
            totalStake: 50,
            user: {
                id: 'a00000000000000000000001'
            },
            selections: [1],
            lines: [
                {
                    stake: 50,
                    line: [
                        {
                            leg: 1,
                            selection: 1
                        }
                    ]
                }
            ]
        },
        {
            totalStake: 30,
            user: {
                id: 'a00000000000000000000002'
            },
            selections: [2],
            lines: [
                {
                    stake: 30,
                    line: [
                        {
                            leg: 1,
                            selection: 2
                        }
                    ]
                }
            ]
        },
        {
            totalStake: 20,
            user: {
                id: 'a00000000000000000000003'
            },
            selections: [1, 2],
            lines: [
                {
                    stake: 10,
                    line: [
                        {
                            leg: 1,
                            selection: 1
                        }
                    ]
                },
                {
                    stake: 10,
                    line: [
                        {
                            leg: 1,
                            selection: 2
                        }
                    ]
                }
            ]
        }
    ],
    result: {
        winningSelection: [1]
    }
};