import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'


import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import Game from './views/Game.vue'
import Login from './views/Login.vue'
import NewGame from './views/NewGame.vue'


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
    path: "/game",
    component: Game,
    // props (route) {
    //   return {
    //     playerIndex: route.params.playerIndex
    //   }
    // }
  
  },
  {
    path: "/new-game",
    component: NewGame,
  }
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

createApp(App)
	.use(BootstrapVue)
	.use(BootstrapVueIcons)
	.use(router)
	.mount('#app')
