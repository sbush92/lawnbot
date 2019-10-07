const CUT_GRASS = '<img src="cut-grass.png">';
const GRASS = '<img src="grass.png">';
const ROBOT = '<img src=\"robot.png\">';

var visitedLocations;

function mowLawn() {

	//visitedLocations = [{row: 0, col: 0}];
	visitedLocations = new Set();
	visitedLocations.add(JSON.stringify({row:0,col:0}));
	
	//any changes needed here?
	grid = document.getElementById("lanwGrid");
	rows = document.getElementById("rows").value;
	columns = document.getElementById("cells").value;

	//var path = [];
	var path = new Set();
	
	var curRow = 0;
	var curCol = 0;
	
	var nextRow = 0;
	var nextCol = 1;
	
	var lawnMowed = false;

	var prevLocation;
	
	while (!lawnMowed) {
					
		if (nextCol >= columns) {
			
			nextCol = 0;
			nextRow++;
		}
		
		if (nextRow >= rows) {
			
			lawnMowed = true;
			continue;
		}

		//if (!visitedLocations.some(pair => pair.row == nextRow && pair.col == nextCol)) {
		if (!visitedLocations.has(JSON.stringify({row:nextRow,col:nextCol}))) {
			
			path.clear();
			findPathRecurse(path, curRow, curCol, nextRow, nextCol, false);
			
			prevLocation = null; 

			path.forEach(
				locationString =>
				{
					// prev should never be anything but robot
					if (prevLocation && (grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === ROBOT || grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML === GRASS))
						grid.rows[prevLocation.row].cells[prevLocation.col].innerHTML = lawn.cutGrass.img;

					var location = JSON.parse(locationString);
					if (grid.rows[location.row].cells[location.col].innerHTML === GRASS || grid.rows[location.row].cells[location.col].innerHTML === CUT_GRASS)
						grid.rows[location.row].cells[location.col].innerHTML = ROBOT; //will need to do something special for the charging station

					//visitedLocations.push(location);
					visitedLocations.add(JSON.stringify(location));

					curRow = location.row;
					curCol = location.col;

					prevLocation = location;

					//would be nice to just be able to pause here, but figure something out to slow the for loop down, maybe you have to copy the set to an array***
				}
			);

			//setInterval(() => moveMower(path), 1000);
		}
		
		nextCol++;
	}
}

function findPathRecurse(path, curRow, curCol, nextRow, nextCol, pathFound) {
	
	var wentLeft;
	var wentUp;
	var wentRight;
	var wentDown;
	
	if (pathFound === true)
		return true;
	
	if (curRow === nextRow && curCol === nextCol) {
		
		//path.push({row: curRow, col: curCol});
		path.add(JSON.stringify({row:curRow,col:curCol}));
		pathFound = true;
		return true;
	}
	
	if (curRow < 0 || curRow >= rows || curCol < 0 || curCol >= columns)
		return false;
	
	if (grid.rows[curRow].cells[curCol].innerHTML !== CUT_GRASS && grid.rows[curRow].cells[curCol].innerHTML !== GRASS && grid.rows[curRow].cells[curCol].innerHTML !== ROBOT) {

		// location is not grass, mark it visited
		//visitedLocations.push({row: curRow, col: curCol});
		visitedLocations.add(JSON.stringify({row:curRow,col:curCol}));
		return false;
	}

	//if (path.some(pair => pair.row === curRow && pair.col === curRow))
	if (path.has(JSON.stringify({row:curRow,col:curCol})))
		return false;
			
	//path.push({row: curRow, col: curCol});
	path.add(JSON.stringify({row:curRow,col:curCol}));
	
	wentLeft = false;
	wentUp = false;
	wentRight = false;
	wentDown = false;
	
	// prefer uncut grass first
	if (curRow - 1 >= 0 && grid.rows[curRow - 1].cells[curCol].innerHTML === GRASS) {
		
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
	}
	
	if (!wentUp && curRow > nextRow) {
		
		pathFound = findPathRecurse(path, curRow - 1, curCol, nextRow, nextCol, pathFound);
		wentLeft = true;
	}
	
	if (!wentLeft && curCol > nextCol) {
		
		pathFound = findPathRecurse(path, curRow, curCol - 1, nextRow, nextCol, pathFound);
		wentUp = true;
	}

	if (!wentRight && curCol < nextCol) {
		
		pathFound = findPathRecurse(path, curRow, curCol + 1, nextRow, nextCol, pathFound);
		wentDown = true;
	}
	
	if (!wentDown && curRow < nextRow) {
		
		pathFound = findPathRecurse(path, curRow + 1, curCol, nextRow, nextCol, pathFound);
		wentRight = true;
	}
		
	if (!wentUp)
		pathFound = findPathRecurse(path, curRow - 1, curCol, nextRow, nextCol, pathFound);
	
	if (!wentLeft)
		pathFound = findPathRecurse(path, curRow, curCol - 1, nextRow, nextCol, pathFound);

	if (!wentRight)
		pathFound = findPathRecurse(path, curRow, curCol + 1, nextRow, nextCol, pathFound);
	
	if (!wentDown)
		pathFound = findPathRecurse(path, curRow + 1, curCol, nextRow, nextCol, pathFound);
			
	if (!pathFound) {

		//path.pop();
		path.delete(JSON.stringify({row:curRow,col:curCol}));
		return false;

		//var index = path.findIndex(pair => pair.row === curRow && pair.col === curRow);
		//path.splice(index, 1);
	}

	return true;
}