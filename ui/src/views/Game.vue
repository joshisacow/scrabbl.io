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
      </b-col>

      <!-- Game Board (Center Column) -->
      <b-col cols="12" md="6" class="game-board-container mb-3">
        <div class="game-board">
          <div v-for="(row, rowIndex) in board" :key="'row-' + rowIndex" class="board-row">
            <div v-for="(tile, colIndex) in row" :key="'tile-' + rowIndex + '-' + colIndex" class="board-tile"
              :class="{ 'placed-tile': tile.isPlaced, [tile.type]: true }"
              @click="placeOrPickupTile(rowIndex, colIndex)">
              <span v-if="tile.letter" class="tile-letter">{{ tile.letter }}</span>
              <span v-if="!tile.letter && tile.type !== 'normal' && tile.type !== 'STAR'" class="tile-score">{{ tile.type }}</span>
              <span v-if="tile.type === 'STAR'"><font-awesome-icon :icon="['fas', 'star']" /></span>
            </div>
          </div>
        </div>
      </b-col>

      <!-- Player Scores and Action Buttons (Right Column) -->
      <b-col cols="12" md="3">
  <div class="current-player info-section mb-3">
    <h3>Current Turn: {{ currentPlayerName }}</h3>
  </div>
  <div class="player-scores info-section mb-3">
    Scores:
    <div v-for="(score, player) in playerScores" :key="player">
      {{ player }}: {{ score }}
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
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery, useMutation, useSubscription } from '@vue/apollo-composable';
import gql from 'graphql-tag';
// import { inject } from 'vue';
import { computed } from 'vue';

const currentPlayerName = computed(() => {
  const currentPlayer = gameState.value?.gameStateChanged?.players[gameState.value.gameStateChanged.currentPlayerIndex];
  return currentPlayer ? currentPlayer.name : 'Loading...';
});


export interface User {
  value?: {
    preferred_username?: string;
  }
}


// const user = inject<User>('user', { value: { preferred_username: '' }});


// const router = useRouter();
const route = useRoute();
const gameId = route.params.gameId as string;
const userId = route.params.userId as string;
console.log("gameId: ", gameId)
console.log("userId: ", userId)

type BoardTile = {
  letter: string | null,
  type: string,
  isPlaced: boolean // Add a new property to track if the tile has been placed
}

type RackTile = {
  letter: string
}


// GraphQL queries and mutations
const GET_GAME_STATE = gql`
  query GetGameState($gameId: ID!) {
    gameState(gameId: $gameId) {
      board
      players {
        name
        hand
        score
      }
      currentPlayerIndex
      deck
    }
  }
`;

const GAME_STATE_CHANGED_SUBSCRIPTION = gql`
  subscription GameStateChanged($gameId: ID!) {
    gameStateChanged(gameId: $gameId) {
      board
      players {
        name
        hand
        score
      }
      currentPlayerIndex
      deck
    }
  }
`;

const PERFORM_ACTION = gql`
  mutation PerformAction($gameId: ID!, $action: Action!) {
    doAction(gameId: $gameId, action: $action) {
      board
      players {
        score
      }
    }
  }
`;

// Reactive state
// Use the queries and mutations
// const { result: gameState, loading: gameStateLoading, error: gameStateError } = useQuery(GET_GAME_STATE, { gameId });
const { result: gameState } = useSubscription(GAME_STATE_CHANGED_SUBSCRIPTION, { gameId });
const { mutate: performAction } = useMutation(PERFORM_ACTION);
const { result } = useQuery(GET_GAME_STATE, { gameId });

const board = ref<BoardTile[][]>([]);
const myTiles = ref<RackTile[]>([]);
const playerScores = ref({});
const selectedTile = ref<RackTile | null>();
const selectedIndex = ref<number | null>();
const playedTiles = ref<any>([]);
const tileBag = ref({});


watch(result, () => {
  if (result.value && result.value.gameState && !gameState.value) {
    console.log("result", result.value.gameState);
    gameState.value = {
      gameStateChanged: result.value.gameState
    }
  }
})

// Watching game state to update local state
watch(gameState, (newState) => {
  console.log(gameState.value)
  if (newState && newState.gameStateChanged) {
    board.value = newState.gameStateChanged.board.map((row: string[]) =>
      row.map((tileString: string) => ({
        letter: null,
        type: tileString.trim() === '' ? 'normal' : tileString.trim(),
        isPlaced: false
      }))
    );



    console.log("Board:", board.value);

    // Update player's tiles and scores
    const currentPlayer = newState.gameStateChanged.players.find((player: { name: string; hand: string[]; score: number }) =>
      player.name === userId
    );
    const players = newState.gameStateChanged.players
    playerScores.value = players.reduce((acc: any, player: any) => {
      acc[player.name] = player.score;
      return acc;
    }, {});


    if (currentPlayer) {
      myTiles.value = currentPlayer.hand.map((letter: string) => ({ letter }));
      // playerScores.value[currentPlayer.name] = currentPlayer.score;
    }



    const counts: Record<string, number> = {};
    newState.gameStateChanged.deck.forEach((letter: string) => {
      if (letter.trim() !== '') {
        counts[letter] = (counts[letter] || 0) + 1;
      }
    });
    tileBag.value = counts;


    // Example to update turn history
    // Adjust based on your actual data structure and needs
    // turnHistory.value = newState.gameStateChanged.players.map(player => ({
    //   player: player.name,
    //   turn: player.currentTurn,  // Example property
    //   word: player.lastWord,    // Example property
    //   score: player.score
    // }));

    console.log("My tiles:", myTiles.value);
    console.log("Player scores:", playerScores.value);
  }
});


// Functions for tile interaction
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
    myTiles.value.splice(selectedIndex.value ?? 0, 1);
    playedTiles.value.push({ rowIndex, colIndex, letter: boardTile.letter });
    selectedTile.value = null;
    selectedIndex.value = null;
  } else if (!selectedTile.value && boardTile.letter && boardTile.isPlaced) {
    // This checks if the tile was previously placed in the same turn before picking it up
    const playedTileIndex = playedTiles.value.findIndex((pt: { rowIndex: number, colIndex: number }) => pt.rowIndex === rowIndex && pt.colIndex === colIndex);
    if (playedTileIndex !== -1) {
      playedTiles.value.splice(playedTileIndex, 1);
    }
    myTiles.value.push({ letter: boardTile.letter });
    boardTile.letter = null;
    boardTile.isPlaced = false;
  }
}


function shuffleTiles() {
  for (let i = myTiles.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [myTiles.value[i], myTiles.value[j]] = [myTiles.value[j], myTiles.value[i]];
  }
}

function resetPlayedTiles() {
  playedTiles.value.forEach((pt: { rowIndex: number, colIndex: number }) => {
    const tile = board.value[pt.rowIndex][pt.colIndex];
    // Put the tile back in the rack
    myTiles.value.push({ letter: tile.letter as string }); 
    // Clear the tile from the board
    tile.letter = null;
    tile.isPlaced = false; // Ensure isPlaced is reset
  });
  playedTiles.value = []; // Clear the played tiles
}




const submitWord = async () => {
  console.log("gameId", gameId)
  if (!gameState.value || !gameState.value.gameStateChanged) {
    console.error("Game state is not available.");
    return;
  } 

  // console.log(gameState.value.gameStateChanged.players[gameState.value.gameStateChanged.currentPlayerIndex].name)
  if (gameState.value.gameStateChanged.players[gameState.value.gameStateChanged.currentPlayerIndex].name !== userId) {
    console.error("It's not your turn.");
    return;
  }


  const currentPlayerIndex = gameState.value.gameStateChanged.currentPlayerIndex;
  const action = {
    action: 'PLAY',
    playerIndex: currentPlayerIndex,
    potentialTiles: playedTiles.value.map((t: any) => t.letter),
    locations: playedTiles.value.map((t: any) => ([t.rowIndex, t.colIndex]))
  };

  try {
    await performAction({ gameId, action });  // Ensure variables are correctly referenced
    console.log('Word submitted successfully');
    // After successful submission, clear played tiles
    playedTiles.value = [];
  } catch (error) {
    console.error("Error performing action:", error);
  }
};

// Skip Turn
async function skipTurn() {
  if (!gameState.value?.gameStateChanged) {
    console.error("Game state is not available.");
    return;
  }
  if (gameState.value.gameStateChanged.players[gameState.value.gameStateChanged.currentPlayerIndex].name !== userId) {
    console.error("It's not your turn.");
    return;
  }

  const action = {
    action: 'SKIP_TURN',
    playerIndex: gameState.value.gameStateChanged.currentPlayerIndex
  };

  try {
    await performAction({ gameId, action });
    console.log('Turn skipped successfully');
  } catch (error) {
    console.error("Error performing skip turn:", error);
  }
}

// Resign Game
async function resign() {
  if (!gameState.value?.gameStateChanged) {
    console.error("Game state is not available.");
    return;
  }
  if (gameState.value.gameStateChanged.players[gameState.value.gameStateChanged.currentPlayerIndex].name !== userId) {
    console.error("It's not your turn.");
    return;
  }
  const action = {
    action: 'RESIGN',
    playerIndex: gameState.value.gameStateChanged.currentPlayerIndex
  };

  try {
    await performAction({ gameId, action });
    console.log('Player has resigned');
    // router.push('/'); // Redirect to home or another appropriate route

  } catch (error) {
    console.error("Error performing resignation:", error);
  }
}

// Swap Tiles
async function swapTiles() {
  if (!gameState.value?.gameStateChanged) {
    console.error("Game state is not available.");
    return;
  }
  if (gameState.value.gameStateChanged.players[gameState.value.gameStateChanged.currentPlayerIndex].name !== userId) {
    console.error("It's not your turn.");
    return;
  }
  if (!selectedTile.value) {
    console.error("No tile selected for swapping.");
    alert("Please select a tile to swap.");  // Display alert if no tile is selected
    return;
  }

  const action = {
    action: 'SWAP_TILES',
    playerIndex: gameState.value.gameStateChanged.currentPlayerIndex,
    potentialTiles: [selectedTile.value.letter] // Ensuring that only one tile is swapped
  };

  try {
    const result = await performAction({ gameId, action });
    if (result && result.data.doAction) {
      console.log('Tiles swapped successfully');
      console.log(gameState);
    }
  } catch (error) {
    console.error("Error performing tile swap:", error);
  }
}


// Other functions as before
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
