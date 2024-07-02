import colors from "colors/safe.js";
export const debug = {
    log(str) {
        if (process.env.DEBUG)
            console.log(colors.gray(`(${str})`));
    },
    error(str) {
        if (process.env.DEBUG)
            console.log(colors.red(`(${str})`));
    },
};
