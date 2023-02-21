export default {
    app: {
        version: '1.0.1',
        patch: 'New version of FuDisc available!',
        minor: 'Your FuDisc app is out of date. Some features might not work as expected. Update it now',
        major: 'Your FuDisc version is too old!',
    },
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
            isMultiple: false,  // Voiko ansaita useammin?

        }
    }
};