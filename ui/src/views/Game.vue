<template>
  <div class="game-board-container">
    <div class="game-board">
      <div v-for="(row, rowIndex) in board" :key="'row-' + rowIndex" class="board-row">
        <div
          v-for="(tile, colIndex) in row"
          :key="'tile-' + rowIndex + '-' + colIndex"
          class="board-tile"
          :class="tile.type"
          @click="placeTile(rowIndex, colIndex)"
        >
          {{ tile.letter }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Tile = {
  letter: string | null,
  type: string
}
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
const board = ref(boardMap.map(row => row.map(type => {
  return { letter: null, type: type.trim() || 'normal' };
})));

function placeTile(rowIndex: number, colIndex: number) {
  const tile = board.value[rowIndex][colIndex];
  if (tile.letter === null) {
    tile.letter = 'A'; // Placeholder letter, this would be dynamic in a real game
  }
}
</script>

<style scoped>
.game-board-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}

.game-board {
  display: flex;
  flex-direction: column;
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
  font-size: 20px;
  cursor: pointer;
}

/* Styles for special tiles */
.DWS { background-color: #f4cccc; } /* Light red for Double Word Score */
.TWS { background-color: #ea9999; } /* Darker red for Triple Word Score */
.DLS { background-color: #cfe2f3; } /* Light blue for Double Letter Score */
.TLS { background-color: #9fc5e8; } /* Darker blue for Triple Letter Score */
</style>
