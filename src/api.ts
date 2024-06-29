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

const env = dotenv.parse(
  await fsPromises
    .readFile(path.resolve(process.cwd(), ".env"))
    // if file's missing, return nothing
    .catch(() => "")
);

export interface Block {
  // the markdown language signifier
  lang: string;
  // the content of the code block
  content: string;
  // the literal text of the meta block
  meta: string;
  // original file source
  source: string;
  // parsed options of the meta block
  options?: Partial<{
    action: "build" | "symlink" | "run";
    targetPath: string;
    title: string;
    when: string;
    disabled: boolean;
  }>;
  // if the block is disabled via options flags
  disabled: string | false;
  // derived label from title, meta or content
  label: string;
}

export const toMdAST = await unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(remarkFindReplace, {
    replacements: { ...env, PLACEHOLDER: "derpy-do" },
    prefix: "%",
  });

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const clearScreen = () => {
  console.log("\u001b[2J\u001b[0;0H");
};

/*************
 * File stuff
 */
export async function globAsync(pattern: string, options = {}) {
  return new Promise<string[]>((resolve, reject) => {
    glob(pattern, options, (err, matches) => {
      if (err) reject(err);
      resolve(matches);
    });
  });
}

export const existsSync = (thePath): string | false => {
  if (fs.existsSync(thePath)) return thePath;
  if (fs.existsSync(process.cwd() + thePath)) return process.cwd() + thePath;

  return false;
};

export const cache = {
  path: ".dotfiles-md-cache",
  get() {
    return JSON.parse(fs.readFileSync(this.path, { encoding: "utf-8" }));
  },
  set(state: object) {
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

interface RunnableOptions {
  // whether to return disabled elements (or omit them)
  includeDisabled: boolean;
}

export async function getRunnableBlocks(
  inputFiles: string[],
  options: RunnableOptions
) {
  let blocks: Block[] = [];

  for (const filePath of inputFiles) {
    const fileContent = await fs.readFile(filePath);
    const theDoc = await toMdAST.parse(fileContent);

    blocks = blocks.concat(
      theDoc.children
        .filter(({ type }) => type === "code")
        .map(({ lang, meta, value }) => {
          const options: Block["options"] = Object.fromEntries(
            // minimist parses unknown args into an unknown "_" key
            // and all args we have are technically unknown
            parseSentence(meta ?? "")["_"].map((opt) => {
              if (!opt.includes("=")) {
                // the only option missing a "=" is the filePath
                return [
                  "targetPath",
                  opt.replace(/^(~|\$HOME)(?=$|\/|\\)/, homeDirectory),
                ];
              }

              return opt.split("=");
            })
          );

          let label = "";
          // prettier-ignore
          switch (options?.action) {
            case "run":
              label = `${options?.title ?? meta} ${colors.red(options?.action??"")}:${lang}`;
              break;
            case "build":
            case "symlink":
            default:
              label = `${options?.title ?? meta} ${colors.green(options?.action??"")}:${colors.underline(lang)} to ${options?.targetPath}`;
          }

          const theBlock: Block = {
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
        .filter(
          (block) =>
            // has an action
            !!block.options?.action &&
            // disabled while including disabled
            (!block.disabled || options.includeDisabled)
        )
    );
  }
  return blocks;
}

/**
 * Check whether the block should be permitted to run, commonly:
 * disabled=true, when=os.darwin, when=os.win32
 */
function isDisabled(options: Block["options"]) {
  // returns false or a string for a reason
  if (options?.disabled) return colors.red("disabled=true");
  if (options?.when) {
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
