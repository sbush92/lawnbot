//Global Values
var cellArray = [];

// This is an object to hold the html tags for the images.
var lawn = {
  grass: {
    id: "grass",
    img: "<img src='assets/img/grass.png'></img>"
  },
  dirt: {
    id: "dirt",
    img: "<img src='assets/img/dirt.png'></img>"
  },
  cutGrass: {
    id: "cutGrass",
    img: "<img src='assets/img/cut-grass.png'></img>"
  },
  rock: {
    id: "rock",
    img: "<img src='assets/img/rock.png'></img>"
  },
  tree: {
    id: "tree",
    img: "<img src='assets/img/tree.png'></img>"
  },
};

// Function create the table that the game will be played on
// Parameters are the number or rows and the number of cells
function makeGrid() {
  var previous = document.getElementById("lanwGrid");
  if (previous != undefined) {
    previous.remove();
  }
  cellArray = [];
  var rows = document.getElementById("rows").value;
  var cells = document.getElementById("cells").value;
  cellsPerRow = cells;
  board = document.getElementById("grid");
  gameTable = document.createElement("TABLE");
  gameTable.setAttribute("id", "lanwGrid");
  board.appendChild(gameTable);
  var rowArray = [];

  var cellCount = 0;
  for (var i = 0; i < rows; i++) {
    rowArray.push(i);
    rowArray[i] = gameTable.insertRow(i);
    for (var j = 0; j < cells; j++) {
      cellArray.push(cellCount);
      cellArray[cellCount] = rowArray[i].insertCell(j);
      cellArray[cellCount].innerHTML = "<img src='assets/img/grass.png'></img>"
      cellCount++;
    }
  }
  setClickEvents();
}

// A clock in case we want it for something, counts down from whatever we set it to in one second intervals
// takes no parameters
// Returns nothing
function startClock() {
  setInterval(function () {
    countDown();
  }, 1000);
}

// function shows time left not complete but I threw it in when we implement it in the future
// no parameters
function showBatteryLeft() {
  setInterval(function () {
    var time = getBatteryLeft();
    document.getElementById("battery").innerHTML = "Battery Left Is " + battery;
    checkEmpty();
  }, 1000);
}

// converts 2d array postion into 1d array position
// takes 2d array position as parameter
// returns as position
function getPosition(row, col) {
  var position = row * cellsPerRow + col;
  return position;
}


// Fuction that grabs the table and sets event handler for click for each cell
// takes no parameters
// returns nothing
function setClickEvents() {
  var table = document.getElementsByTagName("td");
  for (var i = 0; i < table.length; i++) {
    table[i].onclick = function () {
      col = this.cellIndex;
      row = this.parentNode.rowIndex;
      console.log("Cell Index is " + this.cellIndex);
      console.log("Row Index is " + this.parentNode.rowIndex);
      changeTiles(gameTable.rows[row].cells[col]);

    };
  }
}

// Cycles through available tyles
// Takes existing table node as parameter
// Returns nothing
function changeTiles(tile) {
  switch (tile.innerHTML) {
    case "<img src=\"assets/img/grass.png\">":
      gameTable.rows[row].cells[col].innerHTML = lawn.cutGrass.img;
      break;
    case "<img src=\"assets/img/cut-grass.png\">":
      gameTable.rows[row].cells[col].innerHTML = lawn.tree.img;
      break;
    case "<img src=\"assets/img/tree.png\">":
      gameTable.rows[row].cells[col].innerHTML = lawn.rock.img;
      break;
    case "<img src=\"assets/img/rock.png\">":
      gameTable.rows[row].cells[col].innerHTML = lawn.dirt.img;
      break;
    case "<img src=\"assets/img/dirt.png\">":
      gameTable.rows[row].cells[col].innerHTML = lawn.grass.img;
      break;
  }
}