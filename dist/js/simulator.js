var lawnStateDefault = {
  "cols": 0,
  "rows": 0,
  "tiles": []
}

var lawnState = Object.create(lawnStateDefault);

// Keeps track of the underlying model of the lawn
var backingGrid = [[], []];

function startSimulation() {
  var startTime = new Date();
  updateTime(startTime.getTime());

  updateProgress(25);
  updateBattery(50);

  // Start the algorithm

}

function updateTime(time) {
  var timeSpan = document.getElementById('time');
  timeSpan.innerHTML = time;
}

function updateProgress(progress) {
  var progressSpan = document.getElementById('progress');
  progressSpan.innerHTML = `${progress}%`;
}

function updateBattery(charge) {
  var batterySpan = document.getElementById('battery');
  batterySpan.innerHTML = `${charge}%`;
}

function makeGrid(useBackingGrid=false) {
  var oldLawn = document.getElementById('lawnGrid');
  if (oldLawn != undefined) {
    // Previous lawn exists, clear it out
    oldLawn.remove();
  }

  // var width = document.getElementById('width').value;
  var cols = document.getElementById('cols').value;
  var rows = document.getElementById('rows').value;

  // Store the lawn state
  lawnState.rows = parseInt(rows);
  lawnState.cols = parseInt(cols);

  // Get the object representing the lawn area
  lawn = document.getElementById('lawn');

  // Create a new object to store the lawn grid on
  lawnGrid = document.createElement('div');
  lawnGrid.setAttribute('id', 'lawnGrid');

  lawn.appendChild(lawnGrid);

  for (let row = 0; row < rows; row++) {
    // Tell the array we have a new row
    if (!useBackingGrid)
      backingGrid[row] = [];

    var currentRow = document.createElement('div');
    currentRow.setAttribute('class', 'row');

    // Add the row to the lawn grid
    lawnGrid.appendChild(currentRow);

    for (let col = 0; col < cols; col++) {

      // Create column element
      var lawnCell = document.createElement('div');
      lawnCell.setAttribute('class', 'col cell');
      lawnCell.onclick = function() {
        console.log(`Clicked Cell: ${col}, ${row + 1}`);   
        changeTiles(this, row, col);   
        console.log(`Attempting to do something here:`);
        var testTile = document.getElementsByClassName('row')[row];
        var another = testTile.getElementsByClassName('col')[col];
        console.log(`Did it work?: ${another.style.backgroundImage}`);

      };

      var currentCol = currentRow.appendChild(lawnCell);

      // Load an image into the cell
      if (useBackingGrid) {
        currentCol.style.backgroundImage = getTileUrl(backingGrid[row][col]);
      } else if (row == 0 && col == 0) {
        currentCol.style.backgroundImage = lawnTiles.home.bg;
        backingGrid[row][col] = {name: lawnTiles.home.id, row: row, col: col};
      } else {
        currentCol.style.backgroundImage=lawnTiles.grass.bg;
        backingGrid[row][col] = {name: lawnTiles.grass.id, row: row, col: col};
      }
    }
    lawnState.tiles = backingGrid.flat();
    console.log(`The current grid: ${JSON.stringify(lawnState)}`);
  }
  
  first = true;
}

// Cycles through available tyles
// Takes existing table node as parameter
// Returns nothing
function changeTiles(tile, row, col) {;
  switch (tile.style.backgroundImage) {
    case lawnTiles.grass.bg:
      tile.style.backgroundImage = lawnTiles.tree.bg;
      backingGrid[row][col].name = lawnTiles.tree.id;      
      break;
    case lawnTiles.cutGrass.bg:
      tile.style.backgroundImage = lawnTiles.grass.bg;
      backingGrid[row][col].name = lawnTiles.grass.id;
      break;
    case lawnTiles.tree.bg:
      tile.style.backgroundImage = lawnTiles.rock.bg;
      backingGrid[row][col].name = lawnTiles.rock.id;
      break;
    case lawnTiles.rock.bg:
      tile.style.backgroundImage = lawnTiles.dirt.bg;
      backingGrid[row][col].name = lawnTiles.dirt.id;
      break;
    case lawnTiles.dirt.bg:
      tile.style.backgroundImage = lawnTiles.cutGrass.bg;
      backingGrid[row][col].name = lawnTiles.cutGrass.id;
      break;
  }
}

function getTileUrl(tile) {
  switch(tile.name) {
    case 'rock': return lawnTiles.rock.bg;
    case 'tree': return lawnTiles.tree.bg;
    case 'dirt': return lawnTiles.tree.bg;
    case 'cutGrass': return lawnTiles.cutGrass.bg;
    case 'grass': return lawnTiles.grass.bg;
    case 'home': return lawnTiles.home.bg;
    case 'away': return lawnTiles.away.bg;
  }
}

function saveLawn() {
  var json = JSON.stringify(lawnState)
  try {
    var blob = new Blob([json], {type:"utf-8"});
    saveAs(blob, "lawn.json");
  } catch(e) {
    window.open(`data:${json},${encodeURIComponent("utf-8")}`, '_blank', '');
  }
}

function loadLawn() {
  var lawnStorage = localStorage.getItem("lawn");
  if (lawnStorage != null) {
    var lawnStateObject = JSON.parse(lawnStorage);
    document.getElementById('cols').value = lawnStateObject.cols;
    document.getElementById('rows').value = lawnStateObject.rows;

    // Reset the backing grid
    backingGrid = [[]];

    lawnStateObject.tiles.forEach( tile => {
      var row = tile.row;
      var col = tile.col;
      if (backingGrid[row] == null) backingGrid[row] = [];
      backingGrid[row][col] = tile;
    })

    makeGrid(true);
  }
}

function loadLawnFile() {
  document.getElementById("file").click();

  $.getJSON("/dist/json/lawn.json", function(json){
  });

}

function fileListener() {
  var selectedFile =  document.getElementById("file");
  selectedFile.addEventListener('change', function() {
    console.log("the thing happened");
    const reader = new FileReader()
    reader.onload = function (){
      localStorage.setItem('lawn', reader.result);
      loadLawn();
    }
    reader.readAsText(selectedFile.files[0]);
  }, false)
}

function clearLawn() {
  document.getElementById('cols').value = 0;
  document.getElementById('rows').value = 0;
  lawnState = Object.create(lawnStateDefault);
  localStorage.removeItem('lawn');
  makeGrid();
}

// This is an object to hold the html tags for the images.
var lawnTiles = {
  grass: {
    id: "grass",
    bg: 'url("assets/img/grass.png")'
  },
  dirt: {
    id: "dirt",
    bg: 'url("assets/img/dirt.png")'
  },
  cutGrass: {
    id: "cutGrass",
    bg: 'url("assets/img/cut-grass.png")'
  },
  rock: {
    id: "rock",
    bg: 'url("assets/img/rock.png")'
  },
  tree: {
    id: "tree",
    bg: 'url("assets/img/tree.png")'
  },
  home: {
    id: "home",
    bg: 'url("assets/img/lawnbot-home.png")'
  },
  away: {
    id: "away",
    bg: 'url("assets/img/home.png")'
  }
};
