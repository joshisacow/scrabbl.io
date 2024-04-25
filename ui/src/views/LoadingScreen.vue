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

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
// import { inject } from 'vue';
// import { User } from './Game.vue'

// const user: User | undefined = inject('user');

const router = useRouter();
const route = useRoute();
const gameId = route.params.gameId;
const userId = route.params.userId;
console.log("gameId: ", gameId)

const waitingRoomQuery = gql`
    query GetWaitingRoom($gameId: ID!) {
        waitingRoom(gameId: $gameId) {
            gameId
            config {
                playerCount
                playerNames
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
console.log(gameId)


const { mutate: startGame } = useMutation(startGameMutation, {
  variables: { gameId }
});

const { result, loading, error } = useQuery(waitingRoomQuery, {
  gameId: gameId
});

watch(result, (newResult) => {
  if (newResult && newResult.waitingRoom) {
    const { playerNames, playerCount } = newResult.waitingRoom.config;
    if (playerNames.length === playerCount && userId) {
      startGame()
        .then(() => {
          console.log('Game starting...');
          router.push(`/game/${gameId}/${userId}`);
        })
        .catch((err) => {
          console.error('Error starting the game:', err);
        });
    }
  }
});

onMounted(() => {
});

onUnmounted(() => {
  console.log('Component unmounted');
});
</script>