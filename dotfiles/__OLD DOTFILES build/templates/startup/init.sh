###
# CORE INITIALIZATION SCRIPT
###

# PRIVATE SCRIPTS
# Source all scripts located in ~/.env
if [ -d KODY_ENV_DIR ]; then
  for envfile in KODY_ENV_DIR**/*.sh(D.); do
    printf "* %s ... " ${envfile:t}

    # Overwrite with -f argument
    source $envfile

    # success state
    if [ $? -eq 0 ]; then
      printf "$mag%s$end\n" "OK"
    else
      printf "$red%s$end\n" "Failed"
    fi
  done
fi

# variables which need to be assigned in the OS-specific scripts
WF_GIT_PATH="KODY_WAYFAIR_REPO_DIR"
SUBLIME_PATH=''
CHROME_PATH=''

# Detect OSTYPE for session context and create variable for profile detection
case $OSTYPE in
  darwin*)
    printf "(OSX)"
    source "KODY_STARTUP_DIR"_mac.sh
    ;;
  cygwin*)
    printf "(Cygwin)"
    source "KODY_STARTUP_DIR"_cyg.sh
    ;;
  msys*)
    printf "(Git Bash)"
    source "KODY_STARTUP_DIR"_mysys.sh
    ;;
esac


source "KODY_STARTUP_DIR"git.sh
source "KODY_STARTUP_DIR"misc.sh

