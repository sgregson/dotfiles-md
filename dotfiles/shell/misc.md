```zsh $HOME/.custom/reloadTabs action=build disabled=true title=reloadTabs-function
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
