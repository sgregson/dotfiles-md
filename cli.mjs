#!/usr/bin/env node
import { Run } from "./dist/app.js";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const args = yargs(hideBin(process.argv))
  .usage("Usage: $0 [options] [dotfile]")
  .example("$0", "interactively run the app")
  .alias("d", "dotfile")
  .describe("d", "Load dotfiles from a single markdown file")
  .boolean("auto")
  .describe("auto", "Auto-accept the provided file")
  .boolean("demo")
  .describe("demo", "Use the bundled demo files")
  .example("$0 --auto README.md", "create every enabled dotfile in README.md")
  .example("DEBUG=true $0", "run with verbose debugging")
  .help("h")
  .alias("h", "help")
  .version(false)
  .epilog("(GPL 2024)")
  .parse();

// read explicit --file="" or implicit npx dotfiles-md SOMEFILE.md
args.dotfile = args.dotfile ?? args._[0];

Run("init", args);
