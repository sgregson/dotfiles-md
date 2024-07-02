import escapeStringRegexp from "escape-string-regexp";
export const findReplace = (options) => (str) => {
    const { replacements = {}, prefix = "%" } = options;
    // Attaches prefix to the start of the string.
    const attachPrefix = (str) => (prefix || "") + str;
    // Removes prefix from the start of the string.
    const stripPrefix = (str) => prefix ? str.replace(RegExp(`^${prefix}`), "") : str;
    const replacer = (_match, matchedName) => replacements[stripPrefix(matchedName)];
    const regexp = RegExp("(" +
        Object.keys(replacements)
            .map((key) => escapeStringRegexp(attachPrefix(key)))
            .join("|") +
        ")", "g");
    return str.replace(regexp, replacer);
};
