# My Dotfiles

A bunch of markdown files which generally follow two conventions:

- anything that lives in ~/ is given an `action=symlink` (so I can track changes)
- anything that is `action=build`, I direct to `$HOME/.custom/` folder
  - That's basically for ease of access from other files (check out loading them in the zshrc block of [zsh/zsh.md](./shell/zsh.md))

```md action=section
Spencerʼs Dotfiles
```

## shell

Load node versions automatically based on directory

```sh $HOME/.custom/fnm.sh action=symlink title="use fnm on directory change"
echo "...using fnm ($1)"
eval "$(fnm env --use-on-cd)"
```

```sh $HOME/.custom/nvm.sh action=symlink title="nvm loader" disabled="use fnm"
# source $HOME/.custom/nvm.sh 'callsite'
if [ -d ~/.nvm/ ]; then
# load NVM
  echo "...using NVM ($1)"
  source ~/.nvm/nvm.sh --no-use
else
  # Install NVM if it doesn't exist (first run)
  echo "...missing NVM, attempting to install"
  git clone https://github.com/creationix/nvm.git ~/.nvm && cd ~/.nvm && git checkout `git describe --abbrev=0 --tags` && cd -

  if [ ! -d ~/.nvm/ ]; then
    source ~/.nvm/nvm.sh --no-use
  fi
fi

auto-switch-node-version() {
  NVMRC_PATH=$(nvm_find_nvmrc)
  CURRENT_NODE_VERSION=$(nvm version)

  if [[ ! -z "$NVMRC_PATH" ]]; then
    # .nvmrc file found!

    # Read the file
    REQUESTED_NODE_VERSION=$(cat $NVMRC_PATH)

    # Find an installed Node version that satisfies the .nvmrc
    MATCHED_NODE_VERSION=$(nvm_match_version $REQUESTED_NODE_VERSION)

    if [[ ! -z "$MATCHED_NODE_VERSION" && $MATCHED_NODE_VERSION != "N/A" ]]; then
      # A suitable version is already installed.

      # Clear any warning suppression
      unset AUTOSWITCH_NODE_SUPPRESS_WARNING

      # Switch to the matched version ONLY if necessary
      if [[ $CURRENT_NODE_VERSION != $MATCHED_NODE_VERSION ]]; then
        nvm use $REQUESTED_NODE_VERSION
      fi
    else
      # No installed Node version satisfies the .nvmrc.

      # Quit silently if we already just warned about this exact .nvmrc file, so you
      # only get spammed once while navigating around within a single project.
      if [[ $AUTOSWITCH_NODE_SUPPRESS_WARNING == $NVMRC_PATH ]]; then
        return
      fi

      # Convert the .nvmrc path to a relative one (if possible) for readability
      RELATIVE_NVMRC_PATH="$(realpath --relative-to=$(pwd) $NVMRC_PATH 2> /dev/null || echo $NVMRC_PATH)"

      # Print a clear warning message
      echo ""
      echo "WARNING"
      echo "  Found file: $RELATIVE_NVMRC_PATH"
      echo "  specifying: $REQUESTED_NODE_VERSION"
      echo "  ...but no installed Node version satisfies this."
      echo "  "
      echo "  Current node version: $CURRENT_NODE_VERSION"
      echo "  "
      echo "  You might want to run \"nvm install\""

      # Record that we already warned about this unsatisfiable .nvmrc file
      export AUTOSWITCH_NODE_SUPPRESS_WARNING=$NVMRC_PATH
    fi
  else
    # No .nvmrc file found.

    # Clear any warning suppression
    unset AUTOSWITCH_NODE_SUPPRESS_WARNING

    # Revert to default version, unless that's already the current version.
    # NOTE: ONLY UNCOMMENT FOR SLOW TERMINAL STARTUP
    # if [[ $CURRENT_NODE_VERSION != $(nvm version default)  ]]; then
    #   nvm use default
    # fi
  fi
}

# Run the above function in ZSH whenever you change directory
autoload -U add-zsh-hook
add-zsh-hook chpwd auto-switch-node-version
auto-switch-node-version
```

```sh $HOME/.custom/wayfair.sh action=symlink title="wayfair shell aliases" disabled="legacy"
#! /bin/zsh

alias wayproxy="docker run --rm -p 443:443 -v ~/.local-certs:/certs wayfair/local-https-proxy"
```

```sh $HOME/.custom/env.sh action=symlink title="private environment variables"
# Manage environment variables with 1Password CLI (was installed via homebrew)
# op signin [VaultName]
echo "...fetch env"

# https://rossedman.io/blog/computers/setting-env-vars-from-1password/
export MAPBOX_ACCESS_TOKEN=$(op read op://Personal/MAPBOX_ACCESS_TOKEN/password)
export DAISYDISK_LICENSE=$(op read op://Personal/DAISYDISK_LICENSE/password)
export BUNDLE_GEMS__GRAPHQL__PRO=$(op read op://huntclub/graphql-pro/password)

# apply the sublimerge licence
if [ -d "$HOME/Library/Application Support/Sublime Text 3/" ]; then
  echo "{\"key\": \"$(op read op://Personal/SUBLIMERGE_LICENSE/password)\"" > "$HOME/Library/Application Support/Sublime Text 3/Packages/User/Sublimerge.sublime-license"
fi
```

## Homebrew

```sh action=run title="Homebrew taps" when=os.darwin
# brew tap buildkite/cli
# brew tap caskroom/fonts;
brew tap homebrew/bundle;
brew tap ikuwow/imgcat;
# brew tap joeyhoer/extras;                   # 💀 appears dead
brew tap mapbox/cli;
brew tap welldan97/whereami;
```

```sh action=run title="Homebrew formulas" when=os.darwin
brew install asdf;
# brew install git
brew install bk;
brew install deno;
brew install fzf;
brew install fnm;
brew install gitleaks;                        # secret scanning for git repos
brew install gh;                              # github CLI
brew install imgcat;
# brew install jppoeyhoer/extras/gzthermal;   # 💀 appears dead
brew install jq;
# brew install jrnl;
# brew install kryptco/tap/kr
brew install mapbox/cli/mapbox;
brew install meetingbar;
# brew install mr;
# brew install pinentry-mac;                  # GPG Pinentry command
# brew install rbenv;                         # replaced by asdf
brew install spark;                           # sparklines ▁▁▂▃▄▅▆▇█ in terminal
brew install whereami;
# brew install zsh;
brew install zsh-completions;
```

```sh action=run title="Homebrew casks" when=os.darwin
brew install --cask 1password-cli;            # secrets and password management
brew install --cask alfred;
brew install --cask cleanshot;                # great screenshot tool
brew install --cask daisydisk;                # storage analysis
brew install --cask discord;
brew install --cask dropbox;
brew install --cask firefox@developer-edition;
brew install --cask fluid;
# brew install --cask flux;                   # 💤 not needed (mac does this automatically now)
brew install --cask font-fira-code;
brew install --cask google-chrome;
brew install --cask google-cloud-sdk;
brew install --cask google-drive;
# brew install --cask hiddenbar;              # collapsible macos menubar
brew install --cask numi;
brew install --cask phoenix;
brew install --cask processing;
brew install --cask qlmarkdown
brew install --cask slack;
brew install --cask spotify;
# brew install --cask steam;
brew install --cask unnaturalscrollwheels;    # generally more reliable than scroll-reverser
brew install --cask visual-studio-code;
```

```sh $HOME/.custom/gcloud-brew.sh action=symlink title="google cloud sdk completions" when=os.darwin
source "$(brew --prefix)/share/google-cloud-sdk/path.zsh.inc"
source "$(brew --prefix)/share/google-cloud-sdk/completion.zsh.inc"
```

### ZSH Config

```md action=section
# ZSH CONFIG
```

```sh $HOME/.custom/glob.sh action=symlink title="ZSH extended globbing"
#! /bin/zsh
# Permit ZSH extended globbing
# only include in interactive shells (zshrc) - https://unix.stackexchange.com/questions/431805/zsh-is-there-a-problem-with-always-enabling-extended-glob
setopt extended_glob
```

```sh $HOME/.custom/zmv.sh action=symlink title="use ZMV for bulk renaming"
# Dry Run:$ zmv -n 'Page(*)/shot.jpg' 'shot-${1}.jpg'
# Actual: $ zmv 'Page(*)/shot.jpg' 'shot-${1}.jpg'
autoload zmv
alias mmv='noglob zmv -W'
alias zcp='zmv -C'
alias zln='zmv -L'
```

#### Shared Environment (.zshenv)

```sh $HOME/.zshenv action=symlink title=zshenv
# install nvm on first run,
# probably not a good idea to do here
# source $HOME/.custom/fnm.sh 'zshenv' TODO: can't load since homebrew hasn't loaded yet
```

#### Non-interactive shells (.zprofile)

The profile file for non-interactive terminal windows. Generally, only put the things in here you'd want to have available to scripts (not open terminal windows)

```sh $HOME/.zprofile action=symlink title=zprofile
# Set PATH, MANPATH, etc., for Homebrew.
# /Users/sgregson/.zprofile:7: no such file or directory: /opt/homebrew/bin/brew
# eval "$(/usr/local/bin/brew shellenv)"
eval "$(/opt/homebrew/bin/brew shellenv)"

# source Node Versions
source $HOME/.custom/fnm.sh 'zprofile'

export PATH="$PATH:$(python3 -m site --user-base)/bin"
export PATH="$(yarn global bin):$PATH"

# Add Visual Studio Code (code)
export PATH="$PATH":"/Applications/Visual Studio Code.app/Contents/Resources/app/bin"

# Enable rbenv for sublime plugins (linting)
# export PATH="$HOME/.rbenv/bin:$PATH"
# eval "$(rbenv init -)"


```

#### Login Shells(.zshrc)

```sh $HOME/.zshrc action=symlink title=zshrc
# User Config (references to other dotfiles)
source $HOME/.custom/aliases.sh
source $HOME/.custom/env.sh
source $HOME/.custom/zmv.sh
source $HOME/.custom/glob.sh
source $HOME/.custom/gcloud-brew.sh

export GPG_TTY=$(tty)

echo "fnm $(fnm current)"

## source fuzzy find completions for zsh
source <(fzf --zsh)

# load ASDF tool
source "$(brew --prefix asdf)/libexec/asdf.sh"

## Support yarn global binaries
export PATH="$(yarn global bin):$PATH"
```


### Aliases
`gs` and `gdc` are in daily use

```sh $HOME/.custom/aliases.sh action=symlink title="Shell Aliases, git etc"
alias g="git"
alias gf="git fetch"
# alias go="git checkout"
alias gs="git status"
alias gd="git diff"
alias gdc="git diff --cached"
# alias squash="git merge --squash"

alias jfdi="pushd ~/Code/dotfiles-md/ && yarn jfdi && popd"
```

## git
```md action=section
# Git
```

### Global gitconfig

```ini $HOME/.gitconfig action=symlink title="global gitconfig"
[init]
  templatedir = ~/.git-templates
[user]
  name = Spencer Gregson
  email = sgregson@users.noreply.github.com
  signingkey = ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN8v19rW4ftIjw2zofl4kzDYvtSko9X8DG0NHXWPA1g1
; [includeIf "hasconfig:remote.*.url:**/csnzoo/**"]
[includeIf "gitdir:~/Documents/Code/Wayfair/"]
  path = ~/.gitconfig-csnzoo
[gpg]
  program = gpgs
  format = ssh
[gpg "ssh"]
  program = "/Applications/1Password.app/Contents/MacOS/op-ssh-sign"
[commit]
  gpgSign = true
	template = /Users/sgregson/.gitmessage
[core]
  editor = code --wait
  autocrlf = false
  pager = less -+$LESS -FRSX # prevents diff commands from going to altscreen
  excludesfile = ~/.gitignore
[color]
  diff = auto
  status = auto
  branch = auto
  interactive = auto
  ui = true
  pager = true
[color "branch"]
  upstream = red
# [credential]
#   helper = cache --timeout=3600
[diff]
  tool = vscode
  compactionHeuristic = true
[difftool "meld"]
  trustExitCode = true
  cmd = open -W -a Meld --args \"$LOCAL\" \"$PWD/$REMOTE\"
[difftool "vscode"]
  cmd = code --wait --diff \"$LOCAL\" \"$REMOTE\"
[difftool "sublimerge"]
  cmd = subl-diff \"$LOCAL\" \"$REMOTE\"
[difftool "diffmerge"]
  cmd = /usr/local/bin/diffmerge \"$LOCAL\" \"$REMOTE\"
[fetch]
  prune = true
[merge]
  conflictstyle = diff3
  tool = vscode
  keepBackup = false
[mergetool]
  prompt = false
  keepBackup = false
[mergetool "vscode"]
  cmd = code --wait --merge $BASE $LOCAL $REMOTE $MERGED
[mergetool "meld"]
  trustExitCode = true
  cmd = open -W -a Meld --args --auto-merge \"$PWD/$LOCAL\" \"$PWD/$BASE\" \"$PWD/$REMOTE\" --output=\"$PWD/$MERGED\"
[mergetool "sublimerge"]
  cmd = subl-merge \"$REMOTE\" \"$BASE\" \"$LOCAL\" \"$MERGED\"
[mergetool "diffmerge"]
  cmd = /usr/local/bin/diffmerge --merge --result=\"$MERGED\" \"$LOCAL\" \"$BASE\" \"$REMOTE\"
  trustExitCode = true
[mergetool "tortoisemerge"]
  cmd = \""c:/Program Files/TortoiseSVN/bin/TortoiseMerge.exe"\" -base:"$BASE" -theirs:"$REMOTE" -mine:"$LOCAL" -merged:"$MERGED"
[rebase]
  autosquash = true
[oh-my-zsh]
  hide-status = 0
  hide-dirty  = 1
[push]
  autoSetupRemote = true
  default = upstream
  # default = simple # n00b mode
[alias]
  # DEFAULTS
  b               = branch
  d               = diff
  s               = status -u
  diff            = diff --full-index
  history         = log --oneline --decorate --graph
  lc              = log ORIG_HEAD.. --stat --no-merges
  pullr           = pull --rebase
  mom             = ! git fetch && git merge origin/main
  rom             = ! git fetch && git rebase origin/main
  mam             = ! git fetch && git merge origin/master
  ram             = ! git fetch && git rebase origin/master

  # making fixes and patches
  fixup = "!git log -n 50 --pretty=format:'%h %s' --no-merges | fzf | cut -c -7 | xargs -o git commit --fixup"
  autosquash = "!git rebase -i --autosquash $(git merge-base origin/main HEAD)"

  pop = "!git stash list | fzf | cut -d':' -f1 | xargs -o git stash pop"

  # BRANCH TRAVERSING
  go              = checkout
  go-tag          = "! git fetch --tags && git checkout $(git describe --tags `git rev-list --tags --max-count=1`)"
  # DIFFS
  changes         = diff --name-status -r
  rb-css          = "! git diff -M --full-index origin/master...HEAD -- *.scss *.css"
  rb-js           = "! git diff -M --full-index origin/master...HEAD -- *.js"
  conflicts       = diff --name-only --diff-filter=U
  diffout         = diff --full-index origin/master
  diffstat        = diff --stat -r
  diff-lessnode   = "! git diff --diff-filter=MAd origin/master...HEAD --name-only | grep -v '^node_modules/' | xargs git diff $MERGE_BASE --full-index"
  u-stat          = "! git diff -M --full-index origin/main...HEAD --stat"
  u-stat-open     = "! git diff -M --diff-filter=MAd --full-index origin/main...HEAD --name-status | grep -o \"[a-z\\.\\/_A-Z0-9]\\{2,\\}\" | xargs code -a"
  # BRANCHES
  bd              = "for-each-ref --sort=committerdate refs/heads/ --format='%1B[0;31m%(committerdate:relative)%1B[m%09%(refname:short) [%1B[1;34m%(upstream:short)%1B[m]'"
  todo            = branch --no-merged
  unmerged        = rev-list --not master --no-merges --pretty
  # LOG/LIST
  branchcommits   = log master...
  last            = log -1 HEAD --stat -p
  log-line        = log --topo-order -u -L
  log-mine        = log --author="%GIT_NAME" --topo-order --reverse -u -L
  log-u           = "! MERGE_BASE=$(git merge-base origin/main HEAD); git log $MERGE_BASE..HEAD"
  staging-info    = "log --pretty=short --no-walk" # echo's info necessary for staging deployments (branch, commit#)
  # REMOTES
  rmorigin        = push --delete origin
  # DEPLOY TRAINS
  trains          = "! git fetch -q && git for-each-ref --count=5 --sort=-committerdate --format='%1B[0;31m%(committerdate:relative)%1B[m%09 %(refname:short)' refs/remotes/origin/deploy_*"
  train           = ! git fetch -q && git for-each-ref --count=1 --sort=-committerdate --format='%(refname:short)' refs/remotes/origin/deploy_*
  train-board     = ! git train | xargs git checkout -t
  trains-clean    = ! git branch --list | grep deploy_ | xargs git branch -d
  trains-clean-f  = ! git branch --list | grep deploy_ | xargs git branch -D
  squash-last     = ! git merge --squash $(git describe --all $(git rev-parse @{-1}))
  # EXCLUSIVE DIFF
  diff-exclude    =  ! git diff --name-only origin/master | grep -v -E "$1" | xargs git diff origin/master --full-index
  # IDENTITY
  whoami          = ! git config --get user.name && git config --get user.email

  # Workflow
  mark-done       = "! f() { git branch -m \"$1\" \"=$1\"; }; f"
  mark-ready      = "! f() { git branch -m \"$1\" \"+$1\"; }; f"
  permission-reset = "!git diff -p -R --no-color | grep -E \"^(diff|(old|new) mode)\" --color=never | git apply"
  ## Project Tracker
  # `git set-pt 123456` => appends _pt_123456 to the current branch name
  # `git open-pt` => opens PT to the current branch's known pt#, assuming convention "branch_name_pt_123456"
  set-pt          = "! this=$(git rev-parse --abbrev-ref HEAD); pre="_pt_"; that=$1; shift; soon=$this$pre$that; git branch -m $this $soon"
  open-pt         = "! pt=$(git rev-parse --abbrev-ref HEAD | rev | cut -d'_' -f 1 | rev); open \"https://admin.wayfair.com/tracker/views/142.php?PrtID=$pt\""
```

```ini $HOME/.gitconfig-csnzoo action=build title="Wayfair Gitconfig" disabled=legacy
[user]
  name = Spencer Gregson
  email = sgregson@wayfair.com
  signingkey = 376AA48582F8ADAFA44B47A1FB5A1923EFF83E21
```

### Global gitignore

```sh $HOME/.gitignore action=symlink title="global gitignore"
*.sublime-workspace
*.sublime-projects
.tags*

desktop.ini
.DS_Store
```


### Git Stats

You can use https://github.com/IonicaBizau/git-stats to keep track of your git stats locally...

```sh
npm i -g git-stats
```

```js $HOME/git-stats-config.js disabled=true
module.exports = {
  theme: {
    background: "#111111",
    foreground: "#565656",
    levels: ["#343434", "#2e643d", "#589f43", "#98bc21", "#b9fc04"],
  },
  first_day: "Mon",
  since: undefined,
  until: undefined,
  authors: false,
  global_activity: false,
};
```
### GPG

> https://docs.github.com/en/authentication/managing-commit-signature-verification/checking-for-existing-gpg-keys

Basically download the binary from https://www.gnupg.org/download/ and then import your private key onto your new machine `gpg --import private.key`.

Then tell git about it with:

```sh
git config --global --unset gpg.format
gpg --list-secret-keys --keyid-format=long
git config --global user.signingkey #############
```
From [pinentry-touchid](https://github.com/jorgelbg/pinentry-touchid) I don't want to save my GPG key in keychain:

```sh action=run title="Disable Save GPG To Keychain"
defaults write org.gpgtools.common DisableKeychain -bool yes;
```

Remember to kill gpg-agent if you change the pinentry program (with `gpgconf --kill gpg-agent`).

```ini $HOME/.gnupg/gpg-agent.conf action=symlink title="Use pinentry-mac for GPG"
pinentry-program /opt/homebrew/bin/pinentry-mac
```

## SSH

```ini $HOME/.ssh/config action=symlink title=ssh-config
Host dev-gcp
  HostName webphp-php8sgregson-dsm1.us-central1-a.c.wf-gcp-us-sds-prod.internal
  CanonicalizeHostname yes

Host *.wf-gcp-us-sds-prod.internal
  User sgregson_gcp_wayfair_com
  StrictHostKeyChecking no
  UserKnownHostsFile /dev/null
  # IdentityFile ~/.ssh/id_rsa
  # IdentitiesOnly yes
  # ForwardAgent yes
  # ServerAliveInterval 240

Host *
    IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"
```


## App Configs

```md action=section
# App Configurations
```

### Git stats

### Hyper

```js $HOME/hyper.js title="Hyper terminal settings" action=symlink disabled="use warp terminal"
module.exports = {
  config: {
    // default font size in pixels for all tabs
    fontSize: 14,

    // font family with optional fallbacks
    fontFamily:
      '"Fira Code", Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace',

    // terminal cursor background color and opacity (hex, rgb, hsl, hsv, hwb or cmyk)
    cursorColor: "rgba(248,28,229,0.8)",

    // `BEAM` for |, `UNDERLINE` for _, `BLOCK` for █
    cursorShape: "BLOCK",

    // color of the text
    foregroundColor: "#fff",

    // terminal background color
    backgroundColor: "#000",

    // border color (window, tabs)
    borderColor: "#333",

    // custom css to embed in the main window
    css: "",

    // custom css to embed in the terminal window
    termCSS: `
        x-screen x-row {
            font-variant-ligatures: initial;
        }
    `,

    // set to `true` if you're using a Linux set up
    // that doesn't shows native menus
    // default: `false` on Linux, `true` on Windows (ignored on macOS)
    showHamburgerMenu: "",

    // set to `false` if you want to hide the minimize, maximize and close buttons
    // additionally, set to `'left'` if you want them on the left, like in Ubuntu
    // default: `true` on windows and Linux (ignored on macOS)
    showWindowControls: "",

    // custom padding (css format, i.e.: `top right bottom left`)
    padding: "12px 14px",

    // the full list. if you're going to provide the full color palette,
    // including the 6 x 6 color cubes and the grayscale map, just provide
    // an array here instead of a color map object
    colors: {
      black: "#000000",
      red: "#ff0000",
      green: "#33ff00",
      yellow: "#ffff00",
      blue: "#0066ff",
      magenta: "#cc00ff",
      cyan: "#00ffff",
      white: "#d0d0d0",
      lightBlack: "#808080",
      lightRed: "#ff0000",
      lightGreen: "#33ff00",
      lightYellow: "#ffff00",
      lightBlue: "#0066ff",
      lightMagenta: "#cc00ff",
      lightCyan: "#00ffff",
      lightWhite: "#ffffff",
    },

    // the shell to run when spawning a new session (i.e. /usr/local/bin/fish)
    // if left empty, your system's login shell will be used by default
    shell: "",

    // for setting shell arguments (i.e. for using interactive shellArgs: ['-i'])
    // by default ['--login'] will be used
    shellArgs: ["--login"],

    // for environment variables
    env: {},

    // set to false for no bell
    bell: "SOUND",

    // if true, selected text will automatically be copied to the clipboard
    copyOnSelect: true,

    // URL to custom bell
    // bellSoundURL: 'http://example.com/bell.mp3',

    // for advanced config flags please refer to https://hyper.is/#cfg
  },

  // a list of plugins to fetch and install from npm
  // format: [@org/]project[#version]
  // examples:
  //   `hyperpower`
  //   `@company/project`
  //   `project#1.0.1`
  plugins: [
    // 'hyperborder',
    "hyper-statusline",
    "hyperterm-1password",
    "hyperterm-alternatescroll",
    // Themes
    "hyper-solarized-dark",
    "hyper-tabs-enhanced",
  ],

  theme: "hyper-solarized-dark",

  // in development, you can create a directory under
  // `~/.hyper_plugins/local/` and include it here
  // to load it and avoid it being `npm install`ed
  localPlugins: [],
};
```


### Jrnl

```yaml $HOME/.config/jrnl/jrnl.yaml title="JRNL command line settings" action=build disabled=legacy
- default_hour: 9
- linewrap: 79
- encrypt: false
- default_minute: 0
- tagsymbols: "@"
- editor: "open -a macdown -Wn"
- timeformat: "%Y-%m-%d %H:%M"
- highlight: true
- journals:
    - default: "~/Dropbox/logging.txt"
```

### QuickLook Markdown Plugin Settings

Preview markdown files in MacOS quicklook (finder spacebar) https://github.com/sbarex/QLMarkdown


> TODO: need to implement dark color scheme `prefers-color-scheme: dark`

```css $HOME/qlmarkdown-style.css action=symlink title="Markdown QuickLook styles"
html,body{color:black}
*{margin:0;padding:0}
body{font:13.34px helvetica,arial,freesans,clean,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.4;padding:30px;background:#fff;border-radius:3px;-moz-border-radius:3px;-webkit-border-radius:3px;max-width:900px;margin:15px auto;border:3px solid #eee!important}
p{margin:1em 0}
a{color:#4183c4;text-decoration:none}
#wrapper{background-color:#fff;border:3px solid #eee!important;padding:0 30px;margin:15px}
#wrapper{padding:20px;font-size:14px;line-height:1.6}
#wrapper>*:first-child{margin-top:0!important}
#wrapper>*:last-child{margin-bottom:0!important}
h1,h2,h3,h4,h5,h6{margin:0;padding:0}
h1{margin:15px 0;padding-bottom:2px;font-size:24px;border-bottom:1px solid #eee}
h2{margin:20px 0 10px 0;font-size:18px}
h3{margin:20px 0 10px 0;padding-bottom:2px;font-size:14px;border-bottom:1px solid #ddd}
h4{font-size:14px;line-height:26px;padding:18px 0 4px;font-weight:bold;text-transform:uppercase}
h5{font-size:13px;line-height:26px;padding:14px 0 0;font-weight:bold;text-transform:uppercase}
h6{color:#666;font-size:14px;line-height:26px;padding:18px 0 0;font-weight:normal;font-variant:italic}
hr{background:transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAECAYAAACtBE5DAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OENDRjNBN0E2NTZBMTFFMEI3QjRBODM4NzJDMjlGNDgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OENDRjNBN0I2NTZBMTFFMEI3QjRBODM4NzJDMjlGNDgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4Q0NGM0E3ODY1NkExMUUwQjdCNEE4Mzg3MkMyOUY0OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4Q0NGM0E3OTY1NkExMUUwQjdCNEE4Mzg3MkMyOUY0OCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqqezsUAAAAfSURBVHjaYmRABcYwBiM2QSA4y4hNEKYDQxAEAAIMAHNGAzhkPOlYAAAAAElFTkSuQmCC) repeat-x 0 0;border:0 none;color:#ccc;height:4px;margin:20px 0;padding:0}
#wrapper>h2:first-child,#wrapper>h1:first-child,#wrapper>h1:first-child+h2{border:0;margin:0;padding:0}
#wrapper>h3:first-child,#wrapper>h4:first-child,#wrapper>h5:first-child,#wrapper>h6:first-child{margin:0;padding:0}
h4+p,h5+p,h6+p{margin-top:0}
li p.first{display:inline-block}
ul,ol{margin:15px 0 15px 25px}
ul li,ol li{margin-top:7px;margin-bottom:7px}
ul li>*:last-child,ol li>*:last-child{margin-bottom:0}
ul li>*:first-child,ol li>*:first-child{margin-top:0}
#wrapper>ul,#wrapper>ol{margin-top:21px;margin-left:36px}
dl{margin:0;padding:20px 0 0}
dl dt{font-size:14px;font-weight:bold;line-height:normal;margin:0;padding:20px 0 0}
dl dt:first-child{padding:0}
dl dd{font-size:13px;margin:0;padding:3px 0 0}
blockquote{margin:14px 0;border-left:4px solid #ddd;padding-left:11px;color:#555}
table{border-collapse:collapse;margin:20px 0 0;padding:0}
table tr{border-top:1px solid #ccc;background-color:#fff;margin:0;padding:0}
table tr:nth-child(2n){background-color:#f8f8f8}
table tr th,table tr td{border:1px solid #ccc;text-align:left;margin:0;padding:6px 13px}
img{max-width:100%;height:auto}
code,tt{margin:0 2px;padding:2px 5px;white-space:nowrap;border:1px solid #ccc;background-color:#f8f8f8;border-radius:3px;-moz-border-radius:3px;-webkit-border-radius:3px;font-size:12px}
pre code{margin:0;padding:0;white-space:pre;border:0;background:transparent;font-size:13px}
.highlight pre,pre{background-color:#f8f8f8;border:1px solid #ccc;font-size:13px;line-height:19px;overflow:auto;padding:6px 10px;border-radius:3px;-moz-border-radius:3px;-webkit-border-radius:3px}
#wrapper>pre,#wrapper>div.highlight{margin:10px 0 0}
pre code,pre tt{background-color:transparent;border:0}
#wrapper{background-color:#fff;border:1px solid #cacaca;padding:30px}
.poetry pre{font-family:Georgia,Garamond,serif!important;font-style:italic;font-size:110%!important;line-height:1.6em;display:block;margin-left:1em}
.poetry pre code{font-family:Georgia,Garamond,serif!important}
sup,sub,a.footnote{font-size:1.4ex;height:0;line-height:1;vertical-align:super;position:relative}
sub{vertical-align:sub;top:-1px}
@media print{body{background:#fff}
img,pre,blockquote,table,figure{page-break-inside:avoid}
#wrapper{background:#fff;border:0}
code{background-color:#fff;color:#444!important;padding:0 .2em;border:1px solid #dedede}
pre code{background-color:#fff!important;overflow:visible}
pre{background:#fff}
}
@media screen{body.inverted,.inverted #wrapper,.inverted hr .inverted p,.inverted td,.inverted li,.inverted h1,.inverted h2,.inverted h3,.inverted h4,.inverted h5,.inverted h6,.inverted th,.inverted .math,.inverted caption,.inverted dd,.inverted dt,.inverted blockquote{color:#eee!important;border-color:#555}
.inverted td,.inverted th{background:#333}
.inverted pre,.inverted code,.inverted tt{background:#444!important}
.inverted h2{border-color:#555}
.inverted hr{border-color:#777;border-width:1px!important}
::selection{background:rgba(157,193,200,.5)}
h1::selection{background-color:rgba(45,156,208,.3)}
h2::selection{background-color:rgba(90,182,224,.3)}
h3::selection,h4::selection,h5::selection,h6::selection,li::selection,ol::selection{background-color:rgba(133,201,232,.3)}
code::selection{background-color:rgba(0,0,0,.7);color:#eee}
code span::selection{background-color:rgba(0,0,0,.7)!important;color:#eee!important}
a::selection{background-color:rgba(255,230,102,.2)}
.inverted a::selection{background-color:rgba(255,230,102,.6)}
td::selection,th::selection,caption::selection{background-color:rgba(180,237,95,.5)}
.inverted{background:#0b2531}
.inverted #wrapper,.inverted{background:rgba(37,42,42,1)}
.inverted a{color:rgba(172,209,213,1)}
}
.highlight .c{color:#998;font-style:italic}
.highlight .err{color:#a61717;background-color:#e3d2d2}
.highlight .k{font-weight:bold}
.highlight .o{font-weight:bold}
.highlight .cm{color:#998;font-style:italic}
.highlight .cp{color:#999;font-weight:bold}
.highlight .c1{color:#998;font-style:italic}
.highlight .cs{color:#999;font-weight:bold;font-style:italic}
.highlight .gd{color:#000;background-color:#fdd}
.highlight .gd .x{color:#000;background-color:#faa}
.highlight .ge{font-style:italic}
.highlight .gr{color:#a00}
.highlight .gh{color:#999}
.highlight .gi{color:#000;background-color:#dfd}
.highlight .gi .x{color:#000;background-color:#afa}
.highlight .go{color:#888}
.highlight .gp{color:#555}
.highlight .gs{font-weight:bold}
.highlight .gu{color:#800080;font-weight:bold}
.highlight .gt{color:#a00}
.highlight .kc{font-weight:bold}
.highlight .kd{font-weight:bold}
.highlight .kn{font-weight:bold}
.highlight .kp{font-weight:bold}
.highlight .kr{font-weight:bold}
.highlight .kt{color:#458;font-weight:bold}
.highlight .m{color:#099}
.highlight .s{color:#d14}
.highlight .na{color:#008080}
.highlight .nb{color:#0086b3}
.highlight .nc{color:#458;font-weight:bold}
.highlight .no{color:#008080}
.highlight .ni{color:#800080}
.highlight .ne{color:#900;font-weight:bold}
.highlight .nf{color:#900;font-weight:bold}
.highlight .nn{color:#555}
.highlight .nt{color:#000080}
.highlight .nv{color:#008080}
.highlight .ow{font-weight:bold}
.highlight .w{color:#bbb}
.highlight .mf{color:#099}
.highlight .mh{color:#099}
.highlight .mi{color:#099}
.highlight .mo{color:#099}
.highlight .sb{color:#d14}
.highlight .sc{color:#d14}
.highlight .sd{color:#d14}
.highlight .s2{color:#d14}
.highlight .se{color:#d14}
.highlight .sh{color:#d14}
.highlight .si{color:#d14}
.highlight .sx{color:#d14}
.highlight .sr{color:#009926}
.highlight .s1{color:#d14}
.highlight .ss{color:#990073}
.highlight .bp{color:#999}
.highlight .vc{color:#008080}
.highlight .vg{color:#008080}
.highlight .vi{color:#008080}
.highlight .il{color:#099}
.highlight .gc{color:#999;background-color:#eaf2f5}
.type-csharp .highlight .k{color:#00F}
.type-csharp .highlight .kt{color:#00F}
.type-csharp .highlight .nf{color:#000;font-weight:normal}
.type-csharp .highlight .nc{color:#2b91af}
.type-csharp .highlight .nn{color:#000}
.type-csharp .highlight .s{color:#a31515}
.type-csharp .highlight .sc{color:#a31515}
```

### Vim

Vim editor settings

```vim $HOME/.vimrc action=symlink
:syntax enable
```

## dev config

### Prettier

### Eslint

### SCSS

```yaml $HOME/.stylelintrc action=symlink title="Stylelint global config"
# SCSS Linting rules, uses stylelint
#
# Rules are sorted alphabetcally,
#   comment out any unused rules so we don't have to go hunting later

defaultSeverity: warning
# plugins:
# - stylelint-scss
rules:
  selector-nested-pattern:
    - "^[^\\.][^A-Z].*$" # TODO ??
    - severity: error
```

## Misc

### reloadTabs()

> Call this function to reload any browser tab (chrome) on a matching domain. Useful when paired with utilities like `nodemon` when you don't have hot module reloading

```sh $HOME/.custom/reloadTabs action=symlink title="reloadTabs() command line function" when=os.darwin disabled=legacy
# Reload Chrome tabs in background for matching $1 string
# https://gist.github.com/badsyntax/1f4a58715194d780b2f6
# Usage: reloadTabs "wayfair.com" will do browsersync for all wayfair tabs (based on turbine events)
reloadTabs() {
  osascript -e "
    tell application \"Google Chrome\"
    set theUrl to \"$1\"
    set found to false
    set windowList to every window
    repeat with aWindow in windowList
      set tabList to every tab of aWindow
      set tabIndex to 0
      repeat with atab in tabList
        set tabIndex to tabIndex + 1
        if (URL of atab contains theUrl) then
          set found to true
          tell atab to reload
          set aWindow's active tab index to tabIndex
        end if
      end repeat
    end repeat
    if not found then
      display dialog \"Could not any tabs matching $1\"
    end if
  end tell"
}
```

## MacOS System Config
```md action=section
# MacOS System
```

```sh title="MacOS Key Repeat" action=run when=os.darwin
# Disable press-and-hold for keys in favor of key repeat.
defaults write -g ApplePressAndHoldEnabled -bool false;

# Set a really fast key repeat.
defaults write NSGlobalDomain KeyRepeat -int 1;
```

### Keyboard setup

```sh title="Finder Settings" action=run when=os.darwin
# Use AirDrop over every interface. srsly this should be a default.
defaults write com.apple.NetworkBrowser BrowseAllInterfaces 1;

# Always open everything in Finder's list view. This is important.
defaults write com.apple.Finder FXPreferredViewStyle Nlsv;

# Show the ~/Library folder.
chflags nohidden ~/Library;

# Set the Finder prefs for showing a few different volumes on the Desktop.
defaults write com.apple.finder ShowExternalHardDrivesOnDesktop -bool true;
defaults write com.apple.finder ShowRemovableMediaOnDesktop -bool true;
```

```sh title="Hot Corners" action=run when=os.darwin
# Run the screensaver if we're in the bottom-left hot corner.
defaults write com.apple.dock wvous-bl-corner -int 5;
defaults write com.apple.dock wvous-bl-modifier -int 0;
```

### Safari browser defaults

```sh title="Hide Safari bookmarks bar" action=run when=os.darwin
# Hide Safari's bookmark bar.
defaults write com.apple.Safari ShowFavoritesBar -bool false;
```

```sh title="Safari Developer settings" action=run when=os.darwin
# Set up Safari for development.
defaults write com.apple.Safari IncludeInternalDebugMenu -bool true;
defaults write com.apple.Safari IncludeDevelopMenu -bool true;
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true;
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2DeveloperExtrasEnabled" -bool true;
defaults write NSGlobalDomain WebKitDeveloperExtras -bool true;
```

### Phoenix JS Window Managment

```js $HOME/.phoenix.js action=symlink title="Phoenix.js window config" when=os.darwin
/// <reference path="../../../../types/phoenix.d.ts" />
"use strict";
/*globals Phoenix Window App Key Screen Space*/
Phoenix.notify("initializing");

Phoenix.set({
  daemon: false,
  openAtLogin: true,
});

// Key combo aliases
var HYPER = ["cmd", "alt", "ctrl"];
const SUPER_HYPER = ["shift", "cmd", "alt", "ctrl"];

// utils for double-clicking
const DOUBLE_PRESS_MS = 250;
const lastPressTime = new Map();

// Application aliases
var BROWSER = "Brave Browser";
var EDITOR = "Code";
var TERMINAL = "iTerm2";
var CHAT = "Slack";
var NOTES = "Notion";
var PLAYER = "Spotify";
var CALENDAR = "Cron";

// APPLICATION TRIGGERS
Key.on("j", HYPER, () => logged(openFocusHide)(BROWSER));
Key.on("k", HYPER, () => logged(openFocusHide)(CHAT));
Key.on("l", HYPER, () => logged(openFocusHide)(TERMINAL));
Key.on("n", HYPER, () => logged(openFocusHide)(NOTES));
Key.on("p", HYPER, () => logged(openFocusHide)(PLAYER));
Key.on("o", HYPER, () => {
  const overlap = 100;

  Screen.all().forEach((s) => {
    s.windows().forEach((w, i) => {
      const { x, y, width, height } = s.flippedVisibleFrame();
      const step = {
        x: width / 2 / (s.windows().length - 1),
        y: height / 2 / (s.windows().length - 1),
      };
      w.setFrame({
        x: x + step.x * i,
        y: y + step.y * i,
        width: width / 2,
        height: height / 2,
      });
    });
  });
});
// double-mash space to trigger default layout (single-mash to call up VS Code)
dblKeyPress("space", HYPER, (repeated) =>
  repeated ? logged(triggerLayout)() : logged(openFocusHide)(EDITOR)
);

// Window Arrangement Keymaps
// - l/full/r and up/full/down PC-style monitor wrapping
// prettier-ignore
{
  Key.on("up", HYPER, () => logged(stateToggle)(["bottom", "full-y", "top"]));
  Key.on("down", HYPER, () => logged(stateToggle)(["top", "full-y", "bottom"]));
  Key.on("left", HYPER, () => logged(stateToggle)([ "right-3", "right-2", "right-2/3", "full-x", "left-2/3", "left-2", "left-3",   ]));
  Key.on("right", HYPER, () => logged(stateToggle)([ "left-3", "left-2", "left-2/3", "full-x", "right-2/3", "right-2", "right-3",   ]));
}

// fullscreen
Key.on("0", HYPER, () => logged(stateToggle)(["full"]));
Key.on("keypad0", HYPER, () => logged(stateToggle)(["full"]));

// default split 2:1
Key.on(",", HYPER, () => logged(stateToggle)(["left-2/3"]));
Key.on(".", HYPER, () => logged(stateToggle)(["right-3"]));

// move to next screen
Key.on("[", HYPER, () => logged(moveToPrevScreen)());
Key.on("]", HYPER, () => logged(moveToNextScreen)());

// Window layout
const onScreenChange = new Event("screensDidChange", () =>
  // needs to wait for MacOS to mess everything up first
  Timer.after(3, () => logged(triggerLayout)())
);

Key.on("keypad*", HYPER, () => {
  // https://itectec.com/askdifferent/macos-create-a-new-space-using-a-keyboard-shortcut/
  Task.run("/usr/bin/osascript", ["-e", "set volume output volume 25"], () => {
    Modal.build({
      origin: (frame) => {
        const screen = Screen.main().flippedVisibleFrame();
        return {
          x: screen.x + screen.width / 2 - frame.width / 2,
          y: screen.y + screen.height / 2 - frame.height / 2,
        };
      },
      duration: 1,
      weight: 48,
      appearance: "light",
      text: "🔉",
    }).show();
  });
});

// Debugging: get info
Key.on("i", HYPER, () => logged(getInfo)());
Key.on("c", HYPER, () => logged(collectWindows)());

/**
 * locate-able regions of a screen, expressed as fragments of a window Frame
 *
 * @param  {Screen} _screen The screen of interest
 * @return {Rectangle}         [description]
 */
function getRegions(_screen) {
  if (!_screen) _screen = Window.focused().screen();

  return {
    full: {
      x: _screen.flippedVisibleFrame().x,
      width: _screen.flippedVisibleFrame().width,
      y: _screen.flippedVisibleFrame().y,
      height: _screen.flippedVisibleFrame().height,
    },
    bottom: {
      y:
        Math.floor(_screen.flippedVisibleFrame().height / 2) +
        _screen.flippedVisibleFrame().y,
      height: Math.floor(_screen.flippedVisibleFrame().height / 2),
    },
    "full-y": {
      y: _screen.flippedVisibleFrame().y,
      height: _screen.flippedVisibleFrame().height,
    },
    top: {
      y: _screen.flippedVisibleFrame().y,
      height: Math.floor(_screen.flippedVisibleFrame().height / 2),
    },
    //===//
    "left-3": {
      x: _screen.flippedVisibleFrame().x,
      width: Math.floor(_screen.flippedVisibleFrame().width / 3),
    },
    "left-2": {
      x: _screen.flippedVisibleFrame().x,
      width: Math.floor(_screen.flippedVisibleFrame().width / 2),
    },
    "left-2/3": {
      x: _screen.flippedVisibleFrame().x,
      width: Math.floor((_screen.flippedVisibleFrame().width / 3) * 2),
    },
    "full-x": {
      x: _screen.flippedVisibleFrame().x,
      width: _screen.flippedVisibleFrame().width,
    },
    "right-2/3": {
      x:
        Math.floor(_screen.flippedVisibleFrame().width / 3) +
        _screen.flippedVisibleFrame().x,
      width: Math.floor((_screen.flippedVisibleFrame().width / 3) * 2),
    },
    "right-2": {
      x:
        Math.floor(_screen.flippedVisibleFrame().width / 2) +
        _screen.flippedVisibleFrame().x,
      width: Math.floor(_screen.flippedVisibleFrame().width / 2),
    },
    "right-3": {
      x:
        Math.floor((_screen.flippedVisibleFrame().width / 3) * 2) +
        _screen.flippedVisibleFrame().x,
      width: Math.floor(_screen.flippedVisibleFrame().width / 3),
    },
  };
}

/**
 * Unified function to open/focus/hide an application
 * @param  {String} _appTarget name for app of interest
 * @return {none}
 */
function openFocusHide(_appTarget) {
  var appTarget = App.get(_appTarget);

  if (!appTarget) {
    App.launch(_appTarget, { focus: true });
    return;
  }

  if (appTarget.isActive()) {
    appTarget.hide();
  } else {
    appTarget.focus();
  }
}

/**
 * Factory for making double-click handlers.
 * The lastClickTime Map is used to cache previous timer events, cached to the key+modifier combo
 *
 * @param {string} key the key trigger for the event
 * @param {Array} meta modifier keys for the key event
 * @param {Function} fn callback function which should be called (called with a boolean for whether it was a single or doubleclick)
 * @param {Array} timers a queue of single-click timers
 */
function dblKeyPress(key, meta, fn, timers = []) {
  const clickId = `${key}${JSON.stringify(meta)}`;
  if (!lastPressTime.has(clickId)) lastPressTime.set(clickId, 0);

  Key.once(key, meta, () => {
    // cancel any "single-click" timers
    timers.forEach((t) => t.stop());
    timers = [];

    // figure if we're doubleclicked
    const n = Date.now();
    const isDouble = n - lastPressTime.get(clickId) <= DOUBLE_PRESS_MS;

    if (isDouble) {
      // run double-click callback
      fn(true);
    } else {
      // queue a single-click callback (will be cancelled if pressed again)
      timers.push(
        new Timer(DOUBLE_PRESS_MS / 1000, false, () => {
          fn(false);
        })
      );
    }

    lastPressTime.set(clickId, isDouble ? n - DOUBLE_PRESS_MS : n);
    dblKeyPress(key, meta, fn, timers);
  });
}

/**
 * Window state toggle - as in PC super-left/right
 * @param  {Array}  _tests      list of [x,width] tuples to iterate through for matching & assigning
 * @return {null}
 */
function stateToggle(_tests, options = {}) {
  let { window: _win, screen: _screen } = options;

  if (!_win) {
    _win = Window.focused();
    Phoenix.log("falling back to focused window");
  }
  if (!_screen) _screen = _win.screen();

  Phoenix.log(
    "using frame: ",
    JSON.stringify(Window.focused().screen().frame())
  );

  // TODO: "if there's another screen, push a state from the next screen into it"
  _tests.push(_tests[0]); // permit wrapping states [l,f,r,l]

  // const _win = Window.focused();
  const regions = getRegions(_screen);

  // current state initialized to "unmatched"
  let currentState = -1;

  // Match one axis or the other
  for (var i = 0; i <= _tests.length - 1; i++) {
    // prettier-ignore
    var boxCheck = (_win.frame().x == regions[_tests[i]].x && _win.frame().width  == regions[_tests[i]].width)
                 ||(_win.frame().y == regions[_tests[i]].y && _win.frame().height == regions[_tests[i]].height);

    // current box matches, break
    if (boxCheck) {
      currentState = i;
      Phoenix.log(
        `found state ${_tests[currentState]}(${currentState}), next: ${
          _tests[currentState + 1]
        }(${currentState + 1})`
      );
      break;
    }
  }

  if (currentState === -1) Phoenix.log("unmatched window state");

  // Assign next state in 'regions' queue (unmatched is effectively "0" == -1 + 1)
  const nextRegion = _tests[currentState + 1];
  const nextFrame = Object.assign({}, _win.frame(), regions[nextRegion]);

  Phoenix.log(nextRegion, JSON.stringify(regions[nextRegion]));
  _win.setFrame(nextFrame);
}

/**
 * default layout uses screens or spaces to segment primary/secondary workspace
 */
const LAYOUT_SPACING_UNIT = 35;
function triggerLayout() {
  let layout;
  // use regions[i] to access specific screens
  const regions = Screen.all().map((s) => getRegions(s));

  if (Screen.all().length === 3) {
    layout = layout3screens(regions);
  } else if (Screen.all().length === 2) {
    layout = layout2screens(regions);
  } else if (Space.all().lenth > 1) {
    layout = layoutSpaces(regions);
  } else {
    // Guard against errors
    Phoenix.notify(
      "COULD NOT SET LAYOUT:\nlayout must have either muliple screens or multiple spaces"
    );
    return;
  }

  // cache the current window since we manipulate focus in the loop
  const _winStart = Window.focused();

  for (const [appName, locateWindow] of Object.entries(layout)) {
    try {
      // only way we can find items in other spaces, if necessary
      App.get(appName).mainWindow().focus();
    } catch (err) {
      Phoenix.log(`${appName} did not have a main window to focus`);
    }
    if (!App.get(appName)) continue;

    App.get(appName)
      .windows()
      .filter((w) => w.isVisible())
      .forEach(locateWindow);
  }

  _winStart.focus();
  Phoenix.notify("Layout assigned.");
}

/**
 * Layout Definition for 3-screen arrangement
 *
 * @param {Array} regions
 * @returns Object
 */
function layout3screens() {
  Phoenix.notify("3 Screen Layout");

  // use regions[i] to access specific screens. regions are sorted left-to-right
  let regions = Screen.all().sort((a, b) => a.frame().x - b.frame().x);
  Phoenix.log(JSON.stringify(regions));

  regions = regions.map((s) => getRegions(s));
  Phoenix.log(JSON.stringify(regions));

  return {
    [BROWSER]: (window, i, all) =>
      window.setFrame({
        ...regions[0]["full-y"],
        ...regions[0]["right-3"],
        x: regions[0]["right-3"].x - i * LAYOUT_SPACING_UNIT,
        y: regions[0]["full-y"].y + (all.length - i - 1) * LAYOUT_SPACING_UNIT,
        height:
          regions[0]["full-y"].height -
          (all.length - i - 1) * LAYOUT_SPACING_UNIT,
      }),
    [EDITOR]: (window) =>
      window.setFrame({
        ...regions[2]["full-y"],
        ...regions[2]["full-x"],
      }),
    [CHAT]: (window, i) => {
      moveToSpace(0, { window });
      window.setFrame({
        ...regions[0]["left-2/3"],
        ...regions[0]["full-y"],
        width:
          regions[0]["left-2/3"].width -
          (App.get(BROWSER)
            .windows()
            .filter((w) => w.isVisible()).length +
            App.get(CHAT)
              .windows()
              .filter((w) => w.isVisible()).length -
            // two windows should be an even 2:1 split
            2) *
            LAYOUT_SPACING_UNIT,
        x: regions[0]["left-2/3"].x + i * LAYOUT_SPACING_UNIT,
      });
    },
    [CALENDAR]: (window, i) => {
      window.setFrame({ ...regions[1]["full-x"], ...regions[1]["bottom"] });
    },
    [NOTES]: (window, i) => {
      moveToSpace(0, { window });
      window.setFrame({ ...regions[1]["full-x"], ...regions[1]["top"] });
    },
  };
}
function layout2screens(regions) {
  Phoenix.notify("2 Screen Layout");
  return {
    [BROWSER]: (window, i, all) =>
      window.setFrame({
        ...regions[1]["full-y"],
        ...regions[1]["right-3"],
        x: regions[1]["right-3"].x - i * LAYOUT_SPACING_UNIT,
        y: regions[1]["full-y"].y + (all.length - i - 1) * LAYOUT_SPACING_UNIT,
        height:
          regions[1]["full-y"].height -
          (all.length - i - 1) * LAYOUT_SPACING_UNIT,
      }),
    [EDITOR]: (window, i) =>
      window.setFrame({
        ...regions[1]["full-y"],
        ...regions[1]["left-2/3"],
        width:
          regions[1]["left-2/3"].width -
          (App.get(BROWSER)
            .windows()
            .filter((w) => w.isVisible()).length +
            App.get(EDITOR)
              .windows()
              .filter((w) => w.isVisible()).length -
            // two windows should be an even 2:1 split
            2) *
            LAYOUT_SPACING_UNIT,
        x: regions[1]["left-2/3"].x + i * LAYOUT_SPACING_UNIT,
      }),
    [CHAT]: (window, i) => {
      moveToSpace(0, { window });
      window.setFrame(regions[0]["left-2/3"]);
    },
    [NOTES]: (window, i) => {
      moveToSpace(0, { window });
      window.setFrame(regions[0]["right-2/3"]);
    },
  };
}
function layoutSpaces(regions) {
  return {
    [BROWSER]: (window, i, all) => moveToSpace(0, { window }),
    [EDITOR]: (window, i) => moveToSpace(0, { window }),
    [CHAT]: (window, i) => {
      moveToSpace(1, { window });
      window.setFrame(regions[0]["left-2/3"]);
    },
    [NOTES]: (window, i) => {
      moveToSpace(1, { window });
      window.setFrame(regions[0]["right-2/3"]);
    },
  };
}

function moveToSpace(slot, { window }) {
  Space.all().forEach((s, i) => {
    if (i === slot) {
      Phoenix.log("move window", window.title(), "to space", slot);
      s.addWindows([window]);
    } else {
      s.removeWindows([window]);
    }
  });
}

/**
 * moves the current window to the next screen
 */
function moveToPrevScreen() {
  stateToggle(["full"], { screen: Window.focused().screen().previous() });
}

/**
 * moves the current window to the next screen
 */
function moveToNextScreen() {
  stateToggle(["full"], { screen: Window.focused().screen().next() });
}

/**
 * debugger to log out the current state of the UI
 */
function getInfo() {
  Screen.all().forEach((s, i) =>
    Phoenix.log(
      `[Screen#all:${i}]`,
      s.identifier(),
      `\t${JSON.stringify(s.frame())}`
    )
  );

  const _win = Window.focused();
  Phoenix.log("[Window#focused]\t", _win.app().name(), ">", _win.title());
  Window.recent().forEach((w, i) =>
    Phoenix.log(`[Window#recent:${i}]`, w.app().name(), `\t${w.title()}`)
  );

  Space.all().forEach((s, i) => {
    Phoenix.log(`[Space#all:${i}]`, "isNormal=", !!s.isNormal());
    s.windows().forEach((w) =>
      Phoenix.log(`[Space#all:${i}]`, w.app().name(), `\t${w.title()}`)
    );
  });
}

/**
 * Utility to logg the running of other functions
 *
 * @param {function} fn the function you'll run
 * @returns a callback fun (when provided no args) or the result of calling `fn`
 */
function logged(fn) {
  return function (...args) {
    Phoenix.log(`--- start ${fn.name}`);
    const value = fn(...args);
    Phoenix.log(`--- end ${fn.name}`);
    return value;
  };
}

Phoenix.notify("initialized (monitor with `log stream --process Phoenix`)");
```
