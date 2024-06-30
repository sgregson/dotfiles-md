#!/usr/bin/env node
import { Run } from "./dist/app.js";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

var argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 [dotfile]")
  .example("$0", "run the app")
  .alias("f", "file")
  .describe("f", "Load a single markdown file")
  // .demandOption(["f"])
  .help("h")
  .alias("h", "help")
  .version(false)
  .epilog("(GPL 2024)")
  .parse();

// read explicit --file="" or implicit npx dotfiles-md SOMEFILE.md
process.env.DOTFILE = process.env.DOTFILE ?? argv.dotfile ?? argv._[0];

Run("init");
