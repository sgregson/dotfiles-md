# TODO: find-replace `build/home` with `~`

You can use https://github.com/IonicaBizau/git-stats to keep track of your git stats locally

```sh action=null
npm i -g git-stats
```

```js $HOME/git-stats-config.js action=null
module.exports = {
  theme: {
    background: "#111111",
    foreground: "#565656",
    levels: ["#343434", "#2e643d", "#589f43", "#98bc21", "#b9fc04"],
  },
  first_day: "Mon",
  since: undefined,
  until: undefined,
  authors: false,
  global_activity: false,
};
```
