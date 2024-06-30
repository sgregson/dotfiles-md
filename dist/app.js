import { confirm, select, Separator } from "@inquirer/prompts";
import { globAsync, getRunnableBlocks, existsSync, cache, clearScreen, sleep, executeBlock, } from "./api.js";
import { select as multiSelect, } from "inquirer-select-pro";
import colors from "colors/safe.js";
let state = {
    filter: "**/*.md",
    files: [],
    blocks: [],
    totalBlocks: undefined,
};
// execute if invoked directly
if (process.argv[1].endsWith("app.js")) {
    Run("init");
}
export async function Run(status) {
    var _a;
    // Init: clear the screen
    clearScreen();
    // Load saved content from $DOTFILE or .dotfile-md-cache
    if (process.env.DOTFILE) {
        let theFile = existsSync(process.env.DOTFILE);
        if (!theFile) {
            console.log(`$DOTFILE=${process.env.DOTFILE} not found.`);
            await sleep(500);
        }
        else {
            console.log(`Found ${theFile}:`);
            state.files = [theFile];
            state.blocks = await getRunnableBlocks(state.files, {
                includeDisabled: false,
            });
            state.totalBlocks = (_a = (await getRunnableBlocks(state.files, {
                includeDisabled: true,
            }))) === null || _a === void 0 ? void 0 : _a.length;
            await makeDotfilesMenu();
        }
    }
    else if (existsSync(cache.path)) {
        await loadSettingsMenu();
    }
    // Run the app! Loops until we run the exit menu
    while (status !== "[exit]") {
        status = await Main();
        // Clear screen between runs of Main()
        if (status !== "[exit]")
            clearScreen();
    }
}
function getStatus() {
    return `${state.blocks.length}${state.totalBlocks ? ` of ${state.totalBlocks}` : ""} blocks from ${state.files.length} files`;
}
/**
 * MAIN MENU
 * 1. source files
 * 2. source blocks from those files
 * 3. (optional) inspect the content of the blocks
 * 4. build the dotfiles
 */
async function Main() {
    var _a;
    const hasSettings = existsSync(cache.path);
    state.totalBlocks = (_a = (await getRunnableBlocks(state.files, {
        includeDisabled: true,
    }))) === null || _a === void 0 ? void 0 : _a.length;
    console.log(`Selected: ${getStatus()}`);
    const choice = await select({
        message: "Main Menu",
        pageSize: 10,
        default: state.blocks.length > 0
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
                disabled: (state.blocks.length === 0 || state.files.length === 0) &&
                    !hasSettings
                    ? "(select files or blocks)"
                    : false,
            },
            { value: "[exit]" },
        ],
    });
    switch (choice) {
        case "pickFiles":
            await pickFilesMenu();
            break;
        case "pickBlocks":
            await pickBlocksMenu();
            break;
        case "inspect":
            await inspectMenu();
            break;
        case "makeDotfiles":
            await makeDotfilesMenu();
            break;
        case "manageCache":
            await manageCacheMenu();
            break;
        case "[exit]":
            await preExitMenu();
    }
    return choice;
}
async function pickFilesMenu() {
    const choice = await multiSelect({
        message: "Source Files",
        pageSize: 30,
        canToggleAll: true,
        loop: true,
        defaultValue: state.files,
        options: async (input) => {
            let matches = await globAsync(state.filter, {
                ignore: ["**/node_modules/**", "**/build/**"],
            });
            if (input) {
                const inputLower = input.toLowerCase();
                matches = matches.filter((path) => path.toLowerCase().includes(inputLower));
            }
            return matches.map((path) => ({
                name: path,
                value: path,
            }));
        },
    });
    if (choice) {
        state.files = choice.filter((c) => c !== null);
    }
}
async function pickBlocksMenu() {
    const choice = await multiSelect({
        message: "Choose Blocks",
        pageSize: 30,
        canToggleAll: true,
        loop: true,
        defaultValue: state.blocks,
        equals: (a, b) => a.content === b.content,
        options: async (input) => {
            let matches = await getRunnableBlocks(state.files, {
                includeDisabled: true,
            });
            if (input) {
                const inputLower = input.toLowerCase();
                matches = matches.filter((block) => block.meta.toLowerCase().includes(inputLower));
            }
            return matches.map((block) => ({
                name: block.label,
                value: block,
                checked: state.blocks.some((selectedBlock) => selectedBlock.content === block.content),
                disabled: block.disabled ? `(${block.disabled})` : false,
            }));
        },
    });
    if (choice)
        state.blocks = choice;
}
async function inspectMenu() {
    var _a, _b, _c;
    // TODO: consider making this an "expand" menu
    const thePreview = await multiSelect({
        message: "Inspect Blocks",
        pageSize: 30,
        multiple: false,
        loop: true,
        equals: (a, b) => (a === null || a === void 0 ? void 0 : a.content) === (b === null || b === void 0 ? void 0 : b.content),
        options: (input) => {
            let matches = state.blocks;
            if (input) {
                const inputLower = input.toLowerCase();
                matches = matches.filter((block) => block.meta.toLowerCase().includes(inputLower));
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
        console.log(colors.underline(`${colors.green(thePreview.source)} | ${(_a = thePreview.options) === null || _a === void 0 ? void 0 : _a.action}(${thePreview.lang}) -> ${(_c = (_b = thePreview.options) === null || _b === void 0 ? void 0 : _b.targetPath) !== null && _c !== void 0 ? _c : ""}`));
        console.log(`${thePreview.content}\n`);
        const keep = await confirm({
            message: "Include this block?",
        });
        if (!keep) {
            state.blocks = state.blocks.filter((someBlock) => someBlock.content !== thePreview.content);
        }
        // return to the inspection menu
        await inspectMenu();
    }
}
async function makeDotfilesMenu() {
    if (await confirm({ message: `Build ${getStatus()}?` })) {
        await Promise.all(state.blocks.map(executeBlock));
        if (await confirm({ message: "exit?" }))
            process.exit(0);
    }
    else {
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
    let choices = [
        { value: "[back]" },
        {
            name: "Save Settings",
            value: "save",
            disabled: blocks.every(({ content: savedContent }) => state.blocks.find(({ content: newContent }) => savedContent === newContent)) &&
                files.every((savedFile) => state.files.find((newFile) => savedFile === newFile))
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
    if (await confirm({ message: "Load saved selections?" }))
        state = cache.get();
}
async function removeSettingsMenu() {
    if (await confirm({ message: "Are you sure?" }))
        cache.remove();
}
async function preExitMenu() {
    await saveSettingsMenu();
    process.exit(0);
}
