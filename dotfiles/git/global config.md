# Global gitconfig

```ini $HOME/.gitconfig-csnzoo action=build title=gitconfig(work-id)
[user]
  name = Spencer Gregson
  email = sgregson@wayfair.com
  signingkey = 376AA48582F8ADAFA44B47A1FB5A1923EFF83E21
```

```ini $HOME/.gitconfig action=symlink title=gitconfig(global)
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
  u-stat          = "! git diff -M --full-index origin/master...HEAD --stat"
  u-stat-open     = "! git diff -M --diff-filter=MAd --full-index origin/master...HEAD --name-status | grep -o \"[a-z\\.\\/_A-Z0-9]\\{2,\\}\" | xargs subl"
  # BRANCHES
  bd              = "for-each-ref --sort=committerdate refs/heads/ --format='%1B[0;31m%(committerdate:relative)%1B[m%09%(refname:short) [%1B[1;34m%(upstream:short)%1B[m]'"
  todo            = branch --no-merged
  unmerged        = rev-list --not master --no-merges --pretty
  # LOG/LIST
  branchcommits   = log master...
  last            = log -1 HEAD --stat -p
  log-line        = log --topo-order -u -L
  log-mine        = log --author="%GIT_NAME" --topo-order --reverse -u -L
  log-u           = "! MERGE_BASE=$(git merge-base origin/master HEAD); git log $MERGE_BASE..HEAD"
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
  # %GIT_ALIASES
  # Workflow
  mark-done       = "! f() { git branch -m \"$1\" \"=$1\"; }; f"
  mark-ready      = "! f() { git branch -m \"$1\" \"+$1\"; }; f"
  permission-reset = "!git diff -p -R --no-color | grep -E \"^(diff|(old|new) mode)\" --color=never | git apply"
  ## Project Tracker
  # `git set-pt 123456` => appends _pt_123456 to the current branch name
  set-pt          = "! this=$(git rev-parse --abbrev-ref HEAD); pre="_pt_"; that=$1; shift; soon=$this$pre$that; git branch -m $this $soon"
  # `git open-pt` => opens PT to the current branch's known pt#, assuming convention "branch_name_pt_123456"
  open-pt         = "! pt=$(git rev-parse --abbrev-ref HEAD | rev | cut -d'_' -f 1 | rev); open \"https://admin.wayfair.com/tracker/views/142.php?PrtID=$pt\""
```

# Global gitignore

```sh $HOME/.gitignore action=symlink title=gitignore(global)
*.sublime-workspace
*.sublime-projects
.tags*

desktop.ini
.DS_Store
```
