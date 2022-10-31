OS_CYGWIN="x"
WF_GIT_PATH="d:/wf_git/"
SUBLIME_PATH="C:/Program\ Files/Sublime\ Text\ 3/sublime_text.exe"
CHROME_PATH="C:/Program\ Files\ \(x86\)/Google/Chrome/Application/chrome.exe"

printf "C:/Users/sgregson/AppData/Roaming/Sublime \ Text\ 3/" > $DOTFILES/config/sublime/META

setopt sharehistory # share command history across terminals
export CYGWIN="winsymlinks:nativestrict"

# Aliases as `command`-invoked functions to prevent recursion from oh-my-zsh
c()             { command clear "$@"}
rm()            { command rm -I "$@" }
ls() { command ls -Ap --color=tty --ignore="*NTUSER.DAT*" "$@" }

# Kill off those annoying "GREP_OPTIONS DEPRECATED ALERTS"
alias grep="/usr/bin/grep $GREP_OPTIONS"
unset GREP_OPTIONS