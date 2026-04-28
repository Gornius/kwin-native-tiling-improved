console.log("---- nativeTilingImproved loaded ----");

// Logging helpers
const gLog_enabled = false;

function gLog(section, object) {
  if (gLog_enabled) {
    console.log("[" + section + "]", JSON.stringify(object));
  }
}

// Hooks registration
for (const window of workspace.stackingOrder) {
  registerUnmaximizeToTileHooks(window);
}

workspace.windowAdded.connect((window) => {
  registerUnmaximizeToTileHooks(window);
});

// Unmaximize to tile feature
function registerUnmaximizeToTileHooks(window) {
  window.maximizedAboutToChange.connect((futureMaximizeMode) =>
    aboutToMaximizeHook(window, futureMaximizeMode),
  );
  window.maximizedChanged.connect(() => maximizeHook(window));
}

const temporaryWindowTiles = {};

function aboutToMaximizeHook(window, futureMaximizeMode) {
  if (window.maximizeMode === 0) {
    temporaryWindowTiles[window] = window.tile;
  }
  if (window.maximizeMode !== 0) {
    window.tile = tile;
  }
  gLog("aboutToMaximizeHookRan", window);
}

function maximizeHook(window) {
  const tile = temporaryWindowTiles[window];
  if (window.maximizeMode === 0) {
    window.tile = tile;
  }
  gLog("maximizeHookRan", window);
}
