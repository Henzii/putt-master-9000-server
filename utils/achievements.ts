export default {
    achievements: {
        winAllHoles: {
            notification: {
                title: 'Achievement unlocked',
                body: 'You won all holes!'
            },
            isMultiple: false,  // Voiko ansaita useammin?
        },
        loseAllHoles: {
            notification: {
                title: 'Achievement unlocked',
                body: 'You lost all holes'
            },
            isMultiple: false,  // Voiko ansaita useammin?
        },
        '0Pars': {
            notification: {
                title: 'Achievement unlocked',
                body: 'You didn\'t even get a single par'
            },
            isMultiple: false,  // Voiko ansaita useammin?
        },
        '100Malmis': {
            notification: {
                title: 'Achievement unlocked',
                body: 'Malmis x 100!!'
            },
            isMultiple: false,  // Voiko ansaita useammin?
        },
        HoleInOne: {
            notification: {
                title: 'Achievement unlocked',
                body: 'Hole in one!'
            },
            isMultiple: true,  // Voiko ansaita useammin?

        },
        GoldenBox: {
            notification: {
                title: 'Achievement unlocked',
                body: 'You got the golden box ahcievement!'
            },
            isMultiple: false
        }
    }
};