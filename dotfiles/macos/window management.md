# Phoenix JS

```js $HOME/.phoenix.js action=symlink title=phoenix-install
/// <reference path="../../../types/phoenix.d.ts" />
"use strict";
/*globals Phoenix Window App Key Screen Space*/
Phoenix.notify("initializing");

Phoenix.set({
  daemon: false,
  openAtLogin: true,
});

// Key combo aliases
var HYPER = ["cmd", "alt", "ctrl"];
const SUPER_HYPER = ["shift", "cmd", "alt", "ctrl"];

// utils for double-clicking
const DOUBLE_PRESS_MS = 250;
const lastPressTime = new Map();

// Application aliases
var BROWSER = "Brave Browser";
var EDITOR = "Code";
var TERMINAL = "iTerm2";
var CHAT = "Slack";
var NOTES = "Notion";
var PLAYER = "Spotify";
var CALENDAR = "Cron";

// APPLICATION TRIGGERS
Key.on("j", HYPER, () => logged(openFocusHide)(BROWSER));
Key.on("k", HYPER, () => logged(openFocusHide)(CHAT));
Key.on("l", HYPER, () => logged(openFocusHide)(TERMINAL));
Key.on("n", HYPER, () => logged(openFocusHide)(NOTES));
Key.on("p", HYPER, () => logged(openFocusHide)(PLAYER));
Key.on("o", HYPER, () => {
  const overlap = 100;

  Screen.all().forEach((s) => {
    s.windows().forEach((w, i) => {
      const { x, y, width, height } = s.flippedVisibleFrame();
      const step = {
        x: width / 2 / (s.windows().length - 1),
        y: height / 2 / (s.windows().length - 1),
      };
      w.setFrame({
        x: x + step.x * i,
        y: y + step.y * i,
        width: width / 2,
        height: height / 2,
      });
    });
  });
});
// double-mash space to trigger default layout (single-mash to call up VS Code)
dblKeyPress("space", HYPER, (repeated) =>
  repeated ? logged(triggerLayout)() : logged(openFocusHide)(EDITOR)
);

// Window Arrangement Keymaps
// - l/full/r and up/full/down PC-style monitor wrapping
// prettier-ignore
{
  Key.on("up", HYPER, () => logged(stateToggle)(["bottom", "full-y", "top"]));
  Key.on("down", HYPER, () => logged(stateToggle)(["top", "full-y", "bottom"]));
  Key.on("left", HYPER, () => logged(stateToggle)([ "right-3", "right-2", "right-2/3", "full-x", "left-2/3", "left-2", "left-3",   ]));
  Key.on("right", HYPER, () => logged(stateToggle)([ "left-3", "left-2", "left-2/3", "full-x", "right-2/3", "right-2", "right-3",   ]));
}

// fullscreen
Key.on("0", HYPER, () => logged(stateToggle)(["full"]));
Key.on("keypad0", HYPER, () => logged(stateToggle)(["full"]));

// default split 2:1
Key.on(",", HYPER, () => logged(stateToggle)(["left-2/3"]));
Key.on(".", HYPER, () => logged(stateToggle)(["right-3"]));

// move to next screen
Key.on("[", HYPER, () => logged(moveToNextScreen)());
Key.on("]", HYPER, () => logged(moveToNextScreen)());

// Window layout
const onScreenChange = new Event("screensDidChange", () =>
  // needs to wait for MacOS to mess everything up first
  Timer.after(3, () => logged(triggerLayout)())
);

Key.on("keypad*", HYPER, () => {
  // https://itectec.com/askdifferent/macos-create-a-new-space-using-a-keyboard-shortcut/
  Task.run("/usr/bin/osascript", ["-e", "set volume output volume 25"], () => {
    Modal.build({
      origin: (frame) => {
        const screen = Screen.main().flippedVisibleFrame();
        return {
          x: screen.x + screen.width / 2 - frame.width / 2,
          y: screen.y + screen.height / 2 - frame.height / 2,
        };
      },
      duration: 1,
      weight: 48,
      appearance: "light",
      text: "🔉",
    }).show();
  });
});

// Debugging: get info
Key.on("i", HYPER, () => logged(getInfo)());
Key.on("c", HYPER, () => logged(collectWindows)());

/**
 * locate-able regions of a screen, expressed as fragments of a window Frame
 *
 * @param  {Screen} _screen The screen of interest
 * @return {Rectangle}         [description]
 */
function getRegions(_screen) {
  if (!_screen) _screen = Window.focused().screen();

  return {
    full: {
      x: _screen.flippedVisibleFrame().x,
      width: _screen.flippedVisibleFrame().width,
      y: _screen.flippedVisibleFrame().y,
      height: _screen.flippedVisibleFrame().height,
    },
    bottom: {
      y:
        Math.floor(_screen.flippedVisibleFrame().height / 2) +
        _screen.flippedVisibleFrame().y,
      height: Math.floor(_screen.flippedVisibleFrame().height / 2),
    },
    "full-y": {
      y: _screen.flippedVisibleFrame().y,
      height: _screen.flippedVisibleFrame().height,
    },
    top: {
      y: _screen.flippedVisibleFrame().y,
      height: Math.floor(_screen.flippedVisibleFrame().height / 2),
    },
    //===//
    "left-3": {
      x: _screen.flippedVisibleFrame().x,
      width: Math.floor(_screen.flippedVisibleFrame().width / 3),
    },
    "left-2": {
      x: _screen.flippedVisibleFrame().x,
      width: Math.floor(_screen.flippedVisibleFrame().width / 2),
    },
    "left-2/3": {
      x: _screen.flippedVisibleFrame().x,
      width: Math.floor((_screen.flippedVisibleFrame().width / 3) * 2),
    },
    "full-x": {
      x: _screen.flippedVisibleFrame().x,
      width: _screen.flippedVisibleFrame().width,
    },
    "right-2/3": {
      x:
        Math.floor(_screen.flippedVisibleFrame().width / 3) +
        _screen.flippedVisibleFrame().x,
      width: Math.floor((_screen.flippedVisibleFrame().width / 3) * 2),
    },
    "right-2": {
      x:
        Math.floor(_screen.flippedVisibleFrame().width / 2) +
        _screen.flippedVisibleFrame().x,
      width: Math.floor(_screen.flippedVisibleFrame().width / 2),
    },
    "right-3": {
      x:
        Math.floor((_screen.flippedVisibleFrame().width / 3) * 2) +
        _screen.flippedVisibleFrame().x,
      width: Math.floor(_screen.flippedVisibleFrame().width / 3),
    },
  };
}

/**
 * Unified function to open/focus/hide an application
 * @param  {String} _appTarget name for app of interest
 * @return {none}
 */
function openFocusHide(_appTarget) {
  var appTarget = App.get(_appTarget);

  if (!appTarget) {
    App.launch(_appTarget, { focus: true });
    return;
  }

  if (appTarget.isActive()) {
    appTarget.hide();
  } else {
    appTarget.focus();
  }
}

/**
 * Factory for making double-click handlers.
 * The lastClickTime Map is used to cache previous timer events, cached to the key+modifier combo
 *
 * @param {string} key the key trigger for the event
 * @param {Array} meta modifier keys for the key event
 * @param {Function} fn callback function which should be called (called with a boolean for whether it was a single or doubleclick)
 * @param {Array} timers a queue of single-click timers
 */
function dblKeyPress(key, meta, fn, timers = []) {
  const clickId = `${key}${JSON.stringify(meta)}`;
  if (!lastPressTime.has(clickId)) lastPressTime.set(clickId, 0);

  Key.once(key, meta, () => {
    // cancel any "single-click" timers
    timers.forEach((t) => t.stop());
    timers = [];

    // figure if we're doubleclicked
    const n = Date.now();
    const isDouble = n - lastPressTime.get(clickId) <= DOUBLE_PRESS_MS;

    if (isDouble) {
      // run double-click callback
      fn(true);
    } else {
      // queue a single-click callback (will be cancelled if pressed again)
      timers.push(
        new Timer(DOUBLE_PRESS_MS / 1000, false, () => {
          fn(false);
        })
      );
    }

    lastPressTime.set(clickId, isDouble ? n - DOUBLE_PRESS_MS : n);
    dblKeyPress(key, meta, fn, timers);
  });
}

/**
 * Window state toggle - as in PC super-left/right
 * @param  {Array}  _tests      list of [x,width] tuples to iterate through for matching & assigning
 * @return {null}
 */
function stateToggle(_tests, _win = Window.focused()) {
  // TODO: "if there's another screen, push a state from the next screen into it"
  _tests.push(_tests[0]); // permit wrapping states [l,f,r,l]

  // const _win = Window.focused();
  const regions = getRegions(_win.screen());

  // current state initialized to "unmatched"
  let currentState = -1;

  // Match one axis or the other
  for (var i = 0; i <= _tests.length - 1; i++) {
    // prettier-ignore
    var boxCheck = (_win.frame().x == regions[_tests[i]].x && _win.frame().width  == regions[_tests[i]].width)
                 ||(_win.frame().y == regions[_tests[i]].y && _win.frame().height == regions[_tests[i]].height);

    // current box matches, break
    if (boxCheck) {
      currentState = i;
      Phoenix.log(
        `found state ${_tests[currentState]}(${currentState}), next: ${
          _tests[currentState + 1]
        }(${currentState + 1})`
      );
      break;
    }
  }

  if (currentState === -1) Phoenix.log("unmatched window state");

  // Assign next state in 'regions' queue (unmatched is effectively "0" == -1 + 1)
  const nextRegion = _tests[currentState + 1];
  const nextFrame = Object.assign({}, _win.frame(), regions[nextRegion]);

  Phoenix.log(nextRegion, JSON.stringify(regions[nextRegion]));
  _win.setFrame(nextFrame);
}

/**
 * default layout uses screens or spaces to segment primary/secondary workspace
 */
const LAYOUT_SPACING_UNIT = 35;
function triggerLayout() {
  let layout;
  // use regions[i] to access specific screens
  const regions = Screen.all().map((s) => getRegions(s));

  if (Screen.all().length === 3) {
    layout = layout3screens(regions);
  } else if (Screen.all().length === 2) {
    layout = layout2screens(regions);
  } else if (Space.all().lenth > 1) {
    layout = layoutSpaces(regions);
  } else {
    // Guard against errors
    Phoenix.notify(
      "COULD NOT SET LAYOUT:\nlayout must have either muliple screens or multiple spaces"
    );
    return;
  }

  // cache the current window since we manipulate focus in the loop
  const _winStart = Window.focused();

  for (const [appName, locateWindow] of Object.entries(layout)) {
    try {
      // only way we can find items in other spaces, if necessary
      App.get(appName).mainWindow().focus();
    } catch (err) {
      Phoenix.log(`${appName} did not have a main window to focus`);
    }
    if (!App.get(appName)) continue;

    App.get(appName)
      .windows()
      .filter((w) => w.isVisible())
      .forEach(locateWindow);
  }

  _winStart.focus();
  Phoenix.notify("Layout assigned.");
}

/**
 * Layout Definition for 3-screen arrangement
 *
 * @param {Array} regions
 * @returns Object
 */
function layout3screens() {
  Phoenix.notify("3 Screen Layout");

  // use regions[i] to access specific screens. regions are sorted left-to-right
  let regions = Screen.all().sort((a, b) => a.frame().x - b.frame().x);
  Phoenix.log(JSON.stringify(regions));

  regions = regions.map((s) => getRegions(s));
  Phoenix.log(JSON.stringify(regions));

  return {
    [BROWSER]: (window, i, all) =>
      window.setFrame({
        ...regions[0]["full-y"],
        ...regions[0]["right-3"],
        x: regions[0]["right-3"].x - i * LAYOUT_SPACING_UNIT,
        y: regions[0]["full-y"].y + (all.length - i - 1) * LAYOUT_SPACING_UNIT,
        height:
          regions[0]["full-y"].height -
          (all.length - i - 1) * LAYOUT_SPACING_UNIT,
      }),
    [EDITOR]: (window) =>
      window.setFrame({
        ...regions[2]["full-y"],
        ...regions[2]["full-x"],
      }),
    [CHAT]: (window, i) => {
      moveToSpace(0, { window });
      window.setFrame({
        ...regions[0]["left-2/3"],
        ...regions[0]["full-y"],
        width:
          regions[0]["left-2/3"].width -
          (App.get(BROWSER)
            .windows()
            .filter((w) => w.isVisible()).length +
            App.get(CHAT)
              .windows()
              .filter((w) => w.isVisible()).length -
            // two windows should be an even 2:1 split
            2) *
            LAYOUT_SPACING_UNIT,
        x: regions[0]["left-2/3"].x + i * LAYOUT_SPACING_UNIT,
      });
    },
    [CALENDAR]: (window, i) => {
      window.setFrame({ ...regions[1]["full-x"], ...regions[1]["bottom"] });
    },
    [NOTES]: (window, i) => {
      moveToSpace(0, { window });
      window.setFrame({ ...regions[1]["full-x"], ...regions[1]["top"] });
    },
  };
}
function layout2screens(regions) {
  Phoenix.notify("2 Screen Layout");
  return {
    [BROWSER]: (window, i, all) =>
      window.setFrame({
        ...regions[1]["full-y"],
        ...regions[1]["right-3"],
        x: regions[1]["right-3"].x - i * LAYOUT_SPACING_UNIT,
        y: regions[1]["full-y"].y + (all.length - i - 1) * LAYOUT_SPACING_UNIT,
        height:
          regions[1]["full-y"].height -
          (all.length - i - 1) * LAYOUT_SPACING_UNIT,
      }),
    [EDITOR]: (window, i) =>
      window.setFrame({
        ...regions[1]["full-y"],
        ...regions[1]["left-2/3"],
        width:
          regions[1]["left-2/3"].width -
          (App.get(BROWSER)
            .windows()
            .filter((w) => w.isVisible()).length +
            App.get(EDITOR)
              .windows()
              .filter((w) => w.isVisible()).length -
            // two windows should be an even 2:1 split
            2) *
            LAYOUT_SPACING_UNIT,
        x: regions[1]["left-2/3"].x + i * LAYOUT_SPACING_UNIT,
      }),
    [CHAT]: (window, i) => {
      moveToSpace(0, { window });
      window.setFrame(regions[0]["left-2/3"]);
    },
    [NOTES]: (window, i) => {
      moveToSpace(0, { window });
      window.setFrame(regions[0]["right-2/3"]);
    },
  };
}
function layoutSpaces(regions) {
  return {
    [BROWSER]: (window, i, all) => moveToSpace(0, { window }),
    [EDITOR]: (window, i) => moveToSpace(0, { window }),
    [CHAT]: (window, i) => {
      moveToSpace(1, { window });
      window.setFrame(regions[0]["left-2/3"]);
    },
    [NOTES]: (window, i) => {
      moveToSpace(1, { window });
      window.setFrame(regions[0]["right-2/3"]);
    },
  };
}

function moveToSpace(slot, { window }) {
  Space.all().forEach((s, i) => {
    if (i === slot) {
      Phoenix.log("move window", window.title(), "to space", slot);
      s.addWindows([window]);
    } else {
      s.removeWindows([window]);
    }
  });
}

/**
 * moves the current window to the next screen
 */
function moveToNextScreen() {
  const _win = Window.focused();
  _win.setFrame(_win.screen().next().frame());
  stateToggle(["full"]);
}

/**
 * debugger to log out the current state of the UI
 */
function getInfo() {
  Screen.all().forEach((s, i) =>
    Phoenix.log(
      `[Screen#all:${i}]`,
      s.identifier(),
      `\t${JSON.stringify(s.frame())}`
    )
  );

  const _win = Window.focused();
  Phoenix.log("[Window#focused]\t", _win.app().name(), ">", _win.title());
  Window.recent().forEach((w, i) =>
    Phoenix.log(`[Window#recent:${i}]`, w.app().name(), `\t${w.title()}`)
  );

  Space.all().forEach((s, i) => {
    Phoenix.log(`[Space#all:${i}]`, "isNormal=", !!s.isNormal());
    s.windows().forEach((w) =>
      Phoenix.log(`[Space#all:${i}]`, w.app().name(), `\t${w.title()}`)
    );
  });
}

/**
 * Utility to logg the running of other functions
 *
 * @param {function} fn the function you'll run
 * @returns a callback fun (when provided no args) or the result of calling `fn`
 */
function logged(fn) {
  return function (...args) {
    Phoenix.log(`--- start ${fn.name}`);
    const value = fn(...args);
    Phoenix.log(`--- end ${fn.name}`);
    return value;
  };
}

Phoenix.notify("initialized (monitor with `log stream --process Phoenix`)");
```

# Slate JS

The configuration object for https://github.com/jigish/slate.

The most important utility is to automatically arrange windows when I connect known laptop/monitor configurations.

Significant overlap with phoenix.js

```js $HOME/.slate.js action=symlink title=slate-installer
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
