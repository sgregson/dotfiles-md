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
$ node ../cli.mjs run --actions symlink,build --selected README.md
```

Which is the equivalent to an interactive CLI:

1. node `../cli.mjs`
1. enter `config`, select `refresh`
1. enter `select`, select the `README.md` file
1. enter `run`, select `symlink` and `build`, and run the code blocks

## dotfiles

A codeblock without an `action=*` annotation will do nothing

```md
_sometimes you don't want to run a code block_
```

The basic build action converts codeblocks to files:

```md build/readme-built.md action=build title=demo-action-build
> source: README.md, code block #2

How cool is this?

- the data source is a markdown block in src/in.md
- it's built automatically and placed wherever you define in the opening tag
```

The `action=symlink` file will convert codeblocks to a file in `/build/*` and symlink it to the specified location. Naturally, you can use the home directory reference in the file destination: `md ~/demo-symlink.md action=symlink`

```md build/readme-symlink.md action=symlink title=demo-action-symlink(local)
> source: README.md, code block #3
```

Run this example to create a symlink in your home directory `~/global-symlink.md` to `../build/#-global-symlink.md`

```md $HOME/global-symlink.md action=symlink title=demo-action-symlink(global)
Hello world!
```

---

#### Future: `action=run`

The `action=run` flag will run the codeblock according to the appropriate interpreter (filePath is unused):

```sh action=run title=demo-action-run disabled=true
echo "hello world";
```

### future: find-replace from .env

All blocks will support replacements from your own `.env` file

```js ../out/hello-world.js action=build title=find-replace-demo disabled=true
// source: hello world.md
console.log("hello world", "%S3_BUCKET");
```
