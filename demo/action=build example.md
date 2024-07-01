# Build Actions

The basic build action converts a block of code into a file.

![screenshot](./action=build_screenshot.png)

```md hello-world(build).md action=build title="Build: Hello World"
> source: `demo/action=build example.md` https://www.npmjs.com/package/dotfiles-md?activeTab=code

# Hello World!

This built dotfile comes from the `action=build example.md` file of the library.

With action=build, files are built directly to the location specified in the code block's metadata.
```
