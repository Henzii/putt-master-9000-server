import { LegType, Pool, PoolStatus } from "../../graphql/games/types";
import { Game } from "../../types";

export const mockedHoleInOnePool: Pool = {
    status: PoolStatus.OPEN,
    legs: [{type: LegType.HOLE_IN_ONE, selections: [
        { id: 1, value: "u1", type: "Player" },
        { id: 2, value: "u2", type: "Player" },
        { id: 3, value: "u3", type: "Player" },
        { id: 4, value: "u4", type: "Player" }
    ]}],
    bets: [
        {
            totalStake: 50,
            user: {
                id: 'a00000000000000000000001'
            },
            selections: [4],
            lines: [
                { stake: 50, line: [{ leg: 1, selection: 4 }] }
            ]
        },
        {
            totalStake: 100,
            user: {
                id: 'a00000000000000000000001'
            },
            selections: [2,4],
            lines: [
                { stake: 50, line: [{ leg: 1, selection: 2 }] },
                { stake: 50, line: [{ leg: 1, selection: 4 }] }
            ]
        },

    ],
    result: {
        winningSelection: []
    }
};

export const mockedPool: Pool = {
    status: PoolStatus.SETTLED,
    legs: [
        {
            type: LegType.WINNER,
            selections: [
                { id: 1, value: "u1", type: "Player" },
                { id: 2, value: "u2", type: "Player" },
                { id: 3, value: "u3", type: "Player" },
                { id: 4, value: "u4", type: "Player" }
            ]
        },
        {
            type: LegType.WINNER_HC,
            selections: [
                { id: 1, value: "u1", type: "Player" },
                { id: 2, value: "u2", type: "Player" },
                { id: 3, value: "u3", type: "Player" },
                { id: 4, value: "u4", type: "Player" }
            ]

        }
    ],
    bets: [
        {
            totalStake: 50,
            user: {
                id: 'a00000000000000000000001'
            },
            selections: [1],
            lines: [{
                stake: 50,
                line: [{
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
        winningSelection: []
    }
};

export const mockedGameWithBetting: Game = {
    id: 'b00000000000000000000001',
    pars: [3, 3, 3, 3, 3],
    layout_id: 'asdasd',
    date: new Date(),
    course: 'MockedGameCourse',
    layout: 'MockedGameLayout',
    par: 15,
    isOpen: true,
    startTime: new Date(),
    scorecards: [
        { user: { id: 'u1', name: 'User1' }, scores: [3, 3, 3, 3, 3], plusminus: 0, beers: 0, hc: 1, pars: [], median10: 0, id: 'sc1' }, // total 15 / 14
        { user: { id: 'u2', name: 'User2' }, scores: [3, 3, 4, 3, 3], plusminus: 0, beers: 0, hc: 4, pars: [], median10: 0, id: 'sc2' }, // total 16 / 12
        { user: { id: 'u3', name: 'User3' }, scores: [3, 2, 2, 3, 3], plusminus: 0, beers: 0, hc: 0, pars: [], median10: 0, id: 'sc3' }, // total 13 / 13
        { user: { id: 'u4', name: 'User4' }, scores: [1, 4, 4, 3, 3], plusminus: 0, beers: 0, hc: 0.5, pars: [], median10: 0, id: 'sc4' }, // total 14 / 13.5
    ],
    betting: {
        enabled: true,
        pools: [mockedPool, mockedHoleInOnePool]
    }
};

