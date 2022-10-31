# ZSH

## Shared Environment (.zshenv)

```zsh $HOME/.zshenv action=symlink title=zshenv
# install nvm on first run
if [ -d ~/.nvm/ ]; then
  echo "...using NVM (env)"
  source ~/.nvm/nvm.sh
fi
```

## Login Shells(.zshrc)

```zsh $HOME/.zshrc action=symlink title=zshrc(global)
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

## Non-interactive shells (zprofile)

The profile file for non-interactive terminal windows.

Generally, only put the things in here you'd want to have available to scripts (not open terminal windows)

```zsh $HOME/.zprofile action=symlink title=zprofile
# Enable rbenv for sublime plugins (linting)
export PATH="$HOME/.rbenv/bin:$PATH"
export PATH="$PATH:$(python -m site --user-site)"
eval "$(rbenv init -)"

# Enable NVM for sublime plugins
# install nvm on first run
if [ -d ~/.nvm/ ]; then
  echo "...using NVM (profile)"
  source ~/.nvm/nvm.sh
fi
```
