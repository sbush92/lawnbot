const CUT_GRASS = 'url("assets/img/cut-grass.png")';
const GRASS = 'url("assets/img/grass.png")';
const ROBOT = 'url("assets/img/robot.png")';
const HOME = 'url("assets/img/lawnbot-home.png")';
const AWAY = 'url("assets/img/home.png")';


var visitedLocations;
var path;
paused = false; // Global - used in simulator.js
var finished = false;

var prevLocation;
var iterator;
var locationString;
var pausedRow;
var pausedCol;
var pausedNextRow;
var pausedNextCol;

var step = 200;

returning = false;

var mowPrevLocation;


function mowLawn() {
  finished = false;

  document.getElementsByClassName('button-start')[0].disabled = true;
  document.getElementsByClassName('button-stop')[0].disabled = false;

  timer = window.setInterval(function () {
    updateTime();
  }, 1000)

  batteryLevelProxy = new Proxy({}, {
    set: function (target, key, value) {
      target[key] = value;
      updateBattery(value);
      return true;
    }
  });

  batteryLevelProxy.level = 100;

  progressProxy = new Proxy({}, {
    set: function (target, key, value) {
      target[key] = value;
      if (key === "progress")
        updateProgress(value, target['total']);
      return true;
    }
  });

  //set button to invisible
  rows = document.getElementById('rows').value;
  columns = document.getElementById('cols').value;

  progressProxy.total = (rows * columns) - 1; // Minus one for the base station

  if (rows >= 1 && columns >= 1) {
    // document.getElementById("startButton").className = "hidden";
    // document.getElementById("pauseButton").className = "button-lawn"
  }

  visitedLocations = new Set();
  visitedLocations.add(JSON.stringify({ row: 0, col: 0 }));
  progressProxy.progress = 0;

  //any changes needed here?
  grid = document.getElementById('lawnGrid');

  path = new Set();

  mowToNextTile(0, 0, 0, 0);
}

function mowToNextTile(currentRow, currentCol, nextRow, nextCol) {
  if (nextCol >= columns) {
    nextCol = 0;
    nextRow++;
  }

  if (nextRow >= rows) return;

  while (visitedLocations.has(JSON.stringify({ row: nextRow, col: nextCol }))) {
    nextCol++;

    if (nextCol >= columns) {
      nextCol = 0;
      nextRow++;
    }

    if (nextRow >= rows)
      return;
  }

  path.clear();

  findPathRecurse(path, currentRow, currentCol, nextRow, nextCol, false);

  var prevLocation = null;

  var mowNextTileIterator = path.values();

  var mowNextInterval = setInterval(() => {
    locationString = mowNextTileIterator.next().value;
    if (!locationString) {

      clearInterval(mowNextInterval);

      if (finished === true) {
        // document.getElementById("pauseButton").className = "hidden";
        // document.getElementById("restartButton").className = "button-lawn";
        returnToCharger(path, currentRow, currentCol);

        return;
      }

      if (paused === true) {
        pausedRow = currentRow;
        pausedCol = currentCol;
        pausedNextRow = nextRow;
        pausedNextCol = nextCol + 1;
        return;
      } else {
        mowToNextTile(currentRow, currentCol, nextRow, nextCol);
        return;
      }
    }

    if (prevLocation) {
      var locImg = getCellBgImg(prevLocation.row, prevLocation.col);
      var prevCell = getCell(prevLocation.row, prevLocation.col);

      if ((locImg === ROBOT) || locImg == GRASS || locImg === HOME || locImg === AWAY) {
        if (locImg === HOME) {
          prevCell.style.backgroundImage = lawnTiles.away.bg;
        } else {
          prevCell.style.backgroundImage = lawnTiles.cutGrass.bg;
        }
      }
    }

    var location = JSON.parse(locationString);

    var locImg = getCellBgImg(location.row, location.col);
    var locCell = getCell(location.row, location.col);

    if (locImg === GRASS || locImg === CUT_GRASS || locImg === HOME || locImg === AWAY) {
      if (locImg === HOME) {
        locCell.style.backgroundImage = lawnTiles.home.bg;
      } else {
        locCell.style.backgroundImage = ROBOT //will need to do something special for the charging station
      }
    }

    visitedLocations.add(JSON.stringify(location));
    progressProxy.progress = visitedLocations.size - 1;


    currentRow = location.row;
    currentCol = location.col;

    prevLocation = location;
    mowPrevLocation = prevLocation;

    var rows = document.getElementById("rows").value;
    var cells = document.getElementById("cols").value;

    if (location.row === rows - 1 && location.col === cells - 1) {
      finished = true;
      return;
    }

  },
    step);
}

// this still will have problems if the tile to find is not reachable
function findPathRecurse(path, currentRow, currentCol, nextRow, nextCol, pathFound) {
  var wentLeft;
  var wentUp;
  var wentRight;
  var wentDown;

  if (pathFound === true) return true;

  // Out of bounds
  if (currentRow < 0 || currentRow >= rows || currentCol < 0 || currentCol >= columns)
    return false;

  var curBgImg = getCellBgImg(currentRow, currentCol);
  if (currentRow === nextRow && currentCol === nextCol) {
    if (curBgImg !== CUT_GRASS && curBgImg !== GRASS && curBgImg !== ROBOT && curBgImg !== HOME) {
      // location is not grass, mark it visited
      visitedLocations.add(JSON.stringify({ row: currentRow, col: currentCol }));
      progressProxy.progress = visitedLocations.size - 1;
    } else {
      path.add(JSON.stringify({ row: currentRow, col: currentCol }));
      if (batteryLevelProxy.level > 20)
      batteryLevelProxy.level -= 5;

    if (batteryLevelProxy.level == 20) {
      returnToCharger(path, mowPrevLocation.row, mowPrevLocation.col);
    }

    }

    pathFound = true;
    return true;
  }

  if (curBgImg !== CUT_GRASS && curBgImg !== GRASS && curBgImg !== ROBOT && curBgImg !== HOME) {
    // location is not grass, mark it visited
    visitedLocations.add(JSON.stringify({ row: currentRow, col: currentCol }));
    progressProxy.progress = visitedLocations.size - 1;
    return false;
  }

  if (path.has(JSON.stringify({ row: currentRow, col: currentCol })))
    return false;

  path.add(JSON.stringify({ row: currentRow, col: currentCol }));

  wentLeft = false;
  wentUp = false;
  wentRight = false;
  wentDown = false;

  if (!wentUp && currentRow > nextRow) {
    pathFound = findPathRecurse(
      path,
      currentRow - 1,
      currentCol,
      nextRow,
      nextCol,
      pathFound
    );

    wentUp = true;
  }

  if (!wentLeft && currentCol > nextCol) {
    pathFound = findPathRecurse(
      path,
      currentRow,
      currentCol - 1,
      nextRow,
      nextCol,
      pathFound
    );

    wentLeft = true;
  }

  if (!wentRight && currentCol < nextCol) {
    pathFound =
      findPathRecurse(
        path,
        currentRow,
        currentCol + 1,
        nextRow,
        nextCol,
        pathFound
      );

    wentRight = true;
  }

  if (!wentDown && currentRow < nextRow) {
    pathFound =
      findPathRecurse(
        path,
        currentRow + 1,
        currentCol,
        nextRow,
        nextCol,
        pathFound
      );

    wentDown = true;
  }

  if (!wentUp) {
    pathFound =
      findPathRecurse(
        path,
        currentRow - 1,
        currentCol,
        nextRow,
        nextCol,
        pathFound
      );
  }

  if (!wentLeft) {
    pathFound =
      findPathRecurse(
        path,
        currentRow,
        currentCol - 1,
        nextRow,
        nextCol,
        pathFound
      );
  }

  if (!wentRight) {
    pathFound =
      findPathRecurse(
        path,
        currentRow,
        currentCol + 1,
        nextRow,
        nextCol,
        pathFound
      );
  }

  if (!wentDown) {
    pathFound =
      findPathRecurse(
        path,
        currentRow + 1,
        currentCol,
        nextRow,
        nextCol,
        pathFound
      );
  }

  if (!pathFound) {
    path.delete(JSON.stringify({ row: currentRow, col: currentCol }));
    return false;
  } 

  return true;
}

function returnToCharger(path, currentRow, currentCol) {
  returning = true;
  path.clear();
  var nextRow = 0;
  var nextCol = 0;
  findPathRecurse(path, currentRow, currentCol, nextRow, nextCol, false);
  path.add(JSON.stringify({ row: 0, col: 0 }));

  // if (prevLocation == null)
  var prevLocation = { row: currentRow, col: currentCol };

  if (prevLocation != null)
    getCell(prevLocation.row, prevLocation.col).style.backgroundImage = lawnTiles.cutGrass.bg;



  var returnIterator = path.values();

  var id = setInterval(() => {
    locationString = returnIterator.next().value
    if (locationString == null) {
      clearInterval(id);
      if (finished === true) {
        // Bot is actually at the home base here
        window.clearInterval(timer);
        resetButtons();
        return;
      } else return;
    }

    if (prevLocation) {
      var locImg = getCellBgImg(prevLocation.row, prevLocation.col);
      var prevCell = getCell(prevLocation.row, prevLocation.col);
      if (locImg === ROBOT || locImg === GRASS || locImg === HOME || locImg === AWAY) {
        if (prevCell.style.backgroundImage === HOME) {
          prevCell.style.backgroundImage = lawnTiles.away.bg;
        } else {
          prevCell.style.backgroundImage = lawnTiles.cutGrass.bg;
        }
      }
    }

    var location = JSON.parse(locationString);
    var locImg = getCellBgImg(location.row, location.col);
    var locCell = getCell(location.row, location.col);

    if (locImg === GRASS || locImg === CUT_GRASS || locImg === HOME || locImg === AWAY) {
      if (locImg === HOME || locImg === AWAY) {
        batteryLevelProxy.level = 100;
        locCell.style.backgroundImage = lawnTiles.home.bg;
        returning = false;
      } else if (locImg === GRASS) {
        locCell.style.backgroundImage = lawnTiles.cutGrass.bg;
      } else {
        locCell.style.backgroundImage = ROBOT
      }
    }

    visitedLocations.add(JSON.stringify(location));
    progressProxy.progress = visitedLocations.size - 1;

    // currentRow = location.row;
    // currentCol = location.col;

    prevLocation = location;

    var rows = document.getElementById("rows").value;
    var cells = document.getElementById("cols").value;

    if (location.row === rows && location.col - 1 === cells - 1) {
      finished = true;
      return;
    }

    if (location.row === 0 && location.col === 0) {
      getCell(location.row, location.col).style.backgroundImage = lawnTiles.home.bg;
    }
  },
    step);
}

function getCellBgImg(row, col) {
  var lawnRow = document.getElementsByClassName('row')[row];
  var lawnCell = lawnRow.getElementsByClassName('col')[col];
  return lawnCell.style.backgroundImage;
}

function getCell(row, col) {
  var r = document.getElementsByClassName('row')[row];
  return r.getElementsByClassName('col')[col];
}