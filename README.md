# Spencer's dotefiles

In this dotfiles repo, treat all `dotfiles/**/*.md` files as [literate markdown] where each codeblock can be executed according to its rules.

## Literate Codeblock

Each codeblock is created with three backticks (`) or tildes (~) and is provided extra data in a **space-delimited** collection:

    ```[syntax] [filePath] [...options]
    ```

The `[syntax]` is specified in the usual markdown manner, and is only used to specify the syntax highlighting of the code snippet.

The `[filePath]` may be used to title the code block, and may be used according to the `[options]` specified. It **must not** contain an equals sign `=`.

The `[...options]` array describes a list of `key=value` specifiers which may define how the repo ought to act on this code block.

- `action` defines what to do with the content
  - **`=build` (default):** build the file to `[filePath]`, replacing content as appropriate
  - `=run`: run this code block according to the file syntax (js: node, sh: bash, zsh)
  - `=symlink`: find-replace patterns (`%...`) in the codeblock and symlink the result (from `/build`) to `[filePath]`
- `when` defines the availability of this codeblock
  - `=npm`: when npm is available (after nvm install)
  - `=os.platform()==='darwin'`: only on macos

[literate markdown]: http://www.literateprogramming.com/knuthweb.pdf

f
