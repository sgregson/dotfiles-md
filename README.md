![a logo illustrating an arrow from a glob of markdown to a glob of dotfiles](./docs/banner.png)

<details><summary><sup><sub>banner image source</sub></sup></summary>
  
  ```html title="logo" disable=true
  <div style="height:3em;aspect-ratio: 6/1;font-size:3.6rem;font-weight:bold;background:linear-gradient(-0.075turn,#3f87a6,#ebf8e1,#f69d3c);color:white;text-shadow:1px 1px 3px black;display:grid;place-items:center;margin:2em 0">
    <div>
      <code style="background-color: rgba(0,0,0,.2);padding:.2em .5em;border-radius:.25em">*.md</code>
      →
      <code style="background-color: rgba(0,0,0,.2);padding:.2em .5em;border-radius:.25em">~/.*</code>
    </div>
  </div>
  ```

</details>


[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)

# dotfiles-md

Maintain your system configuration as a collection of installable markdown blocks

## Usage

Simply navigate to your folder of markdown and then run the interactive CLI:

```
$ npx dotfiles-md
```

> _**Requires:** node.js_. See [contributing] for instructions on installing a local copy

[contributing]: #contributing

### CLI Commands

_run the `help` command to view help pages_

`config` set the parameters for your CLI

- **settings** – interactive prompt to define:
  - `name=<string>` personalize your CLI if you like
  - `pattern=<glob>` to define the matching parameters
- **refresh** – refresh the file list
- **reset** - reset the CLI settings

`select` select files to use as dotfles sources

`run` select the code blocks to build into dotfiles (from the selected files)

## Features

**Code block metadata**

Each codeblock is created with three backticks (`) or tildes (~) and assigned a **space-delimited** collection of metadata:

    ```<lang> [filePath] [...options]
    ```

This should generally be compatible with other documentation systems.

The **`<lang>` directive** is the usual markdown code block langauge format. It is used to specify the syntax highlighting of the code snippet but may in the future be used to direct the `action=run` directive.

A **`[filePath]` option** may be provided in order to direct the output of the code block. It **must not** contain an equals sign `=`.

The **`[...options]` array** is a space-delimited list of `key=value` directives defining how the CLI should act on this code block. Values must be quoted if they contain spaces as in, `key="Some Value"`.

**Codeblock Options (and actions)**

- `title=<string>` a title for the code block to appear in the CLI. `<string>` must be quoted if it contains spaces.
- `action` defines what to do with the content:
  - `=build`: build the file to `[filePath]`, replacing content as appropriate
  - `=symlink`: find-replace patterns (`%...`) in the codeblock and symlink the result (from `/build`) to `[filePath]`
  - `=run`: run this code block according to the file syntax (js: node, sh: bash, zsh)
- `when` defines the availability of this codeblock
  - `=os.darwin`, `=os.win32`: platform-specific dotfiles
- `disabled=true` prevent a block from being run (helpful for migrations)

## Contributing

Contributions are always welcome!

See `CONTRIBUTING.md` for ways to get started.

Please adhere to a reasonable `code of conduct`.

### Install or Run Locally

```sh action=run title="install and run dotfiles-md" disable=true
# Clone the project
git clone git@github.com:sgregson/dotfiles-md.git
# Go to the project directory
cd dotfiles-md
# Install dependencies
yarn
# Run the interactive CLI
npx dotfiles-md --help
```

## Roadmap

- [x] implement `when=<conditions>` (v0.3.0)
- [x] implement `action=run` (v0.4.6) for imperative settings (see [demo/README.md](demo/README.md))
- [ ] implement find-replace from `.env` files
  - idea: command to find all replacement keys in dotfiles (create a `.env.schema` from MD contents) for use with `dotenv-extended`
- (idea) Title codeblocks from nearest heading (To support spaces and use as fallback for missing `title=`)
- (idea) Update & Improve Interface UI: 2-panel layout for navigation and show a codeblock
- (idea) Generate diff when file a exists instead of the current overwrite/backup flow

## FAQ

#### Why markdown files?

Specifically, **literate markdown**. IMHO dotfiles (or configuration in general) should be organized in a way that makes sense to you for fast recall and organization. From there you can choose whether to manipulate your `$PATH` or direct them to known defaults (like `~/.gitconfig` vs `!/.config/git/config`).

I also really liked the topic-centric approach of other dotfiles managers (like [holman/dotfiles](https://github.com/holman/dotfiles)) but found I need to give myself WAY more context on the operations than code comments since I update them so infrequently.

#### Why an interactive CLI?

All my old dotfiles systems relied on either a "bag of scripts" folder or someone else's CLI. I loved using [kody](https://github.com/jh3y/kody) for a long time, but updating the dotfiles became difficult as my config grew stale.

#### Why the repo structure?

- `demo/`: A functional demo folder of dotfiles. see demo/README.md
- `dotfiles/`: My actual, personal, dotfiles. Use for inspiration or whatever
- `src/`: the CLI script codebase
