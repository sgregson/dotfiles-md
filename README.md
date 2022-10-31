# Literate Dotfiles

Every code block in a folder of Markdown can be compiled, symlinked, or run.

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

    ```[syntax] [filePath] [...options]
    ```

The `[syntax]` is specified in the usual markdown manner, and is only used to specify the syntax highlighting of the code snippet.

The `[filePath]` may be used to title the code block, and may be used according to the `[options]` specified. It **must not** contain an equals sign `=`.

The `[...options]` array describes a list of `key=value` specifiers which may define how the repo ought to act on this code block.

- `disabled=true` disable this code block from being run (legacy stuff)
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
