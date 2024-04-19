// ////////////////////////////////////////////////////////////////////////////////////////////
// // data model for cards and game state

import { newDeck, shuffleDeck, possibleBoards, isValidWord, letterValues } from "./game-statics" 

class Player {
  name: string
  score: number
  hand: string[]

  constructor(name: string) {
    this.name = name
    this.score = 0
    this.hand = []
  }
}

export interface Action {
  action: "play" | "resign" | "swap-tiles" | "skip-turn",
  playerIndex: number,
  potentialTiles?: string[],
  locations?: [number, number][],
}
const emptySpaces = ["   ", "2xWS", "3xWS", "2xLS", "3xLS"]

export class GameState {
  board: string[][]
  players: Player[]
  currentPlayerIndex: number
  deck: string[]
  // phase: GamePhase

  constructor(playerNames: string[], board: number) {
    this.board = JSON.parse(JSON.stringify(possibleBoards[board]))
    this.players = playerNames.map(name => new Player(name))
    this.currentPlayerIndex = Math.floor(Math.random() * playerNames.length)
    this.deck = newDeck()
  }


  doAction(action: Action) {
    if (action.playerIndex !== this.currentPlayerIndex) {
      return "Not your turn"
    }
    if (action.action === "play") {
      this.playTiles(action.playerIndex, action.potentialTiles, action.locations)
    } else if (action.action === "skip-turn") {
      this.skipTurn()
    } else if (action.action === "swap-tiles") {
      this.swapTiles(action.playerIndex, action.potentialTiles)
    } else if (action.action === "resign") {
      this.resign(action.playerIndex)
    }
  }

  playTiles(playerIndex: number, potentialTiles: string[], locations: [number, number][]) {
    let score = this.playAction(potentialTiles, locations)
    if (score < 0) {
      return "Invalid move"
    }
    this.players[playerIndex].score += score
    this.drawTiles(playerIndex, potentialTiles.length)
    return score
  }

  skipTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
  }

  drawTiles(playerIndex: number, numTiles: number) {
    for (let i = 0; i < Math.min(numTiles, this.deck.length); i++) {
      this.players[playerIndex].hand.push(this.deck.pop())
    }
  }

  swapTiles(playerIndex: number, tiles: string[]) {
    for (let i = 0; i < tiles.length; i++) {
      let index = this.players[playerIndex].hand.indexOf(tiles[i])
      if (index === -1) {
        return "Invalid tile"
      }
      this.players[playerIndex].hand.splice(index, 1)
      this.deck.push(tiles[i])
    }
    this.drawTiles(playerIndex, tiles.length)
    for (let i = 0; i < tiles.length; i++) {
      this.deck.push(tiles[i])
    }
    this.deck = shuffleDeck(this.deck)
  }

  resign(playerIndex: number) {
    this.players.splice(playerIndex, 1)
    if (this.currentPlayerIndex >= playerIndex) {
      this.currentPlayerIndex -= 1
    }
  }

  playAction(potentialTiles: string[], locations: [number, number][]) {
    let tempBoard = JSON.parse(JSON.stringify(this.board))
    for (let i = 0; i < potentialTiles.length; i++) {
      tempBoard[locations[i][0]][locations[i][1]] = potentialTiles[i]
    }

    // check if all same row or column
    let r = locations[0][0]
    let c = locations[0][1]
    var direction, perpendicular;
    for (let i = 0; i < locations.length; i++) {
      if (locations[i][0] !== r && locations[i][1] !== c) {
        return -1
      }
      if (locations[i][1] !== c) {
        direction = "horizontal"
        perpendicular = "vertical"
      } else if (locations[i][0] !== r) {
        direction = "vertical"
        perpendicular = "horizontal"
      }
    }
    
    // check if valid placements + compute scores
    var score = 0;
    for (let i = 0; i < locations.length; i++) {
      let value = this.checkTile(locations[i][0], locations[i][1], perpendicular, tempBoard)
      if (value < 0) {
        return value
      } else {
        score += value 
      }
    }
    let value = this.checkTile(locations[0][0], locations[0][1], direction, tempBoard)
    if (value < 0) {
      return value
    } else {
      score += value
    }
    if (potentialTiles.length >= 7) {
      score += 50
    }
    return score
  }

  checkTile(i: number, j: number, direction: string, tempBoard: string[][]) {
    var score;
    if (direction === "horizontal") {
      var [l, r] = [j,j]
      while (l-1 >= 0 && !emptySpaces.includes(tempBoard[i][l-1])) l--;
      while (r+1 < this.board.length && !emptySpaces.includes(tempBoard[i][r+1])) r++;
      score = this.checkWord(i, l, i, r, tempBoard)
    } else {
      var [t,b] = [i,i]
      while (t-1 >= 0 && !emptySpaces.includes(tempBoard[t-1][j])) t--;
      while (b+1 < this.board.length && !emptySpaces.includes(tempBoard[b+1][j])) b++;
      score = this.checkWord(t, j, b, j, tempBoard)
    }
    return score
  }

  checkWord(i1: number, j1: number, i2: number, j2: number, tempBoard: string[][]) {
    var word = ""
    var score = 0
    var multiplier = 1
    if (i1 === i2 && j1 === j2) {
      return 0
    } else if (i1 === i2) {
      for (let j = j1; j <= j2; j++) {
        word += tempBoard[i1][j]
        score += letterValues[tempBoard[i1][j]]
        if (this.board[i1][j] === "2xLS") {
          score += letterValues[tempBoard[i1][j]]
        } else if (this.board[i1][j] === "3xLS") {
          score += 2 * letterValues[tempBoard[i1][j]]
        } else if (this.board[i1][j] === "2xWS") {
          multiplier *= 2
        } else if (this.board[i1][j] === "3xWS") {
          multiplier *= 3
        }
      }
    } else if (j1 === j2) {
      for (let i = i1; i <= i2; i++) {
        word += tempBoard[i][j1]
        score += letterValues[tempBoard[i][j1]]
        if (this.board[i][j1] === "2xLS") {
          score += letterValues[tempBoard[i][j1]]
        } else if (this.board[i][j1] === "3xLS") {
          score += 2 * letterValues[tempBoard[i][j1]]
        } else if (this.board[i][j1] === "2xWS") {
          multiplier *= 2
        } else if (this.board[i][j1] === "3xWS") {
          multiplier *= 3
        }
      }
    } else {
      return -1
    }
    
    // check word in list
    if (isValidWord(word)) {
      return score * multiplier
    }
    return -1

  }


}

const dealCards = (state: GameState) => {
  state.players.forEach(player => {
    for (let i = 0; i < 7; i++) {
      player.hand.push(state.deck.pop())
    }
  })
}

export function createNewGame(playerNames: string[], board: number): GameState {
  if (playerNames.length < 2 || playerNames.length > 4) {
    throw new Error("Must have 2-4 players")
  }
  const state = new GameState(playerNames, board)
  dealCards(state)
  return state
}

createNewGame(["a", "b", "c", "d"], 0)



// export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
// export const SUITS = ["♦️", "♥️", "♣️", "♠️"]

// export type CardId = string
// export type LocationType = "unused" | "last-card-played" | "player-hand"

// export interface Card {
//   id: CardId
//   rank: typeof RANKS[number]
//   suit: typeof SUITS[number]
//   locationType: LocationType
//   playerIndex: number | null
//   positionInLocation: number | null
// }

// /**
//  * determines whether one can play a card given the last card played
//  */
// export function areCompatible(card: Card | undefined, lastCardPlayed: Card | undefined) {
//   if (card === undefined || lastCardPlayed === undefined) {
//     return false
//   }
//   return card.rank === lastCardPlayed.rank || card.suit === lastCardPlayed.suit || card.rank === "J" || lastCardPlayed.rank === "J"
// }

// export type GamePhase = "initial-card-dealing" | "play" | "game-over"

// export interface GameState {
//   playerNames: string[]
//   cardsById: Record<CardId, Card>
//   currentTurnPlayerIndex: number
//   phase: GamePhase
//   playCount: number
//   twoCardPlayers: number[]
// }

// /**
//  * @returns an array of the number of the cards in each player's hand
//  */
// export function computePlayerCardCounts({ playerNames, cardsById }: GameState) {
//   const counts = playerNames.map(_ => 0)
//   Object.values(cardsById).forEach(({ playerIndex }) => {
//     if (playerIndex != null) {
//       ++counts[playerIndex]
//     }
//   })
//   return counts
// }

// /**
//  * finds the last played card
//  */
// export function getLastPlayedCard(cardsById: Record<CardId, Card>) {
//   return Object.values(cardsById).find(c => c.locationType === "last-card-played") || null
// }

// /**
//  * extracts the cards that are currently in the given player's hand
//  */
//  export function extractPlayerCards(cardsById: Record<CardId, Card>, playerIndex: number): Card[] {
//   return Object.values(cardsById).filter(({ playerIndex: x }) => x === playerIndex)
// }

// /**
//  * determines if someone has won the game -- i.e., has no cards left in their hand
//  */
//  export function determineWinner(state: GameState) {
//   if (state.phase === "initial-card-dealing") {
//     return null
//   }
//   const playerIndex = computePlayerCardCounts(state).indexOf(0)
//   return playerIndex === -1 ? null : playerIndex
// }

// /**
//  * creates an empty GameState in the initial-card-dealing state
//  */
//  export function createEmptyGame(playerNames: string[], numberOfDecks = 5, rankLimit = Infinity): GameState {
//   const cardsById: Record<CardId, Card> = {}
//   let cardId = 0

//   console.log("limit:", rankLimit)
//   for (let i = 0; i < numberOfDecks; i++) {
//     for (const suit of SUITS) {
//       for (const rank of RANKS.slice(0, rankLimit)) {
//         const card: Card = {
//           suit,
//           rank,
//           id: String(cardId++),
//           locationType: "unused",
//           playerIndex: null,
//           positionInLocation: null,
//         }
//         cardsById[card.id] = card
//       }
//     }
//   }

//   return {
//     playerNames,
//     cardsById,
//     currentTurnPlayerIndex: 0,
//     phase: "initial-card-dealing",
//     playCount: 0,
//     twoCardPlayers: [],
//   }
// }

// /**
//  * looks through the cards for a random card in the unused state -- 
//  * basically, equivalent to continuously shuffling the deck of discarded cards
//  */
// export function findNextCardToDraw(cardsById: Record<CardId, Card>): CardId | null {
//   const unplayedCardIds = Object.keys(cardsById).filter(cardId => cardsById[cardId].locationType === "unused")
//   if (unplayedCardIds.length === 0) {
//     return null
//   }
//   return unplayedCardIds[Math.floor(Math.random() * unplayedCardIds.length)]
// }

// ////////////////////////////////////////////////////////////////////////////////////////////
// // player actions

// export interface DrawCardAction {
//   action: "draw-card"
//   playerIndex: number
// }

// export interface PlayCardAction {
//   action: "play-card"
//   playerIndex: number
//   cardId: CardId
// }

// export type Action = DrawCardAction | PlayCardAction

// function moveToNextPlayer(state: GameState) {
//   state.currentTurnPlayerIndex = (state.currentTurnPlayerIndex + 1) % state.playerNames.length
// }

// function moveCardToPlayer({ currentTurnPlayerIndex, cardsById }: GameState, card: Card) {
//   // add to end position
//   const currentCardPositions = extractPlayerCards(cardsById, currentTurnPlayerIndex).map(x => x.positionInLocation)

//   // update state
//   card.locationType = "player-hand"
//   card.playerIndex = currentTurnPlayerIndex
//   card.positionInLocation = Math.max(-1, ...currentCardPositions) + 1
// }

// function moveCardToLastPlayed({ currentTurnPlayerIndex, cardsById }: GameState, card: Card) {
//   // change current last-card-played to unused
//   Object.values(cardsById).forEach(c => {
//     if (c.locationType === "last-card-played") {
//       c.locationType = "unused"
//     }
//   })

//   // update state
//   card.locationType = "last-card-played"
//   card.playerIndex = null
//   card.positionInLocation = null
// }

// /**
//  * updates the game state based on the given action
//  * @returns an array of cards that were updated, or an empty array if the action is disallowed
//  */
// export function doAction(state: GameState, action: Action): Card[] {
//   const changedCards: Card[] = []
//   if (state.phase === "game-over") {
//     // game over already
//     return []
//   }
//   if (action.playerIndex !== state.currentTurnPlayerIndex) {
//     // not your turn
//     return []
//   }

//   if (action.action === "draw-card") {
//     const cardId = findNextCardToDraw(state.cardsById)
//     if (cardId == null) {
//       return []
//     }
//     const card = state.cardsById[cardId]
//     moveCardToPlayer(state, card)
//     changedCards.push(card)

//     // check for two-card players
//     if (state.twoCardPlayers.includes(state.currentTurnPlayerIndex)) {
//       const counts = computePlayerCardCounts(state)
//       if (counts[state.currentTurnPlayerIndex] > 2) {
//         const index = state.twoCardPlayers.indexOf(state.currentTurnPlayerIndex)
//         state.twoCardPlayers.splice(index, 1)
//       }
//     }
//   }

//   if (state.phase === "initial-card-dealing") {
//     if (action.action !== "draw-card") {
//       return []
//     }

//     const counts = computePlayerCardCounts(state)
//     if (Math.max(...counts) === Math.min(...counts) && counts[0] === 3) {
//       // we are done drawing player cards
//       // draw one card to be the last card played
//       const cardId = findNextCardToDraw(state.cardsById)
//       if (cardId == null) {
//         return []
//       }
//       const card = state.cardsById[cardId]
//       moveCardToLastPlayed(state, card)
//       changedCards.push(card)
//       state.phase = "play"
//     }
//     moveToNextPlayer(state)
//   } else if (action.action === "play-card") {
//     const card = state.cardsById[action.cardId]
//     if (card.playerIndex !== state.currentTurnPlayerIndex) {
//       // not your card
//       return []
//     }
//     const lastPlayedCard = getLastPlayedCard(state.cardsById)
//     if (lastPlayedCard == null) {
//       return []
//     }
//     if (!areCompatible(lastPlayedCard, card)) {
//       return []
//     }
//     changedCards.push(lastPlayedCard)
//     moveCardToLastPlayed(state, card)
//     changedCards.push(card)

//     // check for two-card players
//     if (!state.twoCardPlayers.includes(state.currentTurnPlayerIndex)) {
//       const counts = computePlayerCardCounts(state)
//       if (counts[state.currentTurnPlayerIndex] <= 2) {
//         state.twoCardPlayers.push(state.currentTurnPlayerIndex)
//       }
//     }
//   }

//   if (state.phase === "play" && action.action !== "draw-card") {
//     moveToNextPlayer(state)
//   }

//   if (determineWinner(state) != null) {
//     state.phase = "game-over"
//   }

//   ++state.playCount

//   return changedCards
// }

// export function formatCard(card: Card, includeLocation = false) {
//   let paddedCardId = card.id
//   while (paddedCardId.length < 3) {
//     paddedCardId = " " + paddedCardId
//   }
//   return `[${paddedCardId}] ${card.rank}${card.suit}${(card.rank.length === 1 ? " " : "")}`
//     + (includeLocation
//       ? ` ${card.locationType} ${card.playerIndex ?? ""}`
//       : ""
//     )
// }

// export function printState({ playerNames, cardsById, currentTurnPlayerIndex, phase, playCount }: GameState) {
//   const lastPlayedCard = getLastPlayedCard(cardsById)
//   console.log(`#${playCount} ${phase} ${lastPlayedCard ? formatCard(lastPlayedCard) : ""}`)
//   playerNames.forEach((name, playerIndex) => {
//     const cards = extractPlayerCards(cardsById, playerIndex)
//     console.log(`${name}: ${cards.map(card => formatCard(card)).join(' ')} ${playerIndex === currentTurnPlayerIndex ? ' *TURN*' : ''}`)
//   })
// }

// /**
//  * @returns only those cards that the given player has any "business" seeing
//  */
// export function filterCardsForPlayerPerspective(cards: Card[], playerIndex: number) {
//   return cards.filter(card => card.playerIndex == null || card.playerIndex === playerIndex)
// }

// // update config

// export interface Config {
//   rankLimit: number
//   numberOfDecks: number
// }