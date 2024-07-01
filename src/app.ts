import { confirm, select, Separator } from "@inquirer/prompts";
import {
  globAsync,
  getRunnableBlocks,
  State,
  existsSync,
  cache,
  Block,
  sleep,
  executeBlock,
  getDemoPath,
  menuValidator,
} from "./api.js";

import { SelectOption, select as multiSelect } from "inquirer-select-pro";
import colors from "colors/safe.js";

type AppStatus =
  | "init"
  | "pickFiles"
  | "pickBlocks"
  | "inspect"
  | "makeDotfiles"
  | "manageCache"
  | "[exit]";

type Yargs = { [key: string]: unknown };

let state: State = {
  filter: "**/*.md",
  files: [],
  blocks: [],
  totalBlocks: undefined,
};

// execute if invoked directly
if (process.argv[1].endsWith("app.js")) {
  Run("init");
}

export async function Run(status: AppStatus, yargs: Yargs = {}) {
  let skipOnboarding = false;

  if (yargs.demo) {
    skipOnboarding = false;
    state.filter = getDemoPath().filter;
  } else if (yargs.dotfile) {
    skipOnboarding = true;
    // ONBOARDING 1: Load saved content from an individual dotfile
    let theFile = existsSync(yargs.dotfile);

    if (!theFile) {
      console.log(`(file "${yargs.dotfile}" not found)`);
      await sleep(500);
    } else {
      console.log(`(found ${theFile})`);
      state.files = [theFile];
      state.blocks = await getRunnableBlocks(state.files, {
        includeDisabled: false,
      });
      await setTotalBlocks();

      await makeDotfilesMenu(yargs);
    }
  } else if (existsSync(cache.path)) {
    // ONBOARDING 2. Load saved settings from .dotfile-md-cache file
    if (await loadSettingsMenu()) {
      skipOnboarding = true;
    }
  }

  if (!skipOnboarding) {
    // ONBOARDING 3. Standard onboarding
    await pickFilesMenu(yargs);
    await pickBlocksMenu();
  }

  // Run the main loop! Loops until we run the exit menu
  while (status !== "[exit]") {
    status = await Main(yargs);
  }
}

/**
 * MAIN MENU
 * 1. source files
 * 2. source blocks from those files
 * 3. (optional) inspect the content of the blocks
 * 4. build the dotfiles
 */
async function Main(yargs: Yargs = {}) {
  const hasSettings = existsSync(cache.path);
  await setTotalBlocks();

  console.log(`Selected: ${getStatus()}`);

  const choice = await select<AppStatus>({
    message: "Main Menu",
    pageSize: 10,
    default:
      state.blocks.length > 0
        ? "inspect"
        : state.files.length > 0
        ? "pickBlocks"
        : undefined,
    choices: [
      {
        name: "Pick Files",
        value: "pickFiles",
      },
      {
        name: "Pick Blocks",
        value: "pickBlocks",
        description: "Pick the blocks you want to turn into dotfiles",
        disabled: state.files.length === 0,
      },
      {
        name: "Inspect Blocks",
        value: "inspect",
        description: "inspect the blocks before you add them to your system",
        disabled: state.blocks.length === 0,
      },
      new Separator(),
      {
        name: "-> Build Dotfiles",
        value: "makeDotfiles",
        description: "build your selected dotfiles",
        disabled: state.blocks.length === 0,
      },
      new Separator(),
      {
        name: hasSettings ? "Manage Saved Settings" : "Save Settings",
        value: "manageCache",
        disabled:
          (state.blocks.length === 0 || state.files.length === 0) &&
          !hasSettings
            ? "(select files or blocks)"
            : false,
      },
      { value: "[exit]" },
    ],
  });

  switch (choice) {
    case "pickFiles":
      await pickFilesMenu(yargs);
      break;
    case "pickBlocks":
      await pickBlocksMenu();
      break;
    case "inspect":
      await inspectMenu();
      break;
    case "makeDotfiles":
      // do not auto-run, regardless of yargs
      await makeDotfilesMenu({ auto: false });
      break;
    case "manageCache":
      await manageCacheMenu();
      break;
    case "[exit]":
      await preExitMenu();
  }

  return choice;
}

// Utilities
async function setTotalBlocks() {
  state.totalBlocks = (
    await getRunnableBlocks(state.files, {
      includeDisabled: true,
    })
  ).reduce(
    (acc, el) => {
      if (el.disabled) {
        acc.disabled++;
      } else {
        acc.active++;
      }
      acc.total++;
      return acc;
    },
    { active: 0, disabled: 0, total: 0 }
  );
}
function getStatus() {
  return `${state.blocks.length}${
    state.totalBlocks && state.files.length
      ? ` of ${state.totalBlocks.total} blocks (${colors.green("✔")}${
          state.totalBlocks.active
        }, ${colors.red("𝘅")}${state.totalBlocks.disabled})`
      : " blocks"
  } from ${state.files.length} files`;
}

// SUB MENUS

async function pickFilesMenu(yargs: Yargs = {}) {
  const validate = menuValidator<string>("select a dotfile source");

  const choice = await multiSelect({
    message: "Source Files",
    pageSize: 30,
    canToggleAll: true,
    loop: true,
    defaultValue: state.files,
    validate,
    options: async (input) => {
      let matches = await globAsync(state.filter, {
        ignore: ["**/node_modules/**", "**/build/**"],
      });

      if (input) {
        const inputLower = input.toLowerCase();
        matches = matches.filter((path) =>
          path.toLowerCase().includes(inputLower)
        );
      }
      return matches.map((path) => ({
        name: yargs.demo ? path.replace(getDemoPath().dirname, "") : path,
        value: path,
      }));
    },
  });

  if (choice) {
    state.files = choice.filter((c): c is string => c !== null);
  }
}

async function pickBlocksMenu() {
  const validate = menuValidator<Block>("pick a block");

  const choice = await multiSelect({
    message: "Choose Blocks",
    pageSize: 30,
    canToggleAll: true,
    loop: true,
    defaultValue: state.blocks,
    equals: (a, b) => a.content === b.content,
    validate,
    options: async (input) => {
      let matches = await getRunnableBlocks(state.files, {
        includeDisabled: true,
      });

      if (input) {
        const inputLower = input.toLowerCase();
        matches = matches.filter((block) =>
          block.meta.toLowerCase().includes(inputLower)
        );
      }

      return matches.map((block) => ({
        name: block.label,
        value: block,
        checked: state.blocks.some(
          (selectedBlock) => selectedBlock.content === block.content
        ),
        disabled: block.disabled ? `(${block.disabled})` : false,
      }));
    },
  });

  if (choice) state.blocks = choice;
}

async function inspectMenu() {
  // TODO: consider making this an "expand" menu
  const thePreview = await multiSelect<Block | null, false>({
    message: "Inspect Blocks",
    pageSize: 30,
    multiple: false,
    loop: true,
    equals: (a, b) => a?.content === b?.content,
    options: (input) => {
      let matches = state.blocks;

      if (input) {
        const inputLower = input.toLowerCase();
        matches = matches.filter((block) =>
          block.meta.toLowerCase().includes(inputLower)
        );
      }

      return [
        { name: "[back]", value: null },
        ...matches.map((block) => ({
          name: block.label,
          value: block,
        })),
      ];
    },
  });

  if (thePreview) {
    // [sourceFile] symlink(ini) -> .gitignore
    console.log(
      colors.underline(
        `${colors.green(thePreview.source)} | ${thePreview.options?.action}(${
          thePreview.lang
        }) -> ${thePreview.options?.targetPath ?? ""}`
      )
    );

    console.log(`${thePreview.content}\n`);

    const keep = await confirm({
      message: "Include this block?",
    });

    if (!keep) {
      state.blocks = state.blocks.filter(
        (someBlock) => someBlock.content !== thePreview.content
      );
    }
    // return to the inspection menu
    await inspectMenu();
  }
}

async function makeDotfilesMenu(yargs: Yargs = {}) {
  const isAuto = yargs?.dotfile && yargs?.auto;

  if (isAuto || (await confirm({ message: `Build ${getStatus()}?` }))) {
    console.log(`Building ${getStatus()}:`);
    const now = new Date().toISOString();

    for (const [i, block] of Object.entries(state.blocks)) {
      await executeBlock(now)(block, i);
    }

    if (isAuto || (await confirm({ message: "exit?" }))) process.exit(0);
  } else {
    await sleep(500);
    console.log("(cancelled)");
  }
}

async function manageCacheMenu() {
  if (!existsSync(cache.path)) {
    await saveSettingsMenu();
    return;
  }

  const { blocks, files } = cache.get();

  let choices: SelectOption<"[back]" | "save" | "load" | "remove">[] = [
    { value: "[back]" },
    {
      name: "Save Settings",
      value: "save",
      disabled:
        blocks.every(({ content: savedContent }) =>
          state.blocks.find(
            ({ content: newContent }) => savedContent === newContent
          )
        ) &&
        files.every((savedFile) =>
          state.files.find((newFile) => savedFile === newFile)
        )
          ? "(all blocks already saved)"
          : false,
    },
  ];

  if (existsSync(cache.path)) {
    choices = choices.concat([
      { name: "Load Settings", value: "load" },
      { name: "Remove Settings", value: "remove" },
    ]);
  }

  const choice = await select({
    message: "Settings",
    choices,
  });

  switch (choice) {
    case "save":
      await saveSettingsMenu();
      break;
    case "load":
      await loadSettingsMenu();
      break;
    case "remove":
      await removeSettingsMenu();
      break;
  }
}

async function saveSettingsMenu() {
  if (await confirm({ message: "Save selections for next time?" })) {
    cache.set(state);
    console.log(`saved to ${cache.path}`);
  }
}
async function loadSettingsMenu() {
  if (await confirm({ message: "Load saved selections?" })) {
    state = cache.get();
    return true;
  }
  return false;
}
async function removeSettingsMenu() {
  if (await confirm({ message: "Are you sure?" })) cache.remove();
}

async function preExitMenu() {
  await saveSettingsMenu();

  process.exit(0);
}
