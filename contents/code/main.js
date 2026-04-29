console.log("---- nativeTilingImproved loaded ----");

// Logging
const gLog_enabled = false;

function gLog(section, object) {
  if (gLog_enabled) {
    console.log("[" + section + "]", JSON.stringify(object));
  }
}

// Config getters
function getUnmaximizeToTileEnabled() {
  return readConfig("unmaximizeToTile", true);
}

function getRaiseTogetherEnabled() {
  return readConfig("raiseTogether", true);
}

// Helper functions
function getParentTile(window) {
  let currentTile = window.tile;

  if (!currentTile) {
    return null;
  }

  while (currentTile.parent) {
    currentTile = currentTile.parent;
  }

  return currentTile;
}

function getAllWindowsInTile(tile) {
  if (!tile) {
    return [];
  }

  const windows = [];

  function processTile(currentTile) {
    for (window of currentTile.windows) {
      windows.push(window);
    }
    if (currentTile.tiles.length > 0) {
      for (tile of currentTile.tiles) {
        processTile(tile);
      }
    }
  }

  processTile(tile);
  return windows;
}

// Hooks registration
for (const window of workspace.stackingOrder) {
  registerUnmaximizeToTileHooks(window);
}

workspace.windowAdded.connect((window) => {
  registerUnmaximizeToTileHooks(window);
});

workspace.windowActivated.connect((window) => {
  raiseTiledWindows();
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
  if (window.maximizeMode === 0 && getUnmaximizeToTileEnabled()) {
    window.tile = tile;
  }
  gLog("maximizeHookRan", window);
}

// Raise together feature
function raiseTiledWindows() {
  if (!getRaiseTogetherEnabled()) {
    return;
  }

  // This has a side effect of reversing, which actually what what we want here
  // because normally in stacking order (according to API docs) "later windows cover earlier ones"
  let stackingOrder = [...workspace.stackingOrder];

  let windowsInTile = getAllWindowsInTile(
    getParentTile(workspace.activeWindow),
  );

  for (window of stackingOrder) {
    if (windowsInTile.includes(window)) {
      workspace.raiseWindow(window);
    }
  }
}
