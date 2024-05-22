```sh action=run title=taps when=os.darwin
brew tap buildkite/cli
brew tap caskroom/fonts
brew tap homebrew/bundle
brew tap ikuwow/imgcat
brew tap joeyhoer/extras
brew tap mapbox/cli
brew tap welldan97/whereami
```

```sh action=run title=install-all-nerd-fonts when=os.darwin
brew install $( brew search font | grep nerd | tr '\n' ' ' )
```

```sh action=run title=formulas when=os.darwin
brew install asdf;
# brew install git
brew install bk;
brew install deno;
brew install gitleaks; #secret scanning for git repos
brew install gh; # github CLI
brew install imgcat;
brew install joeyhoer/extras/gzthermal;
brew install jq;
brew install jrnl;
# brew install kryptco/tap/kr
brew install mapbox/cli/mapbox;
brew install meetingbar;
# brew install mr;
brew install pinentry-mac; # GPG Pinentry command
brew install rbenv;
brew install spark;
brew install whereami;
# brew install zsh;
brew install zsh-completions;
```

```sh action=run title=casks when=os.darwin
brew install --cask 1password/tap/1password-cli
brew install --cask alfred
brew install --cask bitbar
# brew install --cask cloudapp
brew install --cask daisydisk
brew install --cask diffmerge
brew install --cask discord
brew install --cask dropbox
# brew install --cask evernotes
brew install --cask firefox@developer-edition
brew install --cask fluid
brew install --cask flux
brew install --cask font-fira-code
brew install --cask google-chrome
brew install --cask google-cloud-sdk
# brew install --cask iterm2-beta
# brew install --cask mattr-slate
# brew install --cask meld (replaced with vscode)
brew install --cask numi
brew install --cask phoenix
brew install --cask processing
brew install --cask unnaturalscrollwheels # more reliable than scroll-reverser
# brew install --cask shady
# brew install --cask skitch
brew install --cask slack
brew install --cask spotify
# brew install --cask steam
# brew install --cask sublime-text-dev
```

```sh $HOME/.custom/gcloud-brew.sh action=symlink title=gcloud-completions when=os.darwin
source "$(brew --prefix)/share/google-cloud-sdk/path.zsh.inc"
source "$(brew --prefix)/share/google-cloud-sdk/completion.zsh.inc"
```
