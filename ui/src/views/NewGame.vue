<template>
  
  <b-container class="new-game">
    <b-navbar-brand href="#">
        <span>Welcome, {{ user.preferred_username }}</span>
      </b-navbar-brand>
    <b-row>
      <b-col cols="12" md="8" class="mx-auto">
        <h1>Create or Join a Game</h1>
        <!-- Form for creating a new game -->
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
          <b-button type="submit" variant="primary">Create Game</b-button>
        </b-form>
        <!-- Form for joining an existing game -->
        <b-form @submit.prevent="joinGame" class="mt-4">
          <b-form-group label="Game ID">
            <b-form-input v-model="gameId" placeholder="Enter Game ID"></b-form-input>
          </b-form-group>
          <b-button type="submit" variant="success">Join Game</b-button>
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
import { inject } from 'vue';

const user = inject('user');

const router = useRouter(); // Instantiate the router

const gameId = ref('');

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
    playerNames: [user.value.preferred_username], // Ensure username is correctly retrieved
    blankTiles: newGameOptions.value.blankTiles,
    swap: newGameOptions.value.swap,
  };

  console.log('Creating game with config:', config); // Check if this logs

  try {
    const { data } = await createGameMutation({
      config
    });
    console.log('Game created successfully, game ID:', data.createGame); // Check this log
    router.push({ name: 'LoadingScreen', params: { gameId: data.createGame, userId: user.value.preferred_username } });
  } catch (error) {
    console.error('Error creating new game:', error);
  }
};


const JOIN_GAME = gql`
  mutation JoinGame($gameId: ID!, $playerName: String!) {
    joinGame(gameId: $gameId, playerName: $playerName)
  }
`;

const { mutate: joinGameMutation } = useMutation(JOIN_GAME);

const joinGame = async () => {
  try {
    const playerName = user.value.preferred_username; // This should be dynamically obtained or entered by the user
    const { data } = await joinGameMutation({
      gameId: gameId.value,
      playerName: playerName,
    });
    if (data.joinGame) {
      console.error('Successfully joined game:', gameId.value);
      router.push({ name: 'LoadingScreen', params: { gameId: gameId.value, userId: user.value.preferred_username } });
    } else {
      console.error('Joining game failed or game is full.');
    }
  } catch (error) {
    console.error('Error joining game:', error);
  }
};


</script>


<style scoped>
.new-game {
  padding-top: 2rem;
}
</style>