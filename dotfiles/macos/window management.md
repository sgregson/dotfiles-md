# Slate JS

The configuration object for https://github.com/jigish/slate.

The most important utility is to automatically arrange windows when I connect known laptop/monitor configurations.

Significant overlap with phoenix.js

```js $HOME/.slate.js action=symlink title="Slate Installer - possibly deprecated?" disabled=true
/**
 * Slate Configuration File
 *
 * @copyright Spencer Gregson
 */

/*globals slate*/
slate.log("[Slate] - start of config");

// Configs
slate.configAll({
  defaultToCurrentScreen: true,
  secondsBetweenRepeat: 0.1,
  checkDefaultsOnLoad: true,
  repeatOnHoldOps: "resize,nudge,push",
  focusCheckWidthMax: 3000,
  orderScreensLeftToRight: true,
  gridBackgroundColor: [140, 25, 160, 1.0],
  gridCellBackgroundColor: [200, 40, 230, 1.0],
  windowHintsSpread: true,
  windowHintsFontColor: [140, 25, 160, 1.0],
  windowHintsBackgroundColor: [200, 40, 230, 0.6],
  windowHintsRoundedCornerSize: 10,
  windowHintsIgnoreHiddenWindows: false,
  windowHintsShowIcons: true,
});

// Registries for binding keys and grids
var binder = {};
var grids = {
  grids: {},
  padding: 4,
};
var hints = { characters: "1234567890qwertyuiop" };

// Key combo aliases
var hyper = "ctrl;alt;cmd";
var hyperBig = "ctrl;alt;cmd;shift";

// Application aliases
var browser = "Google Chrome";
var editor = "Sublime Text";
var terminal = "iTerm2";
var chat = "Slack";
var email = "Microsoft Outlook";
var player = "Spotify";
var tasks = "TaskPaper";

// Monitors and Layouts
var monLaptop = "1440x900";
var monThunderbolt = "2560x1440";
var monPcHome = "1920x1200";
var monPcWork = "1050x1680";

var monAlt = {
  laptop: "1440x900",
  vertical: "1920x1200",
  horizontal: "1920x1200",
};

// Generic Operations
var hideSpotify = slate.operation("hide", { app: player });
var focusEditor = slate.operation("focus", { app: editor });

/**
 * Generalized fullscreen operation with configurable screen ID
 * @param  {String} id the numeric/descriptive ID of the screen of interest. `null` falls back to current
 * @return {None}
 */
function fullScreen(id) {
  return slate.operation("move", {
    screen: id,
    x: "screenOriginX",
    y: "screenOriginY",
    width: "screenSizeX",
    height: "screenSizeY",
  });
}

var monitorJson3 = {
  _before_: { operations: hideSpotify }, // before the layout is activated, hide Spotify
  _after_: { operations: focusEditor }, // after the layout is activated, focus iTerm2
};
monitorJson3[terminal] = {
  repeat: true,
  operations: [
    function (windowObj) {
      var title = windowObj.title();
      if (title !== undefined && title.match(/(Wayfair)|(repos)|(realsync)/)) {
        // Only move the codebase iTerm window to the vertical monitor
        windowObj.doOperation(fullScreen(monAlt.vertical));
      }
    },
  ],
};
monitorJson3[email] = {
  repeat: true,
  operations: [
    function (windowObj) {
      var title = windowObj.title();
      if (title.match(/Reminders?/)) {
        windowObj.doOperation(
          slate.operation("move", {
            screen: monAlt.horizontal,
            x: "screenSizeX * 5/6",
            width: "screenSizeX * 1/6",
            y: "screenSizeY * 4/5",
            height: "screenSizeY * 1/5",
          })
        );
      } else if (title.match(/(Inbox)|(Indirect)/)) {
        // Only move the main outlook window
        windowObj.doOperation(
          slate.operation("move", {
            screen: monAlt.horizontal,
            x: "screenOriginX",
            y: "screenOriginY",
            width: "screenSizeX",
            height: "screenSizeY /2",
          })
        );
      }
    },
  ],
};
monitorJson3[browser] = {
  repeat: true,
  operations: [
    function (windowObj) {
      var title = windowObj.title();
      if (title !== undefined && title.match(/Hangouts/)) {
        windowObj.doOperation(
          slate.operation("move", {
            screen: monAlt.horizontal,
            x: "screenSizeX * 5/6",
            y: "screenSizeY * 2/5",
            width: "screenSizeX / 6",
            height: "screenSizeY * 2/5",
          })
        );
      }
    },
  ],
};
monitorJson3[chat] = {
  operations: slate.operation("move", {
    screen: monAlt.vertical,
    x: "screenOriginX",
    y: "screenOriginY",
    width: "screenSizeX",
    height: "screenSizeY * 2 / 3",
  }),
};

monitorJson3[tasks] = {
  operations: [
    (windowObj) => {
      var title = windowObj.title();
      if (title !== undefined && title.match(/did\.txt/)) {
        slate.operation("move", {
          screen: monAlt.laptop,
          x: "screenSizeX / 2",
          y: "screenSizeY * 2/3",
          width: "screenSizeX / 2",
          height: "screenSizeY * 2/3",
        });
      }
    },
  ],
};

var monitorJson3Alt = {
  _before_: { operations: hideSpotify }, // before the layout is activated, hide Spotify
  _after_: { operations: focusEditor }, // after the layout is activated, focus iTerm2
  [terminal]: {
    repeat: true,
    operations: [
      function (windowObj) {
        var title = windowObj.title();
        if (
          title !== undefined &&
          title.match(/(Wayfair)|(repos)|(realsync)/)
        ) {
          // Only move the codebase iTerm window to the vertical monitor
          windowObj.doOperation(fullScreen(monLaptop));
        }
      },
    ],
  },
  [email]: {
    repeat: true,
    operations: [
      function (windowObj) {
        var title = windowObj.title();
        if (title.match(/Reminders?/)) {
          windowObj.doOperation(
            slate.operation("move", {
              screen: monThunderbolt,
              x: "screenSizeX * 5/6",
              width: "screenSizeX * 1/6",
              y: "screenSizeY * 4/5",
              height: "screenSizeY * 1/5",
            })
          );
        } else if (title.match(/(Inbox)|(Indirect)/)) {
          // Only move the main outlook window
          windowObj.doOperation(
            slate.operation("move", {
              screen: monPcWork,
              x: "screenOriginX",
              y: "screenOriginY",
              width: "screenSizeX",
              height: "screenSizeY /2",
            })
          );
        }
      },
    ],
  },
  [browser]: {
    repeat: true,
    operations: [
      function (windowObj) {
        var title = windowObj.title();
        if (title !== undefined && title.match(/Hangouts/)) {
          windowObj.doOperation(
            slate.operation("move", {
              screen: monThunderbolt,
              x: "screenSizeX * 5/6",
              y: "screenSizeY * 2/5",
              width: "screenSizeX / 6",
              height: "screenSizeY * 2/5",
            })
          );
        }
      },
    ],
  },
  [chat]: {
    operations: slate.operation("move", {
      screen: monPcWork,
      x: "screenOriginX",
      y: "screenOriginY",
      width: "screenSizeX",
      height: "screenSizeY * 2 / 3",
    }),
  },

  [tasks]: {
    operations: [
      (windowObj) => {
        var title = windowObj.title();
        if (title !== undefined && title.match(/did\.txt/)) {
          slate.operation("move", {
            screen: monPcWork,
            x: "screenSizeX / 2",
            y: "screenSizeY * 2/3",
            width: "screenSizeX / 2",
            height: "screenSizeY * 2/3",
          });
        }
      },
    ],
  },
};

var layout3monitor = slate.layout("threeMonitors", monitorJson3);
var layout3monitorAlt = slate.layout("threeMonitorsAlt", monitorJson3Alt);

// Grid definitions
grids["grids"][monLaptop] = { width: 3, height: 2 };
grids["grids"][monThunderbolt] = { width: 6, height: 5 };
grids["grids"][monPcHome] = { width: 6, height: 5 };
grids["grids"][monPcWork] = { width: 2, height: 3 };

////
// KEY BINDINGS
////

// Slate functions keymaps
binder["r:" + hyperBig] = slate.operation("relaunch");
binder["c:" + hyper] = slate.operation("grid", grids);
binder["g:" + hyper] = slate.operation("hint", hints);

// Layout keymaps
binder["pad0:" + hyper] = fullScreen(null);
binder["0:" + hyper] = fullScreen(null);
binder["pad1:" + hyper] = fullScreen(monPcWork);
binder["1:" + hyper] = fullScreen(monPcWork);
binder["pad2:" + hyper] = fullScreen(monLaptop);
binder["2:" + hyper] = fullScreen(monLaptop);
binder["pad3:" + hyper] = fullScreen(monThunderbolt);
binder["3:" + hyper] = fullScreen(monThunderbolt);

binder["pad6:" + hyper] = slate.operation("layout", { name: layout3monitor });
binder["6:" + hyper] = slate.operation("layout", { name: layout3monitor });
binder["pad7:" + hyper] = slate.operation("layout", {
  name: layout3monitorAlt,
});
binder["7:" + hyper] = slate.operation("layout", { name: layout3monitorAlt });

////
// Set-up all the things!
////
slate.bindAll(binder);
slate.default([monLaptop, monThunderbolt, monPcWork], layout3monitor);

slate.log("[SLATE] - end of config");
```
