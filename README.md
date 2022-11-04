![banner logo](docs/banner.png)

<!-- Add badges from eg: [shields.io](https://shields.io/) -->

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

The **`[...options]` array** is a space-delimited list of `key=value` directives defining how the CLI should act on this code block (see next).

**Codeblock Options (and actions)**

- `disabled=true` disable this code block from being run (helpful for migrations)
- `title=<string>` a title for the code block to appear in the CLI. `<string>` **msut not** contain spaces.
- `action` defines what to do with the content
  - `=build`: build the file to `[filePath]`, replacing content as appropriate
  - `=symlink`: find-replace patterns (`%...`) in the codeblock and symlink the result (from `/build`) to `[filePath]`
  - `=run`: run this code block according to the file syntax (js: node, sh: bash, zsh) TODO: not implemented yet

<!-- - `when` defines the availability of this codeblock
  - `=npm`: when npm is available (after nvm install)
  - `=os.platform()==='darwin'`: only on macos -->

## Contributing

Contributions are always welcome!

See `CONTRIBUTING.md` for ways to get started.

Please adhere to a reasonable `code of conduct`.

### Install or Run Locally

```sh
# Clone the project
git clone git@github.com:sgregson/dotfiles-md.git
# Go to the project directory
cd dotfiles-md
# Install dependencies
yarn
# Run the interactive CLI
yarn start
```

## Roadmap

- implement `action=run` for imperative settings (see [macos.md](src/macos/macos.md))
- implement find-replace from `.env` files
- implement `when=<conditions>` for to limit availability of code blocks (os.platform() = darwin, when nvm is availability)

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

## Related

Here are some related projects

[Awesome README](https://github.com/matiassingers/awesome-readme)
