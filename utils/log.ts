/* eslint-disable no-console */

type message = string | unknown[]

export const log = (message: message, devModeOnly = true) => {
    if (!devModeOnly || process.env.NODE_ENV !== 'production') {
        if (typeof message !== 'string') console.log(...message);
        else console.log(message);
    }
};
