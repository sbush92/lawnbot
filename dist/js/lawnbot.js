const CUT_GRASS = '<img src="assets/img/cut-grass.png">';
const GRASS = '<img src="assets/img/grass.png">';
const ROBOT = '<img src="assets/img/robot.png">';
const HOME = '<img src="assets/img/lawnbot-home.png">';
const AWAY = '<img src="assets/img/home.png">';


var visitedLocations;
var path;
var paused = false;
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
	
  //set button to invisible
  var rows = document.getElementById("rows").value;
  var cells = document.getElementById("cells").value;
  if(rows >= 1 && cells >= 1) {
    document.getElementById("startButton").className = "hidden";
    document.getElementById("pauseButton").className = "button-lawn";

  }
  
  //visitedLocations = [{row: 0, col: 0}];
  visitedLocations = new Set();
  visitedLocations.add(JSON.stringify({ row: 0, col: 0 }));
  //any changes needed here?
  grid = document.getElementById("lanwGrid");
  rows = document.getElementById("rows").value;
  columns = document.getElementById("cells").value;
  //path = [];
  path = new Set();
  var curRow = 0;
  var curCol = 0;
  var nextRow = 0;
  var nextCol = 1; 
  mowToNextTile(curRow, curCol, nextRow, nextCol);
}

function returnToCharger(path, curRow, curCol) {
  path.clear();
  var nextRow = 0;
  var nextCol = 0;

  findPathRecurse(path, curRow, curCol, nextRow, nextCol, false);
  path.add(JSON.stringify({ row: 0, col: 0 }));
  grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML = lawnHTML.cutGrass.img;
  prevLocation = null;
  iterator = path.values();

  var id = setInterval(() => { 
  console.log(new Date().getSeconds());
	//updateTime(Date.now());
    locationString = iterator.next().value;

    if (!locationString) {
      clearInterval(id);
      if(finished === true){
        return;
      }
    }

    if (
      prevLocation &&
      (grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === ROBOT ||
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === GRASS ||
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === HOME ||
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === AWAY)
    ) {
      if (
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === HOME){
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML = lawnHTML.away.img;
      } 
      else {
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML = lawnHTML.cutGrass.img;
      }
    }

    var location = JSON.parse(locationString);
    if (
      grid.rows[location.row].cells[location.col].innerHTML === GRASS ||
      grid.rows[location.row].cells[location.col].innerHTML === CUT_GRASS ||
      grid.rows[location.row].cells[location.col].innerHTML === HOME ||
      grid.rows[location.row].cells[location.col].innerHTML === AWAY
    ) {
      if (grid.rows[location.row].cells[location.col].innerHTML === HOME) {
        grid.rows[location.row].cells[location.col].innerHTML = lawnHTML.home.img;
      }
	    else if(grid.rows[location.row].cells[location.col].innerHTML === GRASS){
        grid.rows[location.row].cells[location.col].innerHTML = lawnHTML.cutGrass.img;
      }
      else grid.rows[location.row].cells[location.col].innerHTML = ROBOT;
    }

    visitedLocations.add(JSON.stringify(location));
    curRow = location.row;
    curCol = location.col;
    prevLocation = location;
    var rows = document.getElementById("rows").value;
    var cells = document.getElementById("cells").value;

    if (location.row === rows -1  && location.col === cells -1 ) {
      finished = true;
      return;
    }

    if (location.row === 0  && location.col === 0 ) {
      grid.rows[location.row].cells[location.col].innerHTML = lawnHTML.home.img;
    }
    
  },
  200);
    batteryLevel = 100;
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
	  
	console.log(new Date().getSeconds());
	//updateTime(Date.now());
	  
    locationString = iterator.next().value;
    if (!locationString) {
		
      clearInterval(id);
	  
      if(finished === true) {
		  
        document.getElementById("pauseButton").className = "hidden";
        document.getElementById("restartButton").className = "button-lawn";
        returnToCharger(path, curRow, curCol);
        return;
      }
      if(paused === true) {
		  
        pausedRow = curRow; 
        pausedCol = curCol;
        pausedNextRow = nextRow;
        pausedNextCol = nextCol + 1;
        return;
      }
	  else {
		  
        mowToNextTile(curRow, curCol, nextRow, nextCol + 1);
        return;
      }
    }

    if (
      prevLocation &&
      (grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === ROBOT ||
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === GRASS ||
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === HOME ||
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === AWAY)
    ) {
		
      if (grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === HOME) {
		  
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML = lawnHTML.away.img;
      }
	  else {
		  
        grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML = lawnHTML.cutGrass.img;
      }
    }

    var location = JSON.parse(locationString);
 
    if (
      grid.rows[location.row].cells[location.col].innerHTML === GRASS ||
      grid.rows[location.row].cells[location.col].innerHTML === CUT_GRASS ||
      grid.rows[location.row].cells[location.col].innerHTML === HOME ||
      grid.rows[location.row].cells[location.col].innerHTML === AWAY
    ) {
		
      if (grid.rows[location.row].cells[location.col].innerHTML === HOME) {
		  
        grid.rows[location.row].cells[location.col].innerHTML = lawnHTML.home.img;
      }
	  else {
		  
        grid.rows[location.row].cells[location.col].innerHTML = ROBOT; //will need to do something special for the charging station
      }
    }

    //visitedLocations.push(location);
    visitedLocations.add(JSON.stringify(location));
    curRow = location.row;
    curCol = location.col;

    prevLocation = location;
   
    var rows = document.getElementById("rows").value;
    var cells = document.getElementById("cells").value;
    
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

  if (curRow === nextRow && curCol === nextCol) {
	  
    if (
      grid.rows[curRow].cells[curCol].innerHTML !== CUT_GRASS &&
      grid.rows[curRow].cells[curCol].innerHTML !== GRASS &&
      grid.rows[curRow].cells[curCol].innerHTML !== ROBOT &&
      grid.rows[curRow].cells[curCol].innerHTML !== HOME
    ) {
		
      // location is not grass, mark it visited
      //visitedLocations.push({row: curRow, col: curCol});
      visitedLocations.add(JSON.stringify({ row: curRow, col: curCol }));
      
    }
	else {
		
      //path.push({row: curRow, col: curCol});
      path.add(JSON.stringify({ row: curRow, col: curCol }));
      batteryLevel = batteryLevel - 5;
	  
      if (batteryLevel == 20) {
        returnToCharger(path, curRow, curCol);
      }
    }

    pathFound = true;
    return true;
  }
  if (curRow < 0 || curRow >= rows || curCol < 0 || curCol >= columns)
    return false;

  if (
    grid.rows[curRow].cells[curCol].innerHTML !== CUT_GRASS &&
    grid.rows[curRow].cells[curCol].innerHTML !== GRASS &&
    grid.rows[curRow].cells[curCol].innerHTML !== ROBOT &&
    grid.rows[curRow].cells[curCol].innerHTML !== HOME
  ) {
	  
    // location is not grass, mark it visited
    //visitedLocations.push({row: curRow, col: curCol});
    visitedLocations.add(JSON.stringify({ row: curRow, col: curCol }));
    return false;
  }

  //if (path.some(pair => pair.row === curRow && pair.col === curRow))
  if (path.has(JSON.stringify({ row: curRow, col: curCol })))
	  return false;

  //path.push({row: curRow, col: curCol});
  path.add(JSON.stringify({ row: curRow, col: curCol }));

  wentLeft = false;
  wentUp = false;
  wentRight = false;
  wentDown = false;

  // prefer uncut grass first, this will need some more fine-tuning before it is ready
  /*if (curRow - 1 >= 0 && grid.rows[curRow - 1].cells[curCol].innerHTML === GRASS) {
		
		pathFound = findPathRecurse(path, curRow - 1, curCol, nextRow, nextCol, pathFound);
		wentUp = true;
	}

	if (curCol - 1 >= 0 && grid.rows[curRow].cells[curCol - 1].innerHTML === GRASS) {
		
		pathFound = findPathRecurse(path, curRow, curCol - 1, nextRow, nextCol, pathFound);
		wentLeft = true;
	}

	if (curCol + 1 < columns && grid.rows[curRow].cells[curCol + 1].innerHTML === GRASS) {
		
		pathFound = findPathRecurse(path, curRow, curCol + 1, nextRow, nextCol, pathFound);
		wentRight = true;
	}

	if (curRow + 1 < rows && grid.rows[curRow + 1].cells[curCol].innerHTML === GRASS) {
		
		pathFound = findPathRecurse(path, curRow + 1, curCol, nextRow, nextCol, pathFound);
		wentDown = true;
	}*/

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
	  
    //path.pop();
    path.delete(JSON.stringify({ row: curRow, col: curCol }));
    return false;

    //var index = path.findIndex(pair => pair.row === curRow && pair.col === curRow);
    //path.splice(index, 1);
  }

  return true;
}

function pause(){
	
  paused = true;
  document.getElementById("pauseButton").className = "hidden";
  document.getElementById("resumeButton").className = "button-lawn";
}

function resume(){
	
  paused = false;
  document.getElementById("resumeButton").className = "hidden";
  document.getElementById("pauseButton").className = "button-lawn";
  mowToNextTile(pausedRow, pausedCol, pausedNextRow, pausedNextCol);
}

function restart(){

  finished = false;
  document.getElementById("restartButton").className = "hidden";
  document.getElementById("startButton").className = "button-lawn";
  makeGrid()
}
