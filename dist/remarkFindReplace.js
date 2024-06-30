import { visit } from "unist-util-visit";
import escapeStringRegexp from "escape-string-regexp";
// reformatted gatsby-remark-find-replace into a generic remark plugin
export default function findReplace(options) {
    const { replacements = {}, prefix = "%" } = options;
    return (tree, _file) => {
        // Attaches prefix to the start of the string.
        const attachPrefix = (str) => (prefix || "") + str;
        // Removes prefix from the start of the string.
        const stripPrefix = (str) => prefix ? str.replace(RegExp(`^${prefix}`), "") : str;
        // RegExp to find any replacement keys.
        const regexp = RegExp("(" +
            Object.keys(replacements)
                .map((key) => escapeStringRegexp(attachPrefix(key)))
                .join("|") +
            ")", "g");
        const replacer = (_match, name) => replacements[stripPrefix(name)];
        // Go through all text, html, code, inline code, and links.
        visit(tree, (node) => {
            if (node.type === "link") {
                // For links, the text value is replaced by text node, so we change the
                // URL value.
                const processedText = node.url.replace(regexp, replacer);
                node.url = processedText;
            }
            else {
                // For all other nodes, replace the node value.
                const processedText = node.value.replace(regexp, replacer);
                node.value = processedText;
                console.log(node.type, node.value);
            }
        });
        return tree;
    };
}
