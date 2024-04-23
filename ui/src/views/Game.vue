<template>
  
</template>


<script setup lang="ts">
// import { ref, watch } from 'vue';
// import { useRoute } from 'vue-router';
// import { useQuery, useMutation } from '@vue/apollo-composable';
// import gql from 'graphql-tag';
// import { inject } from 'vue';

// // const user = inject('user');

// const route = useRoute();
// const gameId = route.params.gameId;

// // GraphQL queries and mutations
// const GET_GAME_STATE = gql`
//   query GetGameState($gameId: ID!) {
//     gameState(gameId: $gameId) {
//       board
//       players {
//         name
//         hand
//         score
//       }
//       currentPlayerIndex
//       deck
//     }
//   }
// `;

// const PERFORM_ACTION = gql`
//   mutation PerformAction($gameId: ID!, $action: Action!) {
//     doAction(gameId: $gameId, action: $action) {
//       board
//       players {
//         score
//       }
//     }
//   }
// `;

// // Reactive state
// const gameState = useQuery(GET_GAME_STATE, { gameId });
// const { mutate: performAction } = useMutation(PERFORM_ACTION);
// const board = ref([]);
// const myTiles = ref([]);
// const playerScores = ref({});
// const turnHistory = ref([]);
// const selectedTile = ref(null);
// const playedTiles = ref([]);

// // // Update local state based on the game state
// // watch(gameState.result, (newState) => {
// //   if (newState && newState.gameState) {
// //     board.value = newState.gameState.board.map(row => row.map(tile => ({
// //       letter: tile,
// //       isPlaced: false,
// //       type: 'normal' // Adjust according to actual data
// //     })));
// //     console.log("Board value:", board.value)
// //     myTiles.value = newState.gameState.players.find(p => p.name === user.value.preferred_username).hand; // Adapt as needed
// //     console.log("My tiles:", myTiles.value)
// //     playerScores.value = newState.gameState.players.reduce((acc, player) => {
// //       acc[player.name] = player.score;
// //       return acc;
// //     }, {});
// //     console.log("Player scores:", playerScores.value)
// //   }
// // }, { deep: true });

// // // Functions for tile interaction
// // function selectTileFromRack(tile, index) {
// //   if (selectedTile.value && selectedTile.value === tile) {
// //     selectedTile.value = null;
// //   } else {
// //     selectedTile.value = tile;
// //   }
// // }

// // function placeOrPickupTile(rowIndex, colIndex) {
// //   const tile = board.value[rowIndex][colIndex];
// //   if (selectedTile.value && !tile.letter) {
// //     // Place tile from rack to board
// //     tile.letter = selectedTile.value.letter;
// //     tile.isPlaced = true;
// //     myTiles.value.splice(myTiles.value.indexOf(selectedTile.value), 1);
// //     playedTiles.value.push({ tile, rowIndex, colIndex });
// //     selectedTile.value = null;
// //   } else if (tile.isPlaced) {
// //     // Pick up tile from board to rack
// //     myTiles.value.push({ letter: tile.letter });
// //     tile.letter = null;
// //     tile.isPlaced = false;
// //     playedTiles.value = playedTiles.value.filter(pt => pt.rowIndex !== rowIndex || pt.colIndex !== colIndex);
// //   }
// // }

// // function resetPlayedTiles() {
// //   playedTiles.value.forEach(pt => {
// //     const tile = board.value[pt.rowIndex][pt.colIndex];
// //     myTiles.value.push({ letter: tile.letter });
// //     tile.letter = null;
// //     tile.isPlaced = false;
// //   });
// //   playedTiles.value = [];
// // }

// // Other functions as before
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
  background-color: #e0e0e0;
  max-width: 100vw;
  margin: 0 auto;
  position: relative;
}

.game-container {
  flex-grow: 1;
  width: 95%;
  max-width: 1200px;
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
}

.info-section {
  margin-bottom: 1rem; 
}

.info-sections {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.board-row {
  display: flex;
  flex-wrap: wrap;
}

.board-tile {
  width: 2.5vw;
  height: 2.5vw;
  border: 1px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  cursor: pointer;
  background-color: #fff;
  box-shadow: inset 0 0 5px #bbb;
}



.tile-rack-container {
  padding: 10px;
  background-color: #eee;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);

}

.tile-rack {
  display: flex;
  justify-content: center; 
  flex-wrap: nowrap;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .game-board {
    grid-template-columns: repeat(15, 1fr);
  }

  .board-tile {
    width: 5vw;
    height: 5vw;
  }

  .info-sections {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .tile-rack-container {
    padding-bottom: 60px;
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

.rack-tile.selected {
  border: 2px solid blue;
}


.shuffle-button {
  padding: 10px;
  margin-right: 10px;
  cursor: pointer;
}

.tile-letter {
  font-weight: bold;
  color: #333;
}

.player-scores {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 20px;
}

.turn-history {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 20px;
}

.tile-bag {
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
  width: auto; 
}

.button-row {
  display: contents;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, auto); 
  gap: 5px;
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

.STAR {
  background-color: #9fc5e8;
  color: #fff;
}

.placed-tile {
  background-color: peachpuff;
  box-shadow: inset 0 0 5px #bbb, 0 0 10px #666;
}
/* Darker blue for Triple Letter Score */
</style>
