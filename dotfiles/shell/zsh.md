# Utilities

Load NVM automatically based on directory

```zsh $HOME/.custom/nvm.sh action=build title=nvm-loader
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

```zsh $HOME/.custom/glob.sh action=build title=zsh-extended-globbing
#! /bin/zsh
# Permit ZSH extended globbing
# only include in interactive shells (zshrc) - https://unix.stackexchange.com/questions/431805/zsh-is-there-a-problem-with-always-enabling-extended-glob
setopt extended_glob
```

```zsh $HOME/.custom/zmv.sh action=build title=zmv-for-build-rename
# Dry Run:$ zmv -n 'Page(*)/shot.jpg' 'shot-${1}.jpg'
# Actual: $ zmv 'Page(*)/shot.jpg' 'shot-${1}.jpg'
autoload zmv
alias mmv='noglob zmv -W'
alias zcp='zmv -C'
alias zln='zmv -L'
```

```zsh $HOME/.custom/env.sh action=build title=environment-variables
# Manage environment variables with 1Password CLI (was installed via homebrew)
# op signin [VaultName]
echo "...fetch env"

# https://rossedman.io/blog/computers/setting-env-vars-from-1password/
export MAPBOX_ACCESS_TOKEN=$(op read op://Personal/MAPBOX_ACCESS_TOKEN/password)
export DAISYDISK_LICENSE=$(op read op://Personal/DAISYDISK_LICENSE/password)

# apply the sublimerge licence
if [ -d "$HOME/Library/Application Support/Sublime Text 3/" ]; then
  echo "{\"key\": \"$(op read op://Personal/SUBLIMERGE_LICENSE/password)\"" > "$HOME/Library/Application Support/Sublime Text 3/Packages/User/Sublimerge.sublime-license"
fi
```

# ZSH

## Shared Environment (.zshenv)

```zsh $HOME/.zshenv action=symlink title=zshenv
# install nvm on first run,
# probably not a good idea to do here
# source $HOME/.custom/nvm.sh 'zshenv'
```

## Non-interactive shells (zprofile)

The profile file for non-interactive terminal windows.

Generally, only put the things in here you'd want to have available to scripts (not open terminal windows)

```zsh $HOME/.zprofile action=symlink title=zprofile
export PATH="$PATH:$(python3 -m site --user-base)/bin"
# Enable rbenv for sublime plugins (linting)
# export PATH="$HOME/.rbenv/bin:$PATH"
# eval "$(rbenv init -)"

# Set PATH, MANPATH, etc., for Homebrew.
eval "$(/opt/homebrew/bin/brew shellenv)"

# Enable NVM for sublime plugins
source $HOME/.custom/nvm.sh 'zprofile'
```

## Login Shells(.zshrc)

```zsh $HOME/.zshrc action=symlink title=zshrc-LATEST
# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load ---
# load a random theme with "random" and echo $RANDOM_THEME
ZSH_THEME="robbyrussell"
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
HYPHEN_INSENSITIVE="true"

# Uncomment one of the following lines to change the auto-update behavior
# zstyle ':omz:update' mode disabled  # disable automatic updates
# zstyle ':omz:update' mode auto      # update automatically without asking
# zstyle ':omz:update' mode reminder  # just remind me to update when it's time

# Uncomment the following line to change how often to auto-update (in days).
# zstyle ':omz:update' frequency 13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# You can also set it to another string to have that shown instead of the default red dots.
# e.g. COMPLETION_WAITING_DOTS="%F{yellow}waiting...%f"
# Caution: this setting can cause issues with multiline prompts in zsh < 5.7.1 (see #5765)
COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
HIST_STAMPS="yyyy-mm-dd"

# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
plugins=(git)

# Load it!
source $ZSH/oh-my-zsh.sh

# User Config (references to other dotfiles)
source $HOME/.custom/git.sh
source $HOME/.custom/env.sh
source $HOME/.custom/zmv.sh
source $HOME/.custom/glob.sh

export GPG_TTY=$(tty)

printf " nvm $(nvm --version) (run 'nvm use stable')"
```

## Login Shell (DEPRECATED)

```zsh $HOME/.zshrc action=symlink title=zshrc-OLD disabled=true
# Path to your oh-my-zsh installation.
export ZSH=$HOME/.oh-my-zsh

# Would you like to use another custom folder than $ZSH/custom?
ZSH_CUSTOM="$HOME/.startup/.oh-my-zsh/custom"

# Set name of the theme to load.
# Look in ~/.oh-my-zsh/themes/
# Optionally, if you set this to "random", it'll load a random theme each
# time that oh-my-zsh is loaded.
export DEFAULT_USER="sgregson"
ZSH_THEME="ys" # [powerline|agnoster-stg|babun-stg]

if [[ $ZSH_THEME == "powerline" ]]; then
  # https://github.com/ryanoasis/nerd-fonts for most of these glyphs
  ZSH_THEME_GIT_PROMPT_STASHED=" %F{yellow}\uf059"
  POWERLINE_GIT_PROMPT_PREFIX="\uf126"

  POWERLINE_LEFT_SEP=$'\ue0bc'
  POWERLINE_RIGHT_SEP=$'\ue0be'

  POWERLINE_GIT_AHEAD="%F{black}⬆"
  POWERLINE_GIT_BEHIND="%F{black}⬇"

  POWERLINE_GIT_CLEAN="%F{green}\uf058"
  POWERLINE_GIT_DIRTY="%F{red}\uf08f"
  POWERLINE_GIT_ADDED="%F{red}\uf055"
  # POWERLINE_GIT_UNMERGED

  POWERLINE_GIT_MODIFIED="%F{blue}\uf021"
  POWERLINE_GIT_DELETED="%F{blue}\uf056"
  POWERLINE_GIT_UNTRACKED="%F{blue}\uf06a"
  POWERLINE_GIT_RENAMED="%F{blue}≈"

  POWERLINE_RIGHT_B="none"
  POWERLINE_RIGHT_A="exit-status-on-fail"
  POWERLINE_RIGHT_A_COLOR_FRONT="black"
  POWERLINE_RIGHT_A_COLOR_BACK="white"
  POWERLINE_PATH="full"
  POWERLINE_DATE_FORMAT="%D{%b %d}"
  POWERLINE_HIDE_HOST_NAME="true"
fi

# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to change how often to auto-update (in days).
# export UPDATE_ZSH_DAYS=13

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to disable command auto-correction.
DISABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# The optional three formats: "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# HIST_STAMPS="mm/dd/yyyy"

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
plugins=(git git-prompt)

source $ZSH/oh-my-zsh.sh

# User configuration

export PATH=$HOME/bin:/usr/local/bin:$PATH
export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/latest/bin
export PATH="/Users/sgregson/.deno/bin:$PATH"

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

source "$HOME/.startup/init.sh"
```
