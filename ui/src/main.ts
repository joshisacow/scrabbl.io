import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'


import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import Game from './views/Game.vue'
import Login from './views/Login.vue'
import NewGame from './views/NewGame.vue'
import LoadingScreen from './views/LoadingScreen.vue'


const routes = [
  {
    path: "/",
    component: Login,
    // props (route) {
    //   return {
    //     playerIndex: route.params.playerIndex
    //   }
    // }
  },
  {
    path: "/game/:gameId",
    name: "Game",
    component: Game,
    props: true // This will pass all route params as props to the Game component
  }  ,
  {
    path: "/new-game",
    component: NewGame,
  },
  {
    path: "/loading-screen/:gameId",
    name: 'LoadingScreen',
    component: LoadingScreen,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App)
  .use(BootstrapVue as any)
  .use(BootstrapVueIcons as any) // Add 'as any' to bypass type checking
  .use(router)
  .mount('#app')
