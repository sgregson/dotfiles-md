A codeblock without an `action=*` annotation will do nothing

```md
_sometimes you don't want to run a code block_
```

The basic build action converts codeblocks to files:

```md build/local-built.md action=build title=demo-action-build
> source: local.md, code block #2

How cool is this?

- the data source is a markdown block in src/in.md
- it's built automatically and placed wherever you define in the opening tag
```

The `action=symlink` file will convert codeblocks to a file in `/build/*` and symlink it to the specified location. Naturally, you can use the home directory reference in the file destination: `md ~/demo-symlink.md action=symlink`

```md build/local-symlink.md action=symlink title=demo-action-symlink(local)
> source: local.md, code block #3
```

(TODO:) The `action=run` flag will run the codeblock according to the appropriate interpreter (filePath is unused):

```sh action=run title=demo-action-run
echo "hello world";
```
