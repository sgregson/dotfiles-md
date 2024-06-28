import { confirm, select } from "@inquirer/prompts";
import { globAsync, getRunnableBlocks, } from "./api.js";
import { select as multiSelect } from "inquirer-select-pro";
let state = {
    status: "init",
    filter: "**/*.md",
    files: [],
    blocks: [],
};
(async function Main() {
    console.log("\u001b[2J\u001b[0;0H");
    console.log(`Selected: ${state.blocks.length} blocks from ${state.files.length} files`);
    const choice = await select({
        message: "Main Menu",
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
                disabled: state.files.length === 0 && "(pick files first)",
            },
            {
                name: "Inspect Blocks",
                value: "inspect",
                description: "inspect the blocks before you add them to your system",
                disabled: state.blocks.length === 0 && "(no blocks to inspect)",
            },
            {
                name: "Make Dotfile",
                value: "makeDotfiles",
                disabled: state.blocks.length === 0 && "(add files and blocks)",
            },
            { name: "exit", value: "exit" },
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
        case "exit":
            await preExitMenu();
    }
    await Main();
})();
async function pickFilesMenu() {
    const choice = await multiSelect({
        message: "Source Files",
        pageSize: 30,
        options: async (input) => {
            let matches = await globAsync(state.filter);
            if (input) {
                const inputLower = input.toLowerCase();
                matches = matches.filter((path) => path.toLowerCase().includes(inputLower));
            }
            return matches.map((path) => ({ name: path, value: path }));
        },
    });
    if (choice)
        state.files = choice.filter((c) => c !== null);
}
async function pickBlocksMenu() {
    const choice = await multiSelect({
        message: "Choose Blocks",
        pageSize: 30,
        canToggleAll: true,
        options: async (input) => {
            let matches = await getRunnableBlocks(state.files);
            if (input) {
                const inputLower = input.toLowerCase();
                matches = matches.filter((block) => block.meta.toLowerCase().includes(inputLower));
            }
            return matches.map((block) => {
                var _a, _b, _c;
                return ({
                    name: (_a = block.meta) !== null && _a !== void 0 ? _a : block.content,
                    value: block,
                    checked: state.blocks.some((selectedBlock) => selectedBlock.content === block.content),
                    disabled: ((_b = block.options) === null || _b === void 0 ? void 0 : _b.disabled)
                        ? `(${(_c = block.options) === null || _c === void 0 ? void 0 : _c.disabled})`
                        : false,
                });
            });
        },
    });
    if (choice)
        state.blocks = choice;
}
async function inspectMenu() {
    const choice = await multiSelect({
        message: "Inspect Blocks",
        pageSize: 1,
        options: state.blocks.map((block) => ({
            name: `${block.meta}\n${block.content}\n----------\n`,
            value: block,
            checked: true,
        })),
    });
    if (choice)
        state.blocks = choice;
}
async function makeDotfilesMenu() { }
async function preExitMenu() {
    if (await confirm({ message: "Continue?" })) {
        // TODO: create a .dotfiles-md cache file
        process.exit(0);
    }
    console.log("\n...resuming");
}
