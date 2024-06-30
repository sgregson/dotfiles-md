import * as dotenv from "dotenv";
import { promises as fsPromises } from "fs";
import os from "os";
import fs from "fs-extra";
import path from "path";
import parseSentence from "minimist-string";
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
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const clearScreen = () => {
    console.log("\u001b[2J\u001b[0;0H");
};
/*************
 * File stuff
 */
export async function globAsync(pattern, options = {}) {
    return new Promise((resolve, reject) => {
        glob(pattern, options, (err, matches) => {
            if (err)
                reject(err);
            resolve(matches);
        });
    });
}
export const existsSync = (thePath) => {
    if (fs.existsSync(thePath))
        return thePath;
    if (fs.existsSync(process.cwd() + thePath))
        return process.cwd() + thePath;
    return false;
};
export const cache = {
    path: ".dotfiles-md-cache",
    get() {
        return JSON.parse(fs.readFileSync(this.path, { encoding: "utf-8" }));
    },
    set(state) {
        fs.writeFileSync(this.path, JSON.stringify(state), { encoding: "utf-8" });
    },
    remove() {
        fs.unlinkSync(this.path);
    },
};
/***************
 * Blocks
 */
const homeDirectory = os.homedir();
export async function getRunnableBlocks(inputFiles, options) {
    let blocks = [];
    for (const filePath of inputFiles) {
        const fileContent = await fs.readFile(filePath);
        const theDoc = await toMdAST.parse(fileContent);
        blocks = blocks.concat(theDoc.children
            .filter(({ type }) => type === "code")
            .map(({ lang, meta, value }) => {
            var _a, _b, _c, _d;
            const options = Object.fromEntries(
            // minimist parses unknown args into an unknown "_" key
            // and all args we have are technically unknown
            parseSentence(meta !== null && meta !== void 0 ? meta : "")["_"].map((opt) => {
                if (!opt.includes("=")) {
                    // the only option missing a "=" is the filePath
                    return [
                        "targetPath",
                        opt.replace(/^(~|\$HOME)(?=$|\/|\\)/, homeDirectory),
                    ];
                }
                return opt.split("=");
            }));
            let label = "";
            // prettier-ignore
            switch (options === null || options === void 0 ? void 0 : options.action) {
                case "run":
                    label = `${(_a = options === null || options === void 0 ? void 0 : options.title) !== null && _a !== void 0 ? _a : meta} ${colors.red((_b = options === null || options === void 0 ? void 0 : options.action) !== null && _b !== void 0 ? _b : "")}:${lang}`;
                    break;
                case "build":
                case "symlink":
                default:
                    label = `${(_c = options === null || options === void 0 ? void 0 : options.title) !== null && _c !== void 0 ? _c : meta} ${colors.green((_d = options === null || options === void 0 ? void 0 : options.action) !== null && _d !== void 0 ? _d : "")}:${colors.underline(lang)} to ${options === null || options === void 0 ? void 0 : options.targetPath}`;
            }
            const theBlock = {
                lang,
                meta,
                options,
                content: value,
                source: filePath,
                disabled: isDisabled(options),
                label,
            };
            return theBlock;
        })
            .filter((block) => {
            var _a;
            // has an action
            return !!((_a = block.options) === null || _a === void 0 ? void 0 : _a.action) &&
                // disabled while including disabled
                (!block.disabled || options.includeDisabled);
        }));
    }
    return blocks;
}
export const executeBlock = (now) => async (block, i) => {
    const { options, source, content, lang } = block;
    const buildDir = path.join(process.cwd(), "build", now.toString());
    let targetFile;
    // NOTE: exit early if there's no action to be done
    if (!(options === null || options === void 0 ? void 0 : options.action)) {
        console.log(`↪ SKIPPED (no action) ${colors.reset(block.label)}`);
        return;
    }
    if (options.action === "build" || options.action === "symlink") {
        // BAIL if there's no target path to build/link to
        if (!options.targetPath) {
            console.log(`↪ SKIPPED (no targetPath) ${colors.reset(block.label)}`);
            return;
        }
        targetFile = path.resolve(path.dirname(source), options.targetPath);
    }
    switch (options === null || options === void 0 ? void 0 : options.action) {
        case "build":
            // make sure the folder is available before writing
            await fs.ensureFile(targetFile);
            await fs.writeFile(targetFile, content).then(() => {
                console.log(`🔨 built ${path.relative(process.cwd(), targetFile)}`);
            });
            break;
        case "symlink":
            const buildFile = path.join(buildDir, "links", 
            // named for the originating file, with $i to dedupe multiple symlinks
            `${i}-${path.parse(targetFile).base}`);
            await fs.ensureDir(path.dirname(buildFile));
            await fs.ensureDir(path.dirname(targetFile));
            // 1. build the source file and symlink it
            await fs.writeFile(buildFile, content).then(() => console.log(`🔨 built ${path.relative(process.cwd(), buildFile)}`), async (_error) => {
                console.log("BUILD FAIL");
                // backup & move old version
                await fs.move(buildFile, buildFile + `.bak-${Date.now()}`);
                await fs.writeFile(buildFile, content);
            });
            // 2. create a symlink at the targetfile location back to the source file
            // prettier-ignore
            const successMsg = `🔗 linked ${targetFile} to ${path.relative(process.cwd(), buildFile)}`;
            // prettier-ignore
            const backupMsg = `💾 backup created at ${targetFile + `.bak-${Date.now()}`}`;
            await fs.ensureSymlink(buildFile, targetFile).then(() => console.log(successMsg), async (error) => {
                // backup & move old version
                if (error.code === "EEXIST") {
                    await fs
                        .move(targetFile, targetFile + `.bak-${Date.now()}`)
                        .then(() => console.log(backupMsg))
                        .catch(() => { });
                    await fs
                        .ensureSymlink(buildFile, targetFile)
                        .then(() => console.log(successMsg))
                        .catch((err) => {
                        console.log(`🚧 failed to create symlink at ${targetFile}`);
                        console.log(err);
                    });
                }
            });
            break;
        default:
            console.log(`😬 hang in there, I still have to learn how to ${options === null || options === void 0 ? void 0 : options.action} a '${lang}' block.`);
            break;
    }
};
/**
 * Check whether the block should be permitted to run, commonly:
 * disabled=true, when=os.darwin, when=os.win32
 */
function isDisabled(options) {
    // returns false or with a string containing the reason for being disabled
    if (options === null || options === void 0 ? void 0 : options.disabled)
        return colors.red("disabled=true");
    if (options === null || options === void 0 ? void 0 : options.when) {
        switch (options.when) {
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
