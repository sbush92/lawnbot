//Global Values
var cellArray = [];

var lawnSave = {
  "lawn": {
    "rows": 0,
    "colums": 0,
    "tiles": [
    ]
}
};

// This is an object to hold the html tags for the images.
var lawnHTML = {
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
  home: {
    id: "home",
    img: "<img src='assets/img/lawnbot-home.png'></img>"
  },
  away: {
    id: "away",
    img: "<img src='assets/img/home.png'></img>"
  }
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
  lawnSave.lawn.rows = parseInt(rows);
  lawnSave.lawn.colums = parseInt(cells);
  cellsPerRow = cells;
  board = document.getElementById("grid");
  gameTable = document.createElement("TABLE");
  gameTable.setAttribute("id", "lanwGrid");
  board.appendChild(gameTable);
  var rowArray = [];
  var first = true;
  var cellCount = 0;
  for (var i = 0; i < rows; i++) {
    rowArray.push(i);
    rowArray[i] = gameTable.insertRow(i);
    for (var j = 0; j < cells; j++) {
      cellArray.push(cellCount);
      cellArray[cellCount] = rowArray[i].insertCell(j);
      if (first == true) {
        cellArray[cellCount].innerHTML = lawnHTML.home.img;
        first = false;
      } else {
        cellArray[cellCount].innerHTML = lawnHTML.grass.img;
      }

      cellCount++;
    }
  }
  setClickEvents();
  first = true;
}

function loadLawn() {
  var lawnStorage = localStorage.getItem("lawn");
  if (lawnStorage != null) {
    var lawnObject = JSON.parse(lawnStorage);
    document.getElementById("rows").value = lawnObject.lawn.rows;
    document.getElementById("cells").value = lawnObject.lawn.colums;
    makeGrid();
    console.log(lawnObject);
    lawnObject.lawn.tiles.forEach(tile => {
      console.log(tile);
      setTile(gameTable.rows[tile.row].cells[tile.colum], tile.name);
    });
  }
  //Implement after testing
  //localStorage.clear();
}

function setobstacles() {}

// A clock in case we want it for something, counts down from whatever we set it to in one second intervals
// takes no parameters
// Returns nothing
function startClock() {
  setInterval(function() {
    countDown();
  }, 1000);
}

// function shows time left not complete but I threw it in when we implement it in the future
// no parameters
function showBatteryLeft() {
  setInterval(function() {
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
    table[i].onclick = function() {
      col = this.cellIndex;
      row = this.parentNode.rowIndex;
      console.log("Cell Index is " + this.cellIndex);
      console.log("Row Index is " + this.parentNode.rowIndex);
      changeTiles(gameTable.rows[row].cells[col]);
    };
  }
}

function setTile(tile, name) {
  switch (name) {
    case "rock":
      tile.innerHTML = lawnHTML.rock.img;
      break;
    case "tree":
      tile.innerHTML = lawnHTML.tree.img;
      break;
    case "dirt":
      tile.innerHTML = lawnHTML.dirt.img;
      break;
  }
}

// Cycles through available tyles
// Takes existing table node as parameter
// Returns nothing
function changeTiles(tile) {
  switch (tile.innerHTML) {
    case '<img src="assets/img/grass.png">':
      gameTable.rows[row].cells[col].innerHTML = lawnHTML.cutGrass.img;
      break;
    case '<img src="assets/img/cut-grass.png">':
      gameTable.rows[row].cells[col].innerHTML = lawnHTML.tree.img;
      pushToLawnObject(lawnHTML.tree.id, row, col);
      break;
    case '<img src="assets/img/tree.png">':
      gameTable.rows[row].cells[col].innerHTML = lawnHTML.rock.img;
      pushToLawnObject(lawnHTML.rock.id, row, col);
      break;
    case '<img src="assets/img/rock.png">':
      gameTable.rows[row].cells[col].innerHTML = lawnHTML.dirt.img;
      pushToLawnObject(lawnHTML.dirt.id, row, col);
      break;
    case '<img src="assets/img/dirt.png">':
      gameTable.rows[row].cells[col].innerHTML = lawnHTML.grass.img;
      break;
  }
}

function pushToLawnObject(item, row, colum) {
  var exists = false;
  lawnSave.lawn.tiles.forEach(tile => {
    if (tile.row === row && tile.colum === colum) {
      tile.name = item;
      exists = true;
    } 
  });
  if (exists == false) lawnSave.lawn.tiles.push({ name: item, row: row, colum: colum });
  exists = false;
}

function save(){
  var json = JSON.stringify(lawnSave);
  try {
    var blob = new Blob([json],{type:"utf-8"});
    saveAs(blob, "lawn.json");
} catch (e) {
    window.open("data:"+m+"," + encodeURIComponent(t), '_blank','');
}
}


