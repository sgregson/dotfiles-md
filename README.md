# Literate Dotfiles

Every code block in a folder of Markdown can be compiled, symlinked, or run.

## Usage

> Requires NodeJS to be installed

1. navigate to your folder of markdown files
1. Run `npx dot-md`

## Installation

It's recommended to run the command line tool via `npx` rather than installing a local copy.

> To use offline, `npm i -g dot-md` and run with `npx dot-md --no`. NOTE: this will not auto-update

Read CONTRIBUTING.md for contributing code changes or installing locally.

## Why?

**literate markdown** IMO dotfiles should be organized in a way that makes sense to you, for fast recall and organization – but you ultimately need to either place them in a specific location or manipulate your `$PATH`.

I really liked the topic-centric approach of [other markdown systems] but found I need WAY more context than code comments since I update them so infrequently.

**CLI** All my old dotfiles systems relied on either a "bag of scripts" folder or someone else's CLI. I loved `kody` for a long time, but updating the actual dotfiles became difficult as my config grew stale.

## How this repo is organized

- `demo/`: A functional demo folder of dotfiles. see demo/README.md
- `dotfiles/`: My actual, personal, dotfiles. Use for inspiration or whatever
- `src/`: the CLI script codebase

## Code blocks as metadata

Each codeblock is created with three backticks (`) or tildes (~) and is provided extra data in a **space-delimited** collection:

    ```<lang> [filePath] [...options]
    ```

The `<lang>` is the usual markdown code block langauge format. It is used to specify the syntax highlighting of the code snippet but may in the future be used to direct the `action=run` directive.

A `[filePath]` may be provided in order to direct the output of the code block. It **must not** contain an equals sign `=`.

The `[...options]` array is a space-delimited list of `key=value` directives defining how the CLI should act on this code block:

- `disabled=true` disable this code block from being run (helpful for migrations)
- `title=<string>` a title for the code block to appear in the CLI. `<string>` **msut not** contain spaces.
- `action` defines what to do with the content
  - `=build`: build the file to `[filePath]`, replacing content as appropriate
  - `=symlink`: find-replace patterns (`%...`) in the codeblock and symlink the result (from `/build`) to `[filePath]`
  - `=include`: build the block into a place included in your shell (`/build/includes/`) TODO: not implemented
  - `=run`: run this code block according to the file syntax (js: node, sh: bash, zsh) TODO: not implemented yet
- `when` defines the availability of this codeblock
  - `=npm`: when npm is available (after nvm install)
  - `=os.platform()==='darwin'`: only on macos

[literate markdown]: http://www.literateprogramming.com/knuthweb.pdf

f
