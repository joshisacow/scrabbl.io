<template>
    <b-container class="loading-screen">
      <b-row>
        <b-col cols="12" class="text-center">
          <div class="loading-message">Waiting for all players to join...</div>
          <p class="game-id-display">Game ID: {{ gameId }}</p>
          <b-spinner label="Loading..." v-if="loading"></b-spinner>
          <div v-if="error">Error: {{ error.message }}</div>
        </b-col>
      </b-row>
    </b-container>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useQuery, useMutation } from '@vue/apollo-composable';
  import gql from 'graphql-tag';
  
  const router = useRouter();
  const route = useRoute();
  const gameId = route.params.gameId;
  
  const waitingRoomQuery = gql`
    query WaitingRoom($gameId: ID!) {
      waitingRoom(gameId: $gameId) {
        gameId
        config {
          playerNames
          playerCount
        }
      }
    }
  `;
  
  const startGameMutation = gql`
    mutation StartGame($gameId: ID!) {
      startGame(gameId: $gameId) {
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
  
  const { loading, error, data: waitingRoomData } = useQuery(waitingRoomQuery, {
    variables: { gameId },
    pollInterval: 5000, // Automatic polling
  });
  
  const { mutate: startGame } = useMutation(startGameMutation, {
    variables: { gameId }
  });
  
  const checkStartCondition = () => {
    console.log('Checking start condition...');
    if (waitingRoomData.value && waitingRoomData.value.waitingRoom) {
      const { playerNames, playerCount } = waitingRoomData.value.waitingRoom.config;
      if (playerNames.length === playerCount) {
        startGame().then(({ data }) => {
          console.log('Game starting...');
          router.push(`/game/${gameId}`);
        }).catch((err) => {
          console.error('Error starting the game:', err);
        });
      }
    }
  };
  
  onMounted(() => {
    checkStartCondition();  // Initial check before starting interval
  });
  
  onUnmounted(() => {
    console.log('Component unmounted');
  });
  </script>
  