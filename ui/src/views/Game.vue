<template>
  <b-container fluid class="game-wrapper">
    
    <!-- Top Row for Game Board, Info, and Actions -->
    <b-row>
      <!-- Tile Bag and Turn History (Left Column) -->
      <b-col cols="12" md="3">
        <div class="tile-bag info-section mb-3">
          <div v-for="(amount, letter) in tileBag" :key="letter">
            {{ letter }}: {{ amount }}
          </div>
        </div>
        <div class="turn-history info-section">
          <div v-for="turn in turnHistory" :key="turn.player + '-' + turn.turn">
            Player {{ turn.player }}, Turn {{ turn.turn }}: {{ turn.word }} ({{ turn.score }})
          </div>
        </div>
      </b-col>

      <!-- Game Board (Center Column) -->
      <b-col cols="12" md="6" class="game-board-container mb-3">
        <div class="game-board">
          <div v-for="(row, rowIndex) in board" :key="'row-' + rowIndex" class="board-row">
            <div v-for="(tile, colIndex) in row" :key="'tile-' + rowIndex + '-' + colIndex" class="board-tile"
              :class="{ 'placed-tile': tile.isPlaced, [tile.type]: true }"
              @click="placeOrPickupTile(rowIndex, colIndex)">
              <span v-if="tile.letter" class="tile-letter">{{ tile.letter }}</span>
              <span v-if="!tile.letter && tile.type !== 'normal'" class="tile-score">{{ tile.type }}</span>
            </div>
          </div>
        </div>
      </b-col>

      <!-- Player Scores and Action Buttons (Right Column) -->
      <b-col cols="12" md="3">
        <div class="player-scores info-section mb-3">
          <div v-for="(score, player) in playerScores" :key="player">
            Player {{ player }}: Score - {{ score }}
          </div>
        </div>
        <div class="action-buttons">
          <b-button variant="danger" @click="resign" class="mb-2">Resign</b-button>
          <b-button variant="secondary" @click="skipTurn" class="mb-2">Skip</b-button>
          <b-button variant="secondary" @click="swapTiles" class="mb-2">Swap</b-button>
          <b-button variant="primary" @click="submitWord" class="mb-2">Submit</b-button>
        </div>
      </b-col>
    </b-row>
    
    <!-- Bottom Row for Tile Rack -->
    <b-row>
      <b-col cols="12" class="tile-rack-container">
        <div class="tile-rack">
          <b-button variant="info" @click="shuffleTiles" class="mr-2">Shuffle</b-button>
          <div v-for="(tile, index) in myTiles" :key="index" class="rack-tile"
            :class="{ selected: selectedTile === tile }" 
            @click="selectTileFromRack(tile, index)">
            {{ tile.letter }}
          </div>
          <b-button variant="warning" @click="resetPlayedTiles">Reset Turn</b-button>
        </div>
      </b-col>
    </b-row>

  </b-container>
</template>


<script setup lang="ts">
import { ref } from 'vue'

// Types for board tiles and tiles in hand
type BoardTile = {
  letter: string | null,
  type: string,
  isPlaced: boolean // Add a new property to track if the tile has been placed
}

type RackTile = {
  letter: string
}

// Initialize the tiles in your hand
const myTiles = ref<RackTile[]>([
  { letter: 'A' },
  { letter: 'B' },
  { letter: 'C' },
  { letter: 'D' },
  { letter: 'E' },
  { letter: 'F' },
  { letter: 'G' },
  { letter: 'H' },
]);

const boardMap = [
  ['TWS', '    ', '    ', 'DLS', '    ', '    ', '    ', 'TWS', '    ', '    ', '    ', 'DLS', '    ', '    ', 'TWS'],
  ['    ', 'DWS', '    ', '    ', '    ', 'TLS', '    ', '    ', '    ', 'TLS', '    ', '    ', '    ', 'DWS', '    '],
  ['    ', '    ', 'DWS', '    ', '    ', '    ', 'DLS', '    ', 'DLS', '    ', '    ', '    ', 'DWS', '    ', '    '],
  ['DLS', '    ', '    ', 'DWS', '    ', '    ', '    ', 'DLS', '    ', '    ', '    ', 'DWS', '    ', '    ', 'DLS'],
  ['    ', '    ', '    ', '    ', 'DWS', '    ', '    ', '    ', '    ', '    ', 'DWS', '    ', '    ', '    ', '    '],
  ['    ', 'TLS', '    ', '    ', '    ', 'TLS', '    ', '    ', '    ', 'TLS', '    ', '    ', '    ', 'TLS', '    '],
  ['    ', '    ', 'DLS', '    ', '    ', '    ', 'DLS', '    ', 'DLS', '    ', '    ', '    ', 'DLS', '    ', '    '],
  ['TWS', '    ', '    ', 'DLS', '    ', '    ', '    ', 'DWS', '    ', '    ', '    ', 'DLS', '    ', '    ', 'TWS'],
  ['    ', '    ', 'DLS', '    ', '    ', '    ', 'DLS', '    ', 'DLS', '    ', '    ', '    ', 'DLS', '    ', '    '],
  ['    ', 'TLS', '    ', '    ', '    ', 'TLS', '    ', '    ', '    ', 'TLS', '    ', '    ', '    ', 'TLS', '    '],
  ['    ', '    ', '    ', '    ', 'DWS', '    ', '    ', '    ', '    ', '    ', 'DWS', '    ', '    ', '    ', '    '],
  ['DLS', '    ', '    ', 'DWS', '    ', '    ', '    ', 'DLS', '    ', '    ', '    ', 'DWS', '    ', '    ', 'DLS'],
  ['    ', '    ', 'DWS', '    ', '    ', '    ', 'DLS', '    ', 'DLS', '    ', '    ', '    ', 'DWS', '    ', '    '],
  ['    ', 'DWS', '    ', '    ', '    ', 'TLS', '    ', '    ', '    ', 'TLS', '    ', '    ', '    ', 'DWS', '    '],
  ['TWS', '    ', '    ', 'DLS', '    ', '    ', '    ', 'TWS', '    ', '    ', '    ', 'DLS', '    ', '    ', 'TWS'],
];

// We use the map created above to initialize the board
const board = ref<BoardTile[][]>(boardMap.map(row => row.map(type => ({
  letter: null,
  type: type.trim() || 'normal',
  isPlaced: false // Initialize with false
}))));

// Example structure for the tile bag
const tileBag = ref({
  'A': 9, 'B': 2, 'C': 2, 'D': 4, 'E': 12, // etc.
  // ...
});

const turnHistory = ref([
  { player: 1, turn: 1, word: 'example', score: 15 },
  // ...
]);

const playerScores = ref({
  1: 0,
  2: 0,
  // Add more players if needed
});


const selectedTile = ref<RackTile | null>(null);
const selectedIndex = ref<number | null>(null);
const playedTiles = ref([]);


function selectTileFromRack(tile: RackTile, index: number) {
  if (selectedTile.value === tile) {
    selectedTile.value = null; // Deselect if the same tile is clicked again
    selectedIndex.value = null;
  } else {
    selectedTile.value = tile;
    selectedIndex.value = index;
  }
}

function placeOrPickupTile(rowIndex: number, colIndex: number) {
  const boardTile = board.value[rowIndex][colIndex];

  if (selectedTile.value && !boardTile.letter) {
    boardTile.letter = selectedTile.value.letter;
    boardTile.isPlaced = true; // Set to true when placed
    myTiles.value.splice(selectedIndex.value, 1);
    playedTiles.value.push({ rowIndex, colIndex, letter: boardTile.letter });
    selectedTile.value = null;
    selectedIndex.value = null;
  } else if (!selectedTile.value && boardTile.letter && boardTile.isPlaced) {
    myTiles.value.push({ letter: boardTile.letter });
    boardTile.letter = null;
    boardTile.isPlaced = false; // Reset when picked up
    playedTiles.value.splice(playedTiles.value.findIndex(pt => pt.rowIndex === rowIndex && pt.colIndex === colIndex), 1);
  }
}

function shuffleTiles() {
  for (let i = myTiles.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [myTiles.value[i], myTiles.value[j]] = [myTiles.value[j], myTiles.value[i]];
  }
}

function resetPlayedTiles() {
  playedTiles.value.forEach(({ rowIndex, colIndex, letter }) => {
    const tile = board.value[rowIndex][colIndex];
    // Put the tile back in the rack
    myTiles.value.push({ letter });
    // Clear the tile from the board
    tile.letter = null;
    tile.isPlaced = false; // Ensure isPlaced is reset
    // Ensure the tile type reverts to its original color coding
    tile.type = boardMap[rowIndex][colIndex].trim() || 'normal';
  });
  playedTiles.value = []; // Clear the played tiles
}

function resign() {
  console.log('Player resigned');
  // Implement the logic for when a player resigns
}

function skipTurn() {
  console.log('Player skipped turn');
  // Implement the logic for when a player skips their turn
}

function swapTiles() {
  console.log('Player wants to swap tiles');
  // Implement the logic for swapping tiles
}

function submitWord() {
  console.log('Player submitted a word');
  // Implement the logic for word submission
}

</script>

<style scoped>
.game-wrapper {
  /* height: 100vh;  */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.game-board-container {
  display: flex;
  justify-content: center;
  align-items: center;
  /* height: 90vh;
  width: 100vw; */
  background-color: #e0e0e0;
  /* Light grey background for the entire game board area */
  max-width: 100vw;
  /* Ensures the container does not exceed the width of the viewport */
  margin: 0 auto;
  /* Centers the container */
  position: relative;
  /* Context for absolute positioning of children */

}

.game-container {
  flex-grow: 1;
  width: 95%;
  max-width: 1200px;
  /* Max width can be adjusted */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.game-board-container {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-board {
  max-width: 100%;
  display: grid;
  /* grid-template-columns: repeat(15, auto); Based on 15 tiles per row */
}

.info-section {
  margin-bottom: 1rem; /* Spacing between info sections */
}

.info-sections {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.board-row {
  display: flex;
  flex-wrap: wrap;
  /* Allow tiles to wrap onto the next line */
}

.board-tile {
  width: 2.5vw;
  /* Use viewport width to size tiles */
  height: 2.5vw;
  /* Keep the tiles square */
  border: 1px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  cursor: pointer;
  background-color: #fff;
  /* White background for empty tiles */
  box-shadow: inset 0 0 5px #bbb;
  /* Subtle inner shadow for an engraved look */

}



.tile-rack-container {
  padding: 10px;
  background-color: #eee;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);

}

.tile-rack {
  display: flex; /* Aligns tiles horizontally */
  justify-content: start; /* Aligns tiles to the start */
  flex-wrap: nowrap; /* Prevents wrapping, you can change to wrap if needed */
  overflow-x: auto; /* Adds horizontal scroll if tiles overflow */
}

@media (max-width: 768px) {
  .game-board {
    grid-template-columns: repeat(15, 1fr);
    /* Full-width tiles on mobile */
  }

  .board-tile {
    width: 5vw;
    /* Increase tile size on smaller screens */
    height: 5vw;
  }

  .info-sections {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons {
    grid-template-columns: 1fr;
    /* Stack buttons on mobile */
  }

  .tile-rack-container {
    padding-bottom: 60px;
    /* Ensure visible above mobile browsers' UI */
  }
}

.rack-tile {
  width: 50px;
  height: 50px;
  margin: 10px;
  border: 1px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  cursor: pointer;
  background-color: #fff;
  margin-right: 10px;
}

/* Highlight the selected tile */
.rack-tile.selected {
  border: 2px solid blue;
}


.shuffle-button {
  padding: 10px;
  margin-right: 10px;
  cursor: pointer;
}

.placed-tile {
  background-color: peachpuff;
  /* Lighter color for placed tiles, still different from the board */
  box-shadow: inset 0 0 5px #bbb, 0 0 10px #666;
  /* Embossed effect with outer shadow for visibility */
}

.tile-letter {
  font-weight: bold;
  color: #333;
  /* Dark color for the letter for better visibility */
}

.player-scores {
  /* width: 28%;
  height: 30%;
  position: absolute;
  top: 80px;
  right: 10px; */
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 20px;
}

.turn-history {
  /* position: absolute;
  top: 300px;
  left: 10px; */
  /* width: auto;
  height: 30%; */
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 20px;
}

.tile-bag {
  /* width: 28%;
  height: 30%; */
  /* position: absolute;
  top: 80px;
  left: 10px; */
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 20px;
}

.shuffle-button,
.reset-button {
  padding: 10px;
  margin: 0 10px;
  cursor: pointer;
}

.action-button {
  padding: 10px;
  font-size: 1rem;
  cursor: pointer;
  /* Add more styling as desired */
  /* Consider adding width/height to make buttons of equal size */
  width: auto; /* Makes buttons expand to fill the cell */
  /* Add equal height or min-height to ensure square buttons if desired */
}

.button-row {
  display: contents;
  /* Makes .button-row act as a wrapper without affecting the grid */
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, auto); /* Creates a 2-column grid */
  gap: 5px; /* Adjust space between buttons */
  /* Add padding/margin as needed */
}


/* Styles for special tiles */
.DWS {
  background-color: #f4cccc;
}

/* Light red for Double Word Score */
.TWS {
  background-color: #ea9999;
}

/* Darker red for Triple Word Score */
.DLS {
  background-color: #cfe2f3;
}

/* Light blue for Double Letter Score */
.TLS {
  background-color: #9fc5e8;
}

/* Darker blue for Triple Letter Score */
</style>
