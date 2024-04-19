<template>
  <div class="game-container">
    <div class="game-board-container">
      <div class="game-board">
        <div v-for="(row, rowIndex) in board" :key="'row-' + rowIndex" class="board-row">
          <div 
            v-for="(tile, colIndex) in row" 
            :key="'tile-' + rowIndex + '-' + colIndex" 
            class="board-tile"
            :class="{ 'placed-tile': tile.isPlaced, [tile.type]: true }" 
            @click="placeOrPickupTile(rowIndex, colIndex)"
          >
            <span v-if="tile.letter" class="tile-letter">{{ tile.letter }}</span>
            <span v-if="!tile.letter && tile.type !== 'normal'" class="tile-score">{{ tile.type }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="tile-rack-container">
      <div class="tile-rack">
        <button class="shuffle-button" @click="shuffleTiles">Shuffle</button>
        <div 
          class="rack-tile" 
          :class="{ selected: selectedTile === tile }" 
          v-for="(tile, index) in myTiles" 
          :key="index"
          @click="selectTileFromRack(tile, index)"
        >
          {{ tile.letter }}
        </div>
        <button class="reset-button" @click="resetPlayedTiles">Reset Turn</button>
      </div>
    </div>
  </div>
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


</script>

<style scoped>
.game-board-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #e0e0e0; /* Light grey background for the entire game board area */
}

.game-board {
  display: flex;
  flex-direction: column;
  background-color: #dcdcdc; /* Slightly darker grey for the game board to distinguish it from the container */
}

.board-row {
  display: flex;
}

.board-tile {
  width: 40px;
  height: 40px;
  border: 1px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  cursor: pointer;
  background-color: #fff; /* White background for empty tiles */
  box-shadow: inset 0 0 5px #bbb; /* Subtle inner shadow for an engraved look */

}

.tile-rack {
  display: flex;
  justify-content: center;
  padding: 10px;
  background-color: #eee; /* or any color you like */
  position: fixed;
  bottom: 0;
  width: 100%;
}

.rack-tile {
  width: 40px;
  height: 40px;
  margin: 0 5px;
  border: 1px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  cursor: pointer;
  background-color: #fff;
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
  background-color: peachpuff; /* Lighter color for placed tiles, still different from the board */
  box-shadow: inset 0 0 5px #bbb, 0 0 10px #666; /* Embossed effect with outer shadow for visibility */
}

.tile-letter {
  font-weight: bold;
  color: #333; /* Dark color for the letter for better visibility */
}





.shuffle-button,
.reset-button {
  padding: 10px;
  margin: 0 10px;
  cursor: pointer;
}



/* Styles for special tiles */
.DWS { background-color: #f4cccc; } /* Light red for Double Word Score */
.TWS { background-color: #ea9999; } /* Darker red for Triple Word Score */
.DLS { background-color: #cfe2f3; } /* Light blue for Double Letter Score */
.TLS { background-color: #9fc5e8; } /* Darker blue for Triple Letter Score */
</style>
