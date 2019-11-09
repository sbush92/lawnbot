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
var batteryLevel = 100;


function mowLawn() {
  finished = false;

  document.getElementsByClassName('button-start')[0].disabled = true;
  document.getElementsByClassName('button-stop')[0].disabled = false;

  timer = window.setInterval(function() {
    updateTime();
  }, 1000)

  batteryLevelProxy = new Proxy({}, {
    set: function(target, key, value) {
      target[key] = value;
      updateBattery(value);
      return true;
    }
  });

  batteryLevelProxy.level = 100;

  progressProxy = new Proxy({}, {
    set: function(target, key, value) {
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

  var curRow = 0;
  var curCol = 0;

  var nextRow = 0;
  var nextCol = 1;

  mowToNextTile(curRow, curCol, nextRow, nextCol);
}

function mowToNextTile(curRow, curCol, nextRow, nextCol) {
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

  findPathRecurse(path, curRow, curCol, nextRow, nextCol, false);

  prevLocation = null;

  iterator = path.values();

  var id = setInterval(() => {
    locationString = iterator.next().value;
    if (!locationString) {
		
      clearInterval(id);
	  
      if (finished === true) {
        // document.getElementById("pauseButton").className = "hidden";
        // document.getElementById("restartButton").className = "button-lawn";
        returnToCharger(path, curRow, curCol);
        
        return;
      }

      if (paused === true) {
        pausedRow = curRow; 
        pausedCol = curCol;
        pausedNextRow = nextRow;
        pausedNextCol = nextCol + 1;
        return;
      } else {
        mowToNextTile(curRow, curCol, nextRow, nextCol + 1);
        return;
      }
    }

    if (prevLocation) {
      var bgImg = getCellBgImg(prevLocation.row, prevLocation.col);
      var prevCell = getCell(prevLocation.row, prevLocation.col);

      if ((bgImg === ROBOT) || bgImg == GRASS || bgImg === HOME || bgImg === AWAY) {
        if (bgImg === HOME) {
          prevCell.style.backgroundImage = lawnTiles.away.bg;
        } else {
          prevCell.style.backgroundImage = lawnTiles.cutGrass.bg;
        }
      }
  }

    var location = JSON.parse(locationString);

    var bgImg = getCellBgImg(location.row, location.col);
    var locCell = getCell(location.row, location.col);
 
    if (bgImg === GRASS ||bgImg === CUT_GRASS || bgImg === HOME || bgImg === AWAY) {
      if (bgImg === HOME) {
        locCell.style.backgroundImage = lawnTiles.home.bg;
      } else {
        locCell.style.backgroundImage = ROBOT //will need to do something special for the charging station
      }
    }
    
    visitedLocations.add(JSON.stringify(location));
    progressProxy.progress = visitedLocations.size - 1;

    curRow = location.row;
    curCol = location.col;

    prevLocation = location;

    var rows = document.getElementById("rows").value;
    var cells = document.getElementById("cols").value;
	
    if (location.row === rows -1 && location.col === cells -1) {
      finished = true;
      return;
    }
  },
  200);
}

// this still will have problems if the tile to find is not reachable
function findPathRecurse(path, curRow, curCol, nextRow, nextCol, pathFound) {
  var wentLeft;
  var wentUp;
  var wentRight;
  var wentDown;

  if (pathFound === true) return true;

  // Out of bounds
  if (curRow < 0 || curRow >= rows || curCol < 0 || curCol >= columns)
    return false;

  var curBgImg = getCellBgImg(curRow, curCol);
  if (curRow === nextRow && curCol === nextCol) {
    if (curBgImg !== CUT_GRASS && curBgImg !== GRASS && curBgImg !== ROBOT && curBgImg !== HOME) {
      // location is not grass, mark it visited
      visitedLocations.add(JSON.stringify({ row: curRow, col: curCol }));
      progressProxy.progress = visitedLocations.size - 1;
    } else {
      path.add(JSON.stringify({ row: curRow, col: curCol }));
      batteryLevelProxy.level -= 5;
	  
      if (batteryLevelProxy.level == 20) {
        returnToCharger(path, curRow, curCol);
      }
    }

    pathFound = true;
    return true;
  }

  if (curBgImg !== CUT_GRASS && curBgImg !== GRASS && curBgImg !== ROBOT && curBgImg !== HOME) {
    // location is not grass, mark it visited
    visitedLocations.add(JSON.stringify({ row: curRow, col: curCol }));
    progressProxy.progress = visitedLocations.size - 1;
    return false;
  }

  if (path.has(JSON.stringify({ row: curRow, col: curCol }))) 
    return false;

  path.add(JSON.stringify({ row: curRow, col: curCol }));

  wentLeft = false;
  wentUp = false;
  wentRight = false;
  wentDown = false;

  if (!wentUp && curRow > nextRow) {
    pathFound = findPathRecurse(
      path,
      curRow - 1,
      curCol,
      nextRow,
      nextCol,
      pathFound
    );
	
    wentUp = true;
  }

  if (!wentLeft && curCol > nextCol) {
    pathFound = findPathRecurse(
      path,
      curRow,
      curCol - 1,
      nextRow,
      nextCol,
      pathFound
    );
	
    wentLeft = true;
  }

  if (!wentRight && curCol < nextCol) {
    pathFound =
		findPathRecurse(
		  path,
		  curRow,
		  curCol + 1,
		  nextRow,
		  nextCol,
		  pathFound
		);
	
    wentRight = true;
  }

  if (!wentDown && curRow < nextRow) {
    pathFound =
		findPathRecurse(
		  path,
		  curRow + 1,
		  curCol,
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
		  curRow - 1,
		  curCol,
		  nextRow,
		  nextCol,
		  pathFound
		);
  }

  if (!wentLeft) {
    pathFound =
		findPathRecurse(
		  path,
		  curRow,
		  curCol - 1,
		  nextRow,
		  nextCol,
		  pathFound
		);
  }

  if (!wentRight) {
    pathFound =
		findPathRecurse(
		  path,
		  curRow,
		  curCol + 1,
		  nextRow,
		  nextCol,
		  pathFound
		);
  }

  if (!wentDown) {
    pathFound =
		findPathRecurse(
		  path,
		  curRow + 1,
		  curCol,
		  nextRow,
		  nextCol,
		  pathFound
		);
  }

  if (!pathFound) {
    path.delete(JSON.stringify({ row: curRow, col: curCol }));
    return false;
  }

  return true;
}

function returnToCharger(path, curRow, curCol) {
  path.clear();
  var nextRow = 0;
  var nextCol = 0;
  findPathRecurse(path, curRow, curCol, nextRow, nextCol, false);
  path.add(JSON.stringify({ row: 0, col: 0 }));

  prevLocation = null;

  iterator = path.values();

  var id = setInterval(() => {
    locationString = iterator.next().value
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
      var bgImg = getCellBgImg(prevLocation.row, prevLocation.col);
      var prevCell = getCell(prevLocation.row, prevLocation.col);
      if (bgImg === ROBOT || bgImg === GRASS || bgImg === HOME || bgImg === AWAY) {
        if (prevCell.style.backgroundImage === HOME) {
          prevCell.style.backgroundImage = lawnTiles.away.bg;
      } else {
        prevCell.style.backgroundImage = lawnTiles.cutGrass.bg;
      }
    }
  }

    var location = JSON.parse(locationString);
    var bgImg = getCellBgImg(location.row, location.col);
    var locCell = getCell(location.row, location.col);

    if (bgImg === GRASS ||bgImg === CUT_GRASS || bgImg === HOME || bgImg === AWAY) {
      if (bgImg === HOME || bgImg === AWAY) {
        locCell.style.backgroundImage = lawnTiles.home.bg;
      } else {
        locCell.style.backgroundImage = ROBOT 
      }
    }

    visitedLocations.add(JSON.stringify(location));
    progressProxy.progress = visitedLocations.size - 1;

    curRow = location.row;
    curCol = location.col;

    prevLocation = location;

    var rows = document.getElementById("rows").value;
    var cells = document.getElementById("cols").value;
    if (location.row === rows -1  && location.col === cells -1 ) {
      finished = true;
      return;
    }
  },
  200);
  
  batteryLevelProxy.level = 100;
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