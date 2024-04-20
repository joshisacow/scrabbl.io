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
  
//   const CREATE_GAME = gql`
//     mutation CreateGame($config: Config!) {
//       startGame(config: $config) {
//         id
//         // other fields as needed
//       }
//     }
//   `;
  
  // Define your new game options model
  const newGameOptions = ref({
    language: 'English',
    playerCount: 2,
    boardType: 'Standard',
    timeLimit: '30 minutes'
  });
  
  // Define options for the select fields
  const languageOptions = ['English', 'Spanish', 'French'];
  const playerCountOptions = [2, 3, 4];
  const boardTypeOptions = ['Standard', 'Deluxe', 'Travel'];
  const timeLimitOptions = ['15 minutes', '30 minutes', '1 hour', 'No limit'];
  
  // Prepare the mutation
//   const { mutate: createGame, onDone } = useMutation(CREATE_GAME);
  
  // Watch for the mutation result and react accordingly
//   onDone(({ data, errors }) => {
//     if (errors) {
//       console.error('Errors creating the game:', errors);
//     } else {
//       // For example, navigate to the game page or display the game ID
//       console.log('Game created successfully, game ID:', data.startGame.id);
//     }
//   });
  
  // The function to call when the form is submitted
  const startNewGame = async () => {
    try {
      await createGame({ config: newGameOptions.value });
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };
  </script>
  
  <style scoped>
  .new-game {
    padding-top: 2rem;
  }
  
  /* Add more styles as needed */
  </style>
  