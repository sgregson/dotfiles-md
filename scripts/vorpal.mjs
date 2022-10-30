import { promises as fsPromises } from "fs";
import path from "path";
import os from "os";
//--- filesystem utils
import glob from "glob";
import makeDir from "make-dir";
//--- cli utils
import Vorpal from "vorpal";
import inquirer from "inquirer";
import { toMdAST } from "./api.mjs";

const CLI = Vorpal();
const UUID = "dev.sgregson.dotfiles-cli";
const DEFAULT_PATTERN = "src/**/*.md";
const homeDirectory = os.homedir();

CLI.history(UUID);
CLI.localStorage(UUID);

/***********
 * CLI application state stored in localStorage,
 * accessed with state("someKey") or state()
 * manipulated with state("someKey","newValue")
 */
const DEFAULT_STATE = {
  // internal
  files: [],
  selected: [],
  lastScan: Date.now(),
  // user-configurable
  filePattern: DEFAULT_PATTERN,
  name: "WHOAMI",
};

const state = (key, value = undefined) => {
  // to remove, explicitly set value to null
  if (value === null) CLI.localStorage.removeItem(key);
  if (value) CLI.localStorage.setItem(key, JSON.stringify(value));
  // "fetch all"
  if (!key) {
    return Object.fromEntries(
      CLI.localStorage._localStorage.keys.map((k) => [
        k,
        JSON.parse(CLI.localStorage.getItem(k)),
      ])
    );
  }

  return JSON.parse(CLI.localStorage.getItem(key));
};
Object.entries(DEFAULT_STATE).forEach(([k, v]) => {
  // Set to default or fetch from localStorage
  if (!state(k)) state(k, v);
});

CLI.command("config", "configure your dotfiles application")
  .option("--name <string>", "Your name")
  .option("--pattern <glob>", "Glob pattern to match your markdown files")
  .action(function cmdConfig(args, cb) {
    return CLI.activeCommand
      .prompt([
        {
          type: "list",
          name: "mode",
          message: "Select Action : ",
          choices: ["settings", "refresh", "reset"],
        },

        {
          type: "confirm",
          name: "confirmReset",
          when: ({ mode }) => mode === "reset",
          message: "Reset App State? ",
        },
        {
          type: "input",
          name: "name",
          when: ({ mode }) => mode === "settings",
          message: "(set) Your Name : ",
          default: args.options.name || state("name"),
        },
        {
          type: "input",
          name: "filePattern",
          when: ({ mode }) => mode === "settings",
          message: "(set) Dofiles pattern : ",
          default: args.options.pattern || state("filePattern"),
        },
        {
          type: "confirm",
          name: "rescan",
          when: ({ mode, filePattern }) =>
            mode === "settings" && state("filePattern") !== filePattern,
          message: "Refresh file list? ",
        },
      ])
      .then(async ({ mode, confirmReset, name, filePattern, rescan }) => {
        switch (mode) {
          case "reset":
            if (confirmReset) {
              CLI.localStorage._localStorage.keys.forEach((k) => {
                state(k, null);
              });
              Object.entries(DEFAULT_STATE).forEach(([k, v]) => {
                // Set to default or fetch from localStorage
                state(k, v);
              });
            }
            break;
          case "settings":
            state("name", name);
            state("filePattern", filePattern);

            if (!rescan) {
              break;
            }
          case "refresh":
          default:
            await updateFiles();
            break;
        }

        return Promise.resolve();
      })
      .catch((err) => cb(err))
      .then(() => {
        CLI.delimiter(statusBar());
      });
  });

CLI.command("run", "run a dotfiles build").action(async function cmdRun({
  blockType,
  ...args
}) {
  const { blockTypes } = await this.prompt({
    name: "blockTypes",
    type: "checkbox",
    message: "select a block type : ",
    choices: [{ value: "build", checked: true }, "run", "symlink"],
  });

  // CLI.log("block type(s):", blockTypes);
  const blocks = await getRunnableBlocks(state("selected"));
  CLI.log("# blocks:", blocks.length);

  const { blocksToRun } = await this.prompt({
    name: "blocksToRun",
    type: "checkbox",
    message: "Related Blocks : ",
    choices: Array.from(
      blocks.reduce((acc, blockData) => {
        const prev = acc.has(blockData.source) ? acc.get(blockData.source) : [];
        acc.set(blockData.source, prev.concat([blockData]));
        return acc;
      }, new Map())
    )
      .map(([filePath, fileBlocks]) => {
        const runnableBlocks = fileBlocks.filter((b) => b?.options?.action);
        return [
          new inquirer.Separator(
            `${filePath} (${runnableBlocks.length} of ${fileBlocks.length})`
          ),
          runnableBlocks.map((block) => ({
            name: `${block.meta}\n   ${block.content
              .split("\n")
              .map((line) => `${line}`)
              .join("(...)")}`,
            value: block,
            checked: blockTypes.includes(block.options.action),
          })),
        ];
      })
      .flat(2),
  });

  blocksToRun.forEach(executeBlock);
  return Promise.resolve();
});

CLI.command("select", "Select dotfiles").action(async function cmdSelect(
  args,
  cb
) {
  return CLI.activeCommand
    .prompt({
      type: "checkbox",
      name: "selectFiles",
      message: "Choose Files",
      choices: () => {
        let active = state("selected") || [];
        const inactive = state("files").filter((f) => !active.includes(f));
        active = active.map((a) => ({ value: a, checked: true }));

        return [...active, new inquirer.Separator(), ...inactive];
      },
    })
    .catch((err) => cb(err))
    .then(({ selectFiles }) => {
      updateSelected(selectFiles);
      // CLI.delimiter(statusBar());
    });
});

CLI.command("clear", "clear screen").action(function cmdClear() {
  // https://github.com/dthree/vorpal/issues/134
  CLI.activeCommand.log("\u001b[2J\u001b[0;0H");

  return Promise.resolve();
});

// Run the app
CLI.delimiter(statusBar()).show();

// ----------
async function globAsync(pattern, options) {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, matches) => {
      if (err) reject(err);
      resolve(matches);
    });
  });
}
async function updateFiles() {
  const files = await globAsync(state("filePattern"));
  // const blocks = await getRunnableBlocks(files);

  state("files", files);
  state("lastScan", Date.now());
  CLI.delimiter(statusBar());
}
async function updateSelected(files) {
  state("selected", files);
  CLI.delimiter(statusBar());
}

async function getRunnableBlocks(inputFiles) {
  let files = [];
  for (const filePath of inputFiles) {
    const fileContent = await fsPromises.readFile(filePath);
    const theDoc = await toMdAST.parse(fileContent);

    files = files.concat(
      theDoc.children
        .filter(({ type }) => type === "code")
        .map(({ lang, meta, value }) => {
          const options = meta?.split(" ") ?? [];

          return {
            lang,
            meta,
            targetPath: options
              .find((opt) => !opt.includes("="))
              ?.replace(/^~(?=$|\/|\\)/, homeDirectory),
            options: Object.fromEntries(
              options
                .filter((opt) => opt.includes("="))
                .map((opt) => opt.split("="))
            ),
            content: value,
            source: filePath,
          };
        })
    );
  }
  return files;
}
async function executeBlock(block, i) {
  const {
    options: { action },
    targetPath,
    source,
    content,
  } = block;
  const maybeTarget = path.resolve(path.dirname(source), targetPath);
  switch (action) {
    case "build":
      // make sure the folder is available
      await makeDir(path.dirname(maybeTarget)).catch((err) => {
        CLI.log(err);
      });
      if (!maybeTarget) {
        CLI.log(`couldn't find destination path ${maybeTarget}`);
        break;
      }
      // actually write the file
      await fsPromises.writeFile(maybeTarget, content).then(() => {
        CLI.log(`🔨 built ${path.relative(process.cwd(), maybeTarget)}`);
      });
      break;
    case "symlink":
      // make sure the build and target directory exists
      const buildDir = path.join(process.cwd(), "build");
      const buildFile = path.join(
        buildDir,
        `${i}-${path.parse(maybeTarget).base}` // iteration to dedupe multiple symlinks in one file
      );
      await makeDir(buildDir).catch((err) => CLI.log(err));
      await makeDir(path.dirname(maybeTarget));

      // build the file to that directory
      await fsPromises
        .writeFile(buildFile, content)
        .then(() =>
          CLI.log(`🔨 built ${path.relative(process.cwd(), buildFile)}`)
        );
      // remove any existing file
      // before creating a symlink at the target pointed at the build file
      await fsPromises.unlink(maybeTarget).catch(() => {});
      await fsPromises
        .symlink(buildFile, maybeTarget)
        .then(() =>
          CLI.log(
            `🔗 linked ${maybeTarget} to ${path.relative(
              process.cwd(),
              buildFile
            )}`
          )
        );
      break;
    default:
      CLI.log(`...hang on, learning how to ${action}`);
      break;
  }
}

/*********************
 * Used to indicate the status
 */
function statusBar() {
  const updated = state();
  // CLI.log(JSON.stringify(updated, null, 2));
  return `========= ${[
    `(${updated.name})`,
    updated.filePattern,
    updated.files.length,
  ].join("\t")} files \t${updated.selected.length} selected\ndotfiles$`;
}
