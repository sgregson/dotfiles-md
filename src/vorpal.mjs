//--- core libs
import os from "os";
import path from "path";
//--- filesystem utils
import fs from "fs-extra";
import glob from "glob";
//--- cli utils
import Vorpal from "@moleculer/vorpal";
import inquirer from "inquirer";
import { toMdAST } from "./api.ts";
import colors from "colors/safe.js";

const CLI = Vorpal();
const UUID = "dev.sgregson.dotfiles-cli";
const DEFAULT_PATTERN = "**/*.md";
const homeDirectory = os.homedir();
colors.setTheme({
  silly: "rainbow",
  input: "grey",
  verbose: "cyan",
  prompt: "grey",
  info: "green",
  data: "grey",
  help: "cyan",
  warn: "yellow",
  debug: "blue",
  error: "red",
});

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
  name: "",
};

const state = (key, value = undefined) => {
  // to remove, explicitly set value to null
  if (value === null) CLI.localStorage.removeItem(key);
  if (value !== null && value !== undefined) {
    CLI.localStorage.setItem(key, JSON.stringify(value));
  }

  // "fetch all"
  if (!key) {
    return Object.fromEntries(
      CLI.localStorage._localStorage._keys.map((k) => [
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
    CLI.log(args.options);
    return CLI.activeCommand
      .prompt([
        {
          type: "list",
          name: "mode",
          message: "Select Action : ",
          choices: ["settings", "refresh", "reset"],
        },
        // -------------
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
              CLI.localStorage._localStorage._keys.forEach((k) => {
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

CLI.command("run", "run a dotfiles build")
  .option("-p, --pattern <pattern>", "Provide a file pattern")
  .option("-s, --selected <selected>", "Provide selected files")
  .option("-a, --actions <actions>", "Provide codeblock action types")
  .action(async function cmdRun({
    blockType,
    options: { selected, actions, pattern },
    ...args
  }) {
    // Uses command options to pre-populate or skip UI
    let {
      selected: argSelected,
      pattern: argPattern,
      actions: argActions,
    } = CLI.parse(process.argv, {
      use: "minimist",
    });

    if (argPattern) {
      await updateFiles(argPattern);
      state("selected", []);
      CLI.ui.delimiter(statusBar());
    }

    let blockTypes = [],
      // arg overrides "selected", falls back to all files
      files = argSelected
        ? argSelected.split(",")
        : state("selected").length !== 0
        ? state("selected")
        : state("files"),
      blocks = await getRunnableBlocks(files),
      blocksToRun = [];

    if (argActions) blockTypes = argActions.split(",");

    if ((argSelected || argPattern) && argActions) {
      // use selected files if provided, otherwise "all"
      blocksToRun = blocks.filter(
        (block) => blockTypes.includes(block.options.action) && !block.disabled
      );
    }

    ({ blockTypes = blockTypes } = await this.prompt({
      name: "blockTypes",
      type: "checkbox",
      message: "Pre-select block types : ",
      when: blockTypes.length === 0,
      // default: blockTypes,
      choices: ["build", "run", "symlink"],
    }));

    ({ blocksToRun = blocksToRun } = await this.prompt({
      name: "blocksToRun",
      type: "checkbox",
      message: "Related Blocks : ",
      when: blocksToRun.length === 0,
      // default: blocksToRun,
      choices: Array.from(
        blocks.reduce((acc, blockData) => {
          const prev = acc.has(blockData.source)
            ? acc.get(blockData.source)
            : [];
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
              name: block.options?.title ?? block.meta,
              value: block,
              disabled: block.disabled,
              checked:
                blockTypes.includes(block.options?.action) && !block.disabled,
            })),
          ];
        })
        .flat(2),
    }));

    return Promise.all(blocksToRun.map(executeBlock));
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
CLI.delimiter(statusBar()).show().parse(process.argv);

// ----------
async function globAsync(pattern, options) {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, matches) => {
      if (err) reject(err);
      resolve(matches);
    });
  });
}
async function updateFiles(newPattern) {
  if (newPattern) state("filePattern", newPattern);

  const files = (await globAsync(state("filePattern"))).filter(
    // TODO: make this OS-agnostic
    (filePath) => !filePath.includes("build/")
  );
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
    const fileContent = await fs.readFile(filePath);
    const theDoc = await toMdAST.parse(fileContent);

    files = files.concat(
      theDoc.children
        .filter(({ type }) => type === "code")
        .map(({ lang, meta, value }) => {
          const options = meta?.split(" ") ?? [];

          const block = {
            lang,
            meta,
            targetPath: options
              .find((opt) => !opt.includes("="))
              ?.replace(/^(~|\$HOME)(?=$|\/|\\)/, homeDirectory),
            options: Object.fromEntries(
              options
                .filter((opt) => opt.includes("="))
                .map((opt) => opt.split("="))
            ),
            content: value,
            source: filePath,
          };

          return {
            ...block,
            disabled: isDisabled(block),
          };
        })
    );
  }
  return files;
}

/**
 * Check whether the block should be permitted to run, commonly:
 * disabled=true, when=os.darwin, when=os.win32
 *
 * @param {obj} thisBlock the object representing the markdown codeblock
 * @returns string | false (string values are rendered in the UI)
 */
function isDisabled(thisBlock) {
  // returns false or a string for a reason
  if (thisBlock.options?.disabled) return colors.error("disabled=true");
  if (thisBlock.options?.when) {
    switch (thisBlock.options.when) {
      case "os.darwin":
        return os.platform() !== "darwin"
          ? colors.warn("when!=os.darwin")
          : false;
      case "os.win32":
        return os.platform() !== "win32"
          ? colors.warn("when!=os.win32")
          : false;
      default:
        break;
    }
  }
  return false;
}
async function executeBlock(block, i) {
  const {
    options: { action },
    targetPath,
    source,
    content,
    lang,
  } = block;
  const buildDir = path.join(process.cwd(), "build");
  let targetFile;

  if (action === "build" || action === "symlink") {
    targetFile = path.resolve(path.dirname(source), targetPath);
  }

  switch (action) {
    case "build":
      // make sure the folder is available before writing
      await fs.ensureFile(targetFile);
      await fs.writeFile(targetFile, content).then(() => {
        CLI.log(`🔨 built ${path.relative(process.cwd(), targetFile)}`);
      });
      break;
    case "symlink":
      const buildFile = path.join(
        buildDir,
        "links",
        // named for the originating file, with $i to dedupe multiple symlinks
        `${i}-${path.parse(targetFile).base}`
      );
      await fs.ensureDir(path.dirname(buildFile));
      await fs.ensureDir(path.dirname(targetFile));

      // build the source file and symlink it
      await fs.writeFile(buildFile, content).then(
        () => CLI.log(`🔨 built ${path.relative(process.cwd(), buildFile)}`),
        async (err) => {
          // backup & move old version
          await fs.move(buildFile, buildFile + `.bak-${Date.now()}`);
          await fs.writeFile(buildFile, content);
        }
      );
      await fs.ensureSymlink(buildFile, targetFile).then(
        // prettier-ignore
        () => CLI.log(`🔗 linked ${targetFile} to ${path.relative(process.cwd(),buildFile)}`),
        async (err) => {
          // backup & move old version
          await fs
            .move(targetFile, targetFile + `.bak-${Date.now()}`)
            .catch(() => {});
          await fs.ensureSymlink(buildFile, targetFile).catch(() => {});
        }
      );
      break;
    default:
      CLI.log(
        `😬 hang in there, I still have to learn how to ${action} a '${lang}' block.`
      );
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
    updated.name ? `(${updated.name})` : "",
    updated.filePattern,
    updated.files.length,
  ].join("\t")} files \t${updated.selected.length} selected\ndotfiles$`;
}
