<template>
    <b-container class="new-game">
      <b-row>
        <b-col cols="12" md="8" class="mx-auto">
          <h1>Create New Game</h1>
          <b-form @submit.prevent="startNewGame">
            <b-form-group label="Language">
              <b-form-select v-model="newGameOptions.language" :options="languageOptions"></b-form-select>
            </b-form-group>
            <b-form-group label="Number of Players">
              <b-form-select v-model="newGameOptions.playerCount" :options="playerCountOptions"></b-form-select>
            </b-form-group>
            <b-form-group label="Board Type">
              <b-form-select v-model="newGameOptions.boardType" :options="boardTypeOptions"></b-form-select>
            </b-form-group>
            <b-form-group label="Time Limit">
              <b-form-select v-model="newGameOptions.timeLimit" :options="timeLimitOptions"></b-form-select>
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
    language: 'en',
    playerCount: 2,
    boardType: 'standard',
    timeLimit: 0,
});

const languageOptions = [
    { value: 'en', text: 'English' },
    { value: 'fr', text: 'French' },
    { value: 'de', text: 'German' },
];

const playerCountOptions = [
    { value: 2, text: '2 Players' },
    { value: 3, text: '3 Players' },
    { value: 4, text: '4 Players' },
];

const boardTypeOptions = [
    { value: 'standard', text: 'Standard' },
    { value: 'random', text: 'Random' },
];

const timeLimitOptions = [
    { value: 0, text: 'No Time Limit' },
    { value: 300, text: '5 Minutes' },
    { value: 600, text: '10 Minutes' },
    { value: 900, text: '15 Minutes' },
];

// GraphQL mutation
const START_GAME = gql`
  mutation StartGame($gameId: ID!, $config: Config!) {
    startGame(gameId: $gameId, config: $config) {
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

const { mutate: startGameMutation } = useMutation(START_GAME);

// Function to generate player names based on count
function generatePlayerNames(count) {
    return Array.from({ length: count }, (_, i) => `Player ${i + 1}`);
}

const startNewGame = async () => {
    const config = {
      playerCount: parseInt(newGameOptions.value.playerCount),
      board: newGameOptions.value.boardType === 'standard' ? 0 : 1, // Assuming '0' for 'Standard' and '1' for 'Random'
      playerNames: generatePlayerNames(parseInt(newGameOptions.value.playerCount)),
    };

    console.log('Starting game with config:', config);

    try {
      const { data } = await startGameMutation({
        gameId: "1234", // Replace with dynamic gameId if needed
        config
      });
      console.log('Game started successfully:', data.startGame);
      // Redirect or handle new game start success
      router.push({ name: 'LoadingScreen', params: { gameId: data.startGame.id } });
    } catch (error) {
      console.error('Error starting new game:', error);
    }
};
</script>

  
  <style scoped>
  .new-game {
    padding-top: 2rem;
  }
  </style>
  