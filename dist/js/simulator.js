var lawnState = {
  "width": 0,
  "height": 0,
  "tiles": []
};

function startSimulation() {
  var startTime = new Date();
  updateTime(startTime.getTime());

  // Start the algorithm

}

function updateTime(time) {
  var timeSpan = document.getElementById('time');
  timeSpan.innerHTML = time;
}

function makeGrid() {
  var oldLawn = document.getElementById('lawnGrid');
  if (oldLawn != undefined) {
    // Previous lawn exists, clear it out
    oldLawn.remove();
  }

  // var width = document.getElementById('width').value;
  var width = document.getElementById('height').value;
  var height = document.getElementById('height').value;

  // Store the lawn state
  lawnState.width = parseInt(width);
  lawnState.height = parseInt(height);

  // Get the object representing the lawn area
  lawn = document.getElementById('lawn');

  // Create a new object to store the lawn grid on
  lawnGrid = document.createElement('div');
  lawnGrid.setAttribute('id', 'lawnGrid');

  lawn.appendChild(lawnGrid);

  var colArray = [];
  var rowArray = [];

  for (var row = 0; row < height; row++) {
    rowArray.push(row);

    var rowChild = document.createElement('div');
    rowChild.setAttribute('class', 'row');

    // Add the row to the lawn grid
    lawnGrid.appendChild(rowChild);

    // Keep track of the row in the row array
    rowArray[row] = rowChild;

    var colCount = 0;
    var first = true; // Represents whether we are on the first tile or not

    for (var col = 0; col < width; col++) {
      colArray.push(colCount);

      // Create column element
      var lawnCell = document.createElement('div');
      lawnCell.setAttribute('class', 'col');

      // Add the column element to the row
      colArray[colCount] = rowArray[row].appendChild(lawnCell);

      if (first == true) {
        // First time, add a default tile image
        // colArray[colCount].innerHTML = lawnTiles.home.img;
        colArray[colCount].style.backgroundImage = lawnTiles.home.bg;
        first = false;
      } else {
        // colArray[colCount].innerHTML = lawnTiles.grass.img
        colArray[colCount].style.backgroundImage=lawnTiles.grass.bg;
      }

      colCount++;
    }
  }
  setClickEvents();
  first = true;
}

function setClickEvents() {

}

// This is an object to hold the html tags for the images.
var lawnTiles = {
  grass: {
    id: "grass",
    img: "<img src='assets/img/grass.png'></img>",
    bg: "url('assets/img/grass.png')"
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
    img: "<img src='assets/img/lawnbot-home.png'></img>",
    bg: "url('assets/img/lawnbot-home.png')"
  },
  away: {
    id: "away",
    img: "<img src='assets/img/home.png'></img>"
  }
};