<template>
  <div>
    <b-navbar toggleable="lg" type="dark" :variant="user?.roles?.includes('operator') ? 'info' : 'primary'">
      <b-navbar-brand href="#">
        <span v-if="user?.name">Welcome, {{ user.name }}</span>
        <span v-else>Scrabbl.io</span>
      </b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item v-if="user?.preferred_username == null" href="/api/login">Login</b-nav-item>
        <b-nav-item v-if="user?.preferred_username" @click="logout">Logout</b-nav-item>
        <form method="POST" action="/api/logout" id="logoutForm" />
      </b-navbar-nav>
    </b-navbar>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client/core'
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"; 
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities"


const httpLink = createHttpLink({
  uri: 'http://127.0.0.1:8228/graphql',
})
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://127.0.0.1:8228/subscriptions",
  })
)

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === "OperationDefinition" && definition.operation === "subscription"
  },
  wsLink,
  httpLink
)

const cache = new InMemoryCache()
const apolloClient = new ApolloClient({
  link,
  cache,
})

provide(DefaultApolloClient, apolloClient)

const user = ref({} as any)
provide("user", user)

onMounted(async () => {
  user.value = await (await fetch("/api/user")).json()
})

function logout() {
  ;(window.document.getElementById('logoutForm') as HTMLFormElement).submit()  
}
</script>