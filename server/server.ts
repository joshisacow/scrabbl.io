import http from "http"
import { Server } from "socket.io"
import { Action, createEmptyGame, doAction, filterCardsForPlayerPerspective, Card, Config } from "./model"



const server = http.createServer()
const io = new Server(server)
const port = 8101

let config: Config = { rankLimit: 13, numberOfDecks: 2 }
let gameState = createEmptyGame(["player1", "player2"], config.numberOfDecks, config.rankLimit)

function emitUpdatedCardsForPlayers(cards: Card[], newGame = false) {
  gameState.playerNames.forEach((_, i) => {
    let updatedCardsFromPlayerPerspective = filterCardsForPlayerPerspective(cards, i)
    if (newGame) {
      updatedCardsFromPlayerPerspective = updatedCardsFromPlayerPerspective.filter(card => card.locationType !== "unused")
    }
    console.log("emitting update for player", i, ":", updatedCardsFromPlayerPerspective)
    io.to(String(i)).emit(
      newGame ? "all-cards" : "updated-cards", 
      updatedCardsFromPlayerPerspective,
    )
  })
}

io.on('connection', client => {
  function emitGameState() {
    client.emit(
      "game-state", 
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      gameState.twoCardPlayers,
    )
  }
  
  console.log("New client")
  let playerIndex: number | null | "all" = null
  client.on('player-index', n => {
    playerIndex = n
    console.log("playerIndex set", n)
    client.join(String(n))
    if (typeof playerIndex === "number") {
      client.emit(
        "all-cards", 
        filterCardsForPlayerPerspective(Object.values(gameState.cardsById), playerIndex).filter(card => card.locationType !== "unused"),
      )
    } else {
      client.emit(
        "all-cards", 
        Object.values(gameState.cardsById),    
      )
    }
    emitGameState()
  })

  client.on("action", (action: Action) => {
    if (typeof playerIndex === "number") {
      const updatedCards = doAction(gameState, { ...action, playerIndex })
      emitUpdatedCardsForPlayers(updatedCards)
    } else {
      // no actions allowed from "all"
    }
    io.to("all").emit(
      "updated-cards", 
      Object.values(gameState.cardsById),    
    )
    io.emit(
      "game-state", 
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      gameState.twoCardPlayers,
    )
  })

  client.on("new-game", () => {
    gameState = createEmptyGame(gameState.playerNames, config.numberOfDecks, config.rankLimit)
    const updatedCards = Object.values(gameState.cardsById)
    emitUpdatedCardsForPlayers(updatedCards, true)
    io.to("all").emit(
      "all-cards", 
      updatedCards,
    )
    // io.emit(
    //   "game-state", 
    //   gameState.currentTurnPlayerIndex,
    //   gameState.phase,
    //   gameState.playCount,
    //   gameState.twoCardPlayers,
    // )
    emitGameState()
  })

  client.on("get-config", () => {
    client.emit("get-config-reply", config)
  })

  client.on("update-config", (newConfig: Config) => {
    if (!newConfig.hasOwnProperty("rankLimit") || typeof newConfig.rankLimit !== "number" ||
        newConfig.rankLimit < 1 || newConfig.rankLimit > 13 || !newConfig.hasOwnProperty("numberOfDecks") || 
        typeof newConfig.numberOfDecks !== "number" || newConfig.numberOfDecks < 1 || Object.keys(newConfig).length !== 2) 
    {
      client.emit("update-config-reply", false)
      return
    }

    // 2 second delay -> valid config
    setTimeout(() => {
      // update config + create new game
      config = newConfig
      gameState = createEmptyGame(gameState.playerNames, config.numberOfDecks, config.rankLimit)
      const updatedCards = Object.values(gameState.cardsById)
      emitUpdatedCardsForPlayers(updatedCards, true)
      io.to("all").emit(
        "all-cards", 
        updatedCards,
      )
      emitGameState()
      client.emit("update-config-reply", true)
    }, 2000)

    
  })
})
server.listen(port)
console.log(`Game server listening on port ${port}`)
