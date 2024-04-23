<template>
    <b-container class="loading-screen">
        <b-row>
            <b-col cols="12" class="text-center">
                <div class="loading-message">
                    Loading your game, please wait...
                </div>
                <p class="game-id-display">Game ID: {{ gameId }}</p>
                <!-- Display more game details if necessary -->
                <div class="spinner-container">
                    <b-spinner label="Loading..."></b-spinner>
                </div>
            </b-col>
        </b-row>
    </b-container>
</template>

<script setup lang="ts">
// You can include scripts for handling transitions or loading states here
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { defineProps } from 'vue';

const props = defineProps({
    gameId: String
});

const gameID = ref(props.gameId);

console.log("Printing gameID:", gameID.value);

</script>

<style scoped>
.loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    /* Full viewport height */
    background: linear-gradient(to right, #6a11cb, #2575fc);
    /* Vibrant gradient background */
}

.loading-message {
    font-size: 200%;
    margin-bottom: 20px;
    color: #ffffff;
    /* White text for better contrast */
}

.spinner-container {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>