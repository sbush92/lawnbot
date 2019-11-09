var lawnStateDefault = {
  "cols": 0,
  "rows": 0,
  "tiles": []
}

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

var timeSeconds = 0;

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

function updateTime() {
  timeSeconds++;
  // var hours = 0;
  var minutes = Math.floor(timeSeconds / 60);
  var seconds = timeSeconds % 60;
  var timeSpan = document.getElementById('time');
  timeSpan.innerHTML = `00:${minutes.pad(2)}:${seconds.pad(2)}`;
}

function updateProgress(progress, total) {
  var progressSpan = document.getElementById('progress');
  progressSpan.innerHTML = `${Math.floor((progress / total) * 100)}%`;
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

  if (cols == 0 || rows == 0) {
    // Can't make a grid from nothing; disable start/stop button
    document.getElementsByClassName('button-start')[0].disabled = true;
    document.getElementsByClassName('button-stop')[0].disabled = true;
  } else {
    // Enable the start button, but disable the stop button
    document.getElementsByClassName('button-start')[0].disabled = false;
    document.getElementsByClassName('button-stop')[0].disabled = true;
  }

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
        changeTiles(this, row, col);   
        var testTile = document.getElementsByClassName('row')[row];
        var another = testTile.getElementsByClassName('col')[col];

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
    const reader = new FileReader()
    reader.onload = function (){
      localStorage.setItem('lawn', reader.result);
      loadLawn();
    }
    reader.readAsText(selectedFile.files[0]);
  }, false)
}

function resetLawn() {
  document.getElementById('cols').value = 10;
  document.getElementById('rows').value = 10;
  lawnState = Object.create(lawnStateDefault);
  localStorage.removeItem('lawn');
  makeGrid();
}

function stop(){
  console.log('Stop');
  paused = true;

  // Change stop button to resume and change what it does when clicked
  var resumeButton = document.getElementsByClassName('button-stop')[0]
  resumeButton.className = 'button-resume';
  resumeButton.setAttribute('onclick', 'resume()');
  resumeButton.innerHTML = 'Resume Simulation';
  window.clearInterval(timer);
  // document.getElementById("resumeButton").className = "button-lawn";
}

function resume() {
  console.log('Resume');
  paused = false;

  // Change the resume button back to stop and make it do what it used to when clicked
  var stopButton = document.getElementsByClassName('button-resume')[0]
  stopButton.className = 'button-stop';
  stopButton.setAttribute('onclick', 'stop()');
  stopButton.innerHTML = 'Stop Simulation';

  mowToNextTile(pausedRow, pausedCol, pausedNextRow, pausedNextCol);

  timer = window.setInterval(function() {
    updateTime();
  }, 1000)
  // document.getElementById("resumeButton").className = "button-lawn";
}

function restart() {

}

function resetButtons() {
  document.getElementsByClassName('button-start')[0].disabled = false;
  document.getElementsByClassName('button-stop')[0].disabled = true;
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
