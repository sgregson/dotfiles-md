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
}

export const toMdAST = await unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(remarkFindReplace, {
    replacements: { ...env, PLACEHOLDER: "derpy-do" },
    prefix: "%",
  });

export async function globAsync(pattern: string, options = {}) {
  return new Promise<string[]>((resolve, reject) => {
    glob(pattern, options, (err, matches) => {
      if (err) reject(err);
      resolve(matches);
    });
  });
}

const homeDirectory = os.homedir();
export async function getRunnableBlocks(inputFiles: string[]) {
  let blocks: Block[] = [];

  for (const filePath of inputFiles) {
    const fileContent = await fs.readFile(filePath);
    const theDoc = await toMdAST.parse(fileContent);

    blocks = blocks.concat(
      theDoc.children
        .filter(({ type }) => type === "code")
        .map(({ lang, meta, value }) => {
          const options = meta?.split(" ") ?? [];

          let block: Block = {
            lang,
            meta,
            options: Object.fromEntries(
              options
                .filter((opt) => opt.includes("="))
                .map((opt) => {
                  // the only option missing a "=" is the filePath
                  if (!opt.includes("="))
                    return [
                      "targetPath",
                      opt.replace(/^(~|\$HOME)(?=$|\/|\\)/, homeDirectory),
                    ];

                  return opt.split("=");
                })
            ),
            content: value,
            source: filePath,
            disabled: false,
          };
          block.disabled = isDisabled(block);
          return block;
        })
        .filter((block) => !!block.options?.action)
    );
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
function isDisabled(thisBlock: Block) {
  // returns false or a string for a reason
  if (thisBlock.options?.disabled) return colors.red("disabled=true");
  if (thisBlock.options?.when) {
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
