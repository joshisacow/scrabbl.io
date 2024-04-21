<template>
  <b-container class="new-game">
    <b-row>
      <b-col cols="12" md="8" class="mx-auto">
        <h1>Create New Game</h1>
        <b-form @submit.prevent="startNewGame">
          <b-form-group label="Number of Players">
            <b-form-select v-model="newGameOptions.playerCount" :options="playerCountOptions"></b-form-select>
          </b-form-group>
          <b-form-group label="Board Type">
            <b-form-select v-model="newGameOptions.boardType" :options="boardTypeOptions"></b-form-select>
          </b-form-group>
          <b-form-group label="Include Blank Tiles">
            <b-form-checkbox v-model="newGameOptions.blankTiles" switch>
              {{ newGameOptions.blankTiles ? 'Yes' : 'No' }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group label="Allow Tile Swap">
            <b-form-checkbox v-model="newGameOptions.swap" switch>
              {{ newGameOptions.swap ? 'Yes' : 'No' }}
            </b-form-checkbox>
          </b-form-group>
          <b-button type="submit" variant="primary">Start Game</b-button>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>


<script setup>
import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useRouter } from 'vue-router'; // Import the useRouter function
const router = useRouter(); // Instantiate the router


const newGameOptions = ref({
  playerCount: 2,
  boardType: 'standard',
  blankTiles: false,
  swap: false,
});

const playerCountOptions = [
  { value: 2, text: '2 Players' },
  { value: 3, text: '3 Players' },
  { value: 4, text: '4 Players' },
];

const boardTypeOptions = [
  { value: 'standard', text: 'Standard' },
  { value: 'random', text: 'Random' },
];



// GraphQL mutation
// const START_GAME = gql`
//   mutation StartGame($gameId: ID!, $config: Config!) {
//     startGame(gameId: $gameId, config: $config) {
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

// const { mutate: startGameMutation } = useMutation(START_GAME);
const CREATE_GAME = gql`
  mutation CreateGame($config: Config!) {
    createGame(config: $config)
  }
`;

const { mutate: createGameMutation } = useMutation(CREATE_GAME);


// Function to generate player names based on count
function generatePlayerNames(count) {
  return Array.from({ length: count }, (_, i) => `Player ${i + 1}`);
}

// const startNewGame = async () => {
//     const config = {
//       playerCount: parseInt(newGameOptions.value.playerCount),
//       board: newGameOptions.value.boardType === 'standard' ? 0 : 1, // Assuming '0' for 'Standard' and '1' for 'Random'
//       playerNames: generatePlayerNames(parseInt(newGameOptions.value.playerCount)),
//     };

//     console.log('Starting game with config:', config);

//     try {
//       const { data } = await startGameMutation({
//         gameId: "1234", // Replace with dynamic gameId if needed
//         config
//       });
//       console.log('Game started successfully:', data.startGame);
//       // Redirect or handle new game start success
//     //   router.push('/loading-screen'); 
//     // console.log("Printing gameID:", 1234)
//     router.push({ name: 'LoadingScreen', params: { gameId: "1234" } });


//     } catch (error) {
//       console.error('Error starting new game:', error);
//     }
// };
const startNewGame = async () => {
  const config = {
    playerCount: parseInt(newGameOptions.value.playerCount),
    board: newGameOptions.value.boardType === 'standard' ? 0 : 1,
    playerNames: generatePlayerNames(parseInt(newGameOptions.value.playerCount)),
    blankTiles: newGameOptions.value.blankTiles,
    swap: newGameOptions.value.swap,
  };

  console.log('Creating game with config:', config);

  try {
    const { data } = await createGameMutation({
      config
    });
    const gameId = data.createGame;  // Assuming the mutation returns the game ID directly
    console.log('Game created successfully, game ID:', gameId);
    router.push({ name: 'LoadingScreen', params: { gameId } });
  } catch (error) {
    console.error('Error creating new game:', error);
  }
};

</script>


<style scoped>
.new-game {
  padding-top: 2rem;
}
</style>