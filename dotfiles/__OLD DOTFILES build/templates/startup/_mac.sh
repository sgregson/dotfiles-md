OS_MAC="x"

if [ -d ~/Wayfair/repos/ ]; then
  WF_GIT_PATH="$HOME/Wayfair/repos/"
else
  WF_GIT_PATH="$HOME/Documents/Projects/Wayfair/wf_git/"
fi
SUBLIME_PATH="/Applications/Sublime Text.app/Contents/SharedSupport/bin/subl"
CHROME_PATH="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"

# log the appropriate location for sublime text plugins
# printf "~/Library/Application Support/Sublime Text 3" > $DOTFILES/config/sublime/META

# Include pip packages installed with --user flag
if [ -d $HOME/Library/Python/2.7/bin ]; then
  PATH=$PATH:$HOME/Library/Python/2.7/bin
fi

setopt sharehistory # share command history across terminals

