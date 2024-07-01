# A Dotfiles Demo

> A functional demo of markdown-managed dotfiles.

## Usage

```sh
npx dotfiles-md --demo
```

## Context

### Contents

```md title="demo contents" disabled=true
- `.env` (optional) set key-value pairs for replacement
- `**/*.md` dotfiles stored as markdown
```

### Usage

The CLI builds `action=symlink` codeblocks to the current working directory (`${process.cwd()}/build/links`) and any `action=build` codeblocks missing a file target. For a basic non-interactive demo:

```sh title="demo usage" disabled=true
# From the repo
cd demo/
# Run the tool (select this file and the blocks you want to view)
npx dotfiles-md
# Observe the resulting files
ls -al ./build
```

## The Dotfiles
> **tip**: View the raw markdown file to see the metadata on each codeblock

A codeblock without an `action=*` annotation does nothing and won't appear in the CLI

```md
_sometimes you don't want to run a code block_
```


### TODO: replace with `./.env` matches

All blocks will support replacements from your own `.env` file

```js ../out/hello-world.js action=build title=find-replace-demo disabled=true
// source: hello world.md
console.log("hello world", "%S3_BUCKET");
```
