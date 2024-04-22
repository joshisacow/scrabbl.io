<template>
    <b-container class="loading-screen">
      <b-row>
        <b-col cols="12" class="text-center">
          <div class="loading-message">Waiting for all players to join...</div>
          <p class="game-id-display">Game ID: {{ gameId }}</p>
          <b-spinner label="Loading..."></b-spinner>
        </b-col>
      </b-row>
    </b-container>
  </template>
  
  <script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const router = useRouter();
const route = useRoute();
const gameId = route.params.gameId;

const gameStateQuery = gql`
  query GameState($gameId: ID!) {
    gameState(gameId: $gameId) {
      currentPlayerIndex
      players {
        name
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

const { loading, error, data } = useQuery(gameStateQuery, {
  variables: { gameId },
});

const { mutate: startGame } = useMutation(startGameMutation, {
  variables: { gameId }
});

// Polling mechanism to check if all players are connected
const checkStartCondition = () => {
  if (!loading.value && data.value && data.value.gameState.players.length === data.value.gameState.playerCount) {
    startGame().then(({ data }) => {
      router.push(`/game/${gameId}`);
    }).catch((err) => {
      console.error('Error starting the game:', err);
    });
  }
};

const pollingInterval = ref(null);
onMounted(() => {
  pollingInterval.value = setInterval(checkStartCondition, 3000);
});

onUnmounted(() => {
  if (pollingInterval.value) clearInterval(pollingInterval.value);
});
</script>
