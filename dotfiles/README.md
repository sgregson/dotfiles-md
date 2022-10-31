# My dotfiles

A bunch of markdown files which generally follow two conventions:

- anything that lives in ~/ is given an `action=symlink` (so I can track changes)
- anything that is `action=build`, I direct to `$HOME/.custom/` folder
  - That's basically for ease of access from other files (check out loading them in the zshrc block of [zsh/zsh.md])
