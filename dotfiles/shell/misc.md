## reloadTabs()

> Call this function to reload any browser tab (chrome) on a matching domain. Useful when paired with utilities like `nodemon` when you don't have hot module reloading

```sh $HOME/.custom/reloadTabs action=symlink title=reloadTabs-function when=os.darwin
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
