import os from "os";
import fs from "fs-extra";
import path from "path";
import { execa, ExecaError } from "execa";
import glob from "glob";
import * as dotenv from "dotenv";
import tempWrite from "temp-write";
import { fileURLToPath } from "url";

import { unified } from "unified";
import parseSentence from "minimist-string";
import { Code } from "mdast";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { findReplace } from "./findReplace.js";

import colors from "colors/safe.js";
import { confirm } from "@inquirer/prompts";
import { SelectOption } from "inquirer-select-pro";

const dotEnvObj = dotenv.parse(
  await fs
    .readFile(path.resolve(process.cwd(), ".env"))
    // if file's missing, return nothing
    .catch(() => "")
);

export interface State {
  // file filter, glob-compatible
  filter: string;
  // selected files
  files: string[];
  // selected blocks
  blocks: Block[];
  totalBlocks?: { active: number; disabled: number; total: number };
}
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
    action: "build" | "symlink" | "run" | "section";
    targetPath: string;
    title: string;
    when: string;
    disabled: string;
  }>;
  // if the block is disabled via options flags
  disabled: string | boolean;
  // derived label from title, meta or content
  label: string;
}

class UnreachableCaseError extends Error {
  constructor(value: never) {
    super(`Unreachable case: ${value}`);
  }
}

const interpreterMap = {
  sh: { interpreter: "sh", commentChar: "#" },
  bash: { interpreter: "bash", commentChar: "#" },
  zsh: { interpreter: "zsh", commentChar: "#" },
  js: { interpreter: "node", commentChar: "//" },
};

const injectEnv = findReplace({
  replacements: dotEnvObj,
  prefix: "%",
});

export const toMdAST = await unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm);

function DEBUG(str) {
  if (process.env.DEBUG) console.log(colors.gray(`(${str})`));
}

/******************
 * Menu Stuff
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const clearScreen = () => {
  console.log("\u001b[2J\u001b[0;0H");
};

/** const validator = menuValidator("validation message")*/

type Validator = <ValueType>(
  msg?: string
  // firstCheck?: never
) => (values: ReadonlyArray<SelectOption<ValueType>>) => string | boolean;

export const menuValidator: Validator =
  (msg = "empty selection, select a value", firstCheck = true) =>
  (values) => {
    if (!values.length && firstCheck) {
      firstCheck = false;
      return `${msg} or press 'enter' to continue.`;
    }

    return true;
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

export const getDemoPath = () => {
  const dirname = path.join(fileURLToPath(import.meta.url), "../../demo/");
  const filter = path.join(dirname, "**", "*.md");

  return { dirname, filter };
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
    const fileContent = await fs.readFile(filePath, { encoding: "utf8" });
    const theDoc = await toMdAST.parse(injectEnv(fileContent));

    blocks = blocks.concat(
      theDoc.children
        .filter((block): block is Code => block.type === "code")
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
            case "section":
              label = colors.underline(value ?? meta);
              break
            case "run":
              label = `${options?.title ?? meta} (${colors.red(options?.action??"")}:${colors.underline(lang ??"")})`;
              break;
            case "build":
            case "symlink":
            default:
              label = `${options?.title ?? meta} `
                    + `(${colors.green(options?.action??"")}:${colors.underline(lang ??"")})`
                    + ` -> ${options.targetPath?.replace(homeDirectory, "~")}`;
          }

          const theBlock: Block = {
            lang: lang ?? "",
            meta: meta ?? "",
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

export const executeBlock =
  (now: string) =>
  async (block: Block, i, prevAction = "") => {
    const { options, content: blockContent, lang } = block;
    const buildDir = path.join(process.cwd(), "build", now);

    let targetFile;

    // BAIL - exit early if there's no action to be done
    if (!options?.action) {
      console.log(`↪ SKIPPED (no action) ${colors.reset(block.label)}`);
      return;
    }

    if (prevAction !== options.action || options.action === "run")
      console.log(""); // aesthetic newline between types of actions

    // the output file goes to the target path from where dotfiles-md is run
    if (options?.targetPath) {
      targetFile = path.resolve(process.cwd(), options.targetPath);
    }

    switch (options?.action) {
      case "section":
        console.log("\n" + block.label + "\n");
        break;
      case "build":
        if (!options.targetPath) {
          console.log(`↪ SKIPPED (no targetPath) ${colors.reset(block.label)}`);
          return;
        }

        // make sure the folder is available before writing
        await fs.ensureFile(targetFile);
        await fs.writeFile(targetFile, blockContent).then(() => {
          console.log(`🔨 built ${path.relative(process.cwd(), targetFile)}`);
        });
        break;
      case "symlink":
        if (!options.targetPath) {
          console.log(`↪ SKIPPED (no targetPath) ${colors.reset(block.label)}`);
          return;
        }

        const buildFile = path.join(
          buildDir,
          "links",
          // named for the originating file, with $i to dedupe multiple symlinks
          `${i}-${path.parse(targetFile).base}`
        );

        // makes sure the directories exist, but doesn't create the file yet
        await fs.ensureDir(path.dirname(buildFile));
        await fs.ensureDir(path.dirname(targetFile));

        // 1. build the source file and symlink it
        DEBUG(`building source file ${buildFile}`);
        await fs.writeFile(buildFile, blockContent).then(
          () => {
            DEBUG(`🔨 built ${path.relative(process.cwd(), buildFile)}`);
          },
          async (_error) => {
            console.log("🚨 Build failure");
            // backup & move old version
            await fs.move(buildFile, buildFile + `.bak-${now}`);
            await fs.writeFile(buildFile, blockContent);
          }
        );

        // 2. create a symlink at the targetfile location back to the source file
        // prettier-ignore
        const successMsg = `🔗 linked ${targetFile} to ${path.relative(process.cwd(), buildFile)}`
        // prettier-ignore
        const backupMsg = `💾 backup created at ${targetFile + `.bak-${now}`}`;

        // readLink returns the content of the symlink (a path to the source file)
        const currentSymlink = await fs
          .readlink(targetFile, {
            encoding: "utf8",
          })
          .catch(() => {
            DEBUG(`no existing symlink`);
          });
        // readFile returns the actual content (or catches and returns false)
        const currentSymlinkContent = await fs
          .readFile(targetFile, { encoding: "utf8" })
          .catch(() => false as const);

        if (currentSymlink) {
          DEBUG(`found existing symlink at ${targetFile}`);

          if (
            currentSymlinkContent !== false &&
            currentSymlinkContent !== blockContent
          ) {
            const backupPath = targetFile + `.bak-${now}`;
            DEBUG(`writing backing up existing content to ${backupPath}`);

            await fs
              .writeFile(backupPath, currentSymlinkContent, {
                encoding: "utf8",
              })
              .then(() => console.log(backupMsg))
              .catch((err) =>
                console.log(
                  `🚧 failed to write ${backupPath} (${err.code}). Refer to old content at ${currentSymlinkContent}`
                )
              );
          }

          DEBUG(`🗑️ removing ${targetFile}`);
          await fs
            .remove(targetFile)
            .catch(() => `Failed to remove old file ${targetFile}`);
        }

        DEBUG(`creating symlink`);
        await fs
          .ensureSymlink(buildFile, targetFile)
          .then(() => console.log(successMsg))
          .catch((err) => {
            console.log(`🚧 failed to create symlink at ${targetFile}`);
            console.log(err);
          });

        break;
      case "run":
        if (!Object.keys(interpreterMap).includes(lang)) {
          console.log(
            `😬 hang in there, I still have to learn how to ${options?.action} a '${lang}' block.`
          );
          break;
        }

        // ALWAYS CHECK before executing scripts
        console.log(
          colors.red(`> ${colors.underline(lang)}\n> `) +
            block.content
              .split("\n")
              .map((line) =>
                line.startsWith(interpreterMap[lang].commentChar)
                  ? colors.grey(line)
                  : line
              )
              .join("\n" + colors.red("> "))
        );

        const confirmRun = await confirm({ message: "run the above script?" });

        if (confirmRun) {
          /** Create a temporary file for the script and run it */
          const tempFile = await tempWrite(block.content, "script.sh");
          await execa`chmod +x ${tempFile}`;

          // If the script fails, catch the error and let the user decide whether to continue
          try {
            await execa({
              stdout: "inherit",
              stderr: "inherit",
            })`${interpreterMap[lang].interpreter} ${tempFile}`;
          } catch (error) {
            if (error instanceof ExecaError) {
              console.error(
                colors.red(`🚨 Error executing script: ${error.shortMessage}`)
              );
              await confirm({ message: "Do you want to continue?" });
            }
          }
        }
        break;
      default:
        console.log(
          `😬 hang in there, I still have to learn how to ${options?.action} a '${lang}' block.`
        );
        throw new UnreachableCaseError(options.action);
        break;
    }
  };

/**
 * Check whether the block should be permitted to run, commonly:
 * disabled=true, when=os.darwin, when=os.win32
 */
function isDisabled(options: Block["options"]) {
  if (options?.action === "section") return true;

  // returns false or with a string containing the reason for being disabled
  if (options?.disabled) {
    return colors.red(
      options.disabled === "true" ? "(disabled)" : `(${options.disabled})`
    );
  }

  if (options?.when) {
    switch (options.when) {
      case "os.darwin":
        return os.platform() !== "darwin"
          ? colors.yellow("(when!=os.darwin)")
          : false;
      case "os.win32":
        return os.platform() !== "win32"
          ? colors.yellow("(when!=os.win32)")
          : false;
      default:
        return `'when=${options.when}' unknown`;
    }
  }
  return false;
}
