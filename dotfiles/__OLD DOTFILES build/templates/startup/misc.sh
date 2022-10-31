# Run a local node_modules package, http://stackoverflow.com/questions/9679932/
alias npm-exec='path[1,0]=$(npm bin)' # ZSH syntax, for BASH use 'PATH=$(npm bin):$PATH'

# ievms Virtual Environments
alias vms='VBoxManage list vms'
alias ie8vm='VBoxManage startvm "IE8 - WinXP" --type gui'
alias ie9vm='VBoxManage startvm "IE9 - Win7" --type gui'

# Go Development
# https://ahmadawais.com/install-go-lang-on-macos-with-homebrew/
export GOPATH="${HOME}/.go"
export GOROOT="$(brew --prefix golang)/libexec"
export PATH="$PATH:${GOPATH}/bin:${GOROOT}/bin"

export PATH=/Users/sgregson/VisualSFM_OS_X/vsfm/bin:$PATH

# Tools
alias chrome="$CHROME_PATH"
if [ ! "$OS_MAC" ]; then
  alias subl="$SUBLIME_PATH"
fi

alias prealpath="python -c 'import os, sys; print os.path.realpath(sys.argv[1])'"

# JRNL with a template
# For developer log (work and life-related)
devlog() {
  # env jrnl_template comes from environment repo
  echo $JRNL_TEMPLATE | jrnl && jrnl -1 --edit
}

# G I T - S T A T S    I M A G E
# Render your git stats into the CLI, and save to ~/Downloads
git_stats_img() {
  TMP=$(mktemp)".html"
  OUT=gitstats-"$(date '+%Y-%m-%d')".png
  cd ~/Downloads && rm $OUT
  git-stats --raw | git-stats-html -o $TMP && pageres $TMP 775x250 --filename="gitstats-<%=date%>" && imgcat $OUT
  cd -
}

# Graph the chance of rain
weather() {
  # Custom mapbox api key for this application, use mine or use your own
  # Fallback to MAPBOX_ACCESS_TOKEN environment variable
  MAPBOX_CLI_APIKEY=""
  MAPBOX_CLI_APIKEY=${MAPBOX_CLI_APIKEY:-$MAPBOX_ACCESS_TOKEN}

  # Set datastore
  mkdir -p $HOME/.forecast
  forecast_data=$HOME/.forecast/data.json

  # Fetch location
  WHEREAT="$(whereami | sed 's/.*: //')"
  LAT=${WHEREAT:0:9}
  LON=${WHEREAT:10:9}

  # Render map or map link
  map="https://api.mapbox.com/styles/v1/mapbox/streets-v9/static/$LON,$LAT,17,0,40/200x200?access_token=$MAPBOX_CLI_APIKEY"
  gmap_url="https://maps.google.com/?q=$LAT,$LON"

  if ! type "imgcat" > /dev/null; then
    # Falls back to printing a link
    printf "%s\n" $gmap_url
  else
    printf "%s\t%s\n" `curl -sS $map | imgcat` "($LAT,$LON)"
  fi

  # Fetch forecast data, cache forecast calls for 10 minutes (HHMMSS+1000)
  if [[ `date "+%y%m%d%H%M%S"` -ge $((PREV_FORECAST_CALL+1000)) ]]; then
    export PREV_FORECAST_CALL=`date "+%y%m%d%H%M%S"`
    curl "https://api.forecast.io/forecast/$FORECAST_IO_APIKEY/$LAT,$LON" > $forecast_data
  fi

  # Render useful forecast data
  jq ".daily.summary" $forecast_data

  printf "\t\t%s\n" "|       |   *   |       |"
  printf "%s\t" "Temp" \
    `jq -j '.currently.apparentTemperature | tostring | . + "°"' $forecast_data` \
    `jq '.hourly.data[0:24][].apparentTemperature' $forecast_data | spark`
  printf "%s\n" `jq -j '[.hourly.data[0:24] | min_by(.apparentTemperature), max_by(.apparentTemperature) | .apparentTemperature ] | map(tostring) | join("-|+")' $forecast_data`

  printf "%s\t" "Rain" \
    `jq -j '.currently.precipProbability * 100 | tostring | . + "%"' $forecast_data` \
    `jq '.hourly.data[0:24][].precipProbability * 100' $forecast_data | spark`
  printf "%s\n" `jq -j '[.hourly.data[0:24] | min_by(.precipProbability), max_by(.precipProbability) | .precipProbability * 100 ] | map(tostring) | join("-|+")' $forecast_data`

  printf "%s\t" "Wind" \
    `jq -j '.currently.windSpeed | tostring | . + "mph"' $forecast_data` \
    `jq '.hourly.data[0:24][].windSpeed' $forecast_data | spark`
  printf "%s\n" `jq -j '[.hourly.data[0:24] | min_by(.windSpeed), max_by(.windSpeed) | .windSpeed ] | map(tostring) | join("-|+")' $forecast_data`

  printf "%s\t" "Clouds" \
    `jq -j '.currently.cloudCover * 10000 | floor | . / 100 | tostring | . + "% "' $forecast_data` \
    `jq '.hourly.data[0:24][].cloudCover * 100' $forecast_data | spark`
  printf "%s\n" `jq -j '[.hourly.data[0:24] | min_by(.cloudCover), max_by(.cloudCover) | .cloudCover ] | map(tostring) | join("-|+")' $forecast_data`
  printf "\t\t%s\n" "|       |   *   |       |"

  jq ".minutely.summary" $forecast_data
  jq ".alerts[]?.description" $forecast_data
}

py_virtualenv() {
  if [ -n "$VIRTUAL_ENV" ]; then
      echo "(${VIRTUAL_ENV##*/}) "
  fi
}

# The next line updates PATH for the Google Cloud SDK.
if [ -f '/Users/sgregson/google-cloud-sdk/path.zsh.inc' ]; then source '/Users/sgregson/google-cloud-sdk/path.zsh.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '/Users/sgregson/google-cloud-sdk/completion.zsh.inc' ]; then source '/Users/sgregson/google-cloud-sdk/completion.zsh.inc'; fi
