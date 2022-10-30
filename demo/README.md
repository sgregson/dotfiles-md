# About this demo

> This folder is all you need to bring to the

## Contents

```md
- `.env` (optional) Set key-value pairs for replacement
- `**/*.md` Your markdown-formatted dotfiles
```

## Usage

The CLI builds `action=symlink` codeblocks to the current working directory (`${process.cwd()}/build/links`) and any `action=build` codeblocks missing a file target. For a basic non-interactive demo:

```sh
# from literate-dotfiles/demo/
$ node ../cli.mjs run -- --actions=symlink,build --selected=local.md
```

Which is the equivalent to an interactive CLI:

1. node `../cli.mjs`
1. enter `config`, select `refresh`
1. enter `select`, select the `local.md` file
1. enter `run`, select `symlink` and `build`, and run the code blocks
