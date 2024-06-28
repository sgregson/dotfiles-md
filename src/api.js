import * as dotenv from "dotenv";
import { promises as fsPromises } from "fs";
import os from "os";
import fs from "fs-extra";
import path from "path";
import glob from "glob";
import colors from "colors/safe.js";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkFindReplace from "./remarkFindReplace.js";
const env = dotenv.parse(await fsPromises
    .readFile(path.resolve(process.cwd(), ".env"))
    // if file's missing, return nothing
    .catch(() => ""));
export const toMdAST = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkFindReplace, {
    replacements: Object.assign(Object.assign({}, env), { PLACEHOLDER: "derpy-do" }),
    prefix: "%",
});
export async function globAsync(pattern, options = {}) {
    return new Promise((resolve, reject) => {
        glob(pattern, options, (err, matches) => {
            if (err)
                reject(err);
            resolve(matches);
        });
    });
}
const homeDirectory = os.homedir();
export async function getRunnableBlocks(inputFiles) {
    let blocks = [];
    for (const filePath of inputFiles) {
        const fileContent = await fs.readFile(filePath);
        const theDoc = await toMdAST.parse(fileContent);
        blocks = blocks.concat(theDoc.children
            .filter(({ type }) => type === "code")
            .map(({ lang, meta, value }) => {
            var _a;
            const options = (_a = meta === null || meta === void 0 ? void 0 : meta.split(" ")) !== null && _a !== void 0 ? _a : [];
            let block = {
                lang,
                meta,
                options: Object.fromEntries(options
                    .filter((opt) => opt.includes("="))
                    .map((opt) => {
                    // the only option missing a "=" is the filePath
                    if (!opt.includes("="))
                        return [
                            "targetPath",
                            opt.replace(/^(~|\$HOME)(?=$|\/|\\)/, homeDirectory),
                        ];
                    return opt.split("=");
                })),
                content: value,
                source: filePath,
                disabled: false,
            };
            block.disabled = isDisabled(block);
            return block;
        })
            .filter((block) => { var _a; return !!((_a = block.options) === null || _a === void 0 ? void 0 : _a.action); }));
    }
    return blocks;
}
/**
 * Check whether the block should be permitted to run, commonly:
 * disabled=true, when=os.darwin, when=os.win32
 *
 * @param {obj} thisBlock the object representing the markdown codeblock
 * @returns string | false (string values are rendered in the UI)
 */
function isDisabled(thisBlock) {
    var _a, _b;
    // returns false or a string for a reason
    if ((_a = thisBlock.options) === null || _a === void 0 ? void 0 : _a.disabled)
        return colors.red("disabled=true");
    if ((_b = thisBlock.options) === null || _b === void 0 ? void 0 : _b.when) {
        switch (thisBlock.options.when) {
            case "os.darwin":
                return os.platform() !== "darwin"
                    ? colors.yellow("when!=os.darwin")
                    : false;
            case "os.win32":
                return os.platform() !== "win32"
                    ? colors.yellow("when!=os.win32")
                    : false;
            default:
                break;
        }
    }
    return false;
}
