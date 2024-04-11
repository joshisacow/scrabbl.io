// ////////////////////////////////////////////////////////////////////////////////////////////
// // data model for cards and game state

import { Tile, shuffleDeck, possibleBoards } from "./game-statics" 

class Board {
  board: Tile[][]
  size: number

  constructor(board: number) {
    for (let i = 0; i < possibleBoards[board].length; i++) {
      for (let j=0; j < possibleBoards[board][0].length; j++) {
        const tile = new Tile(possibleBoards[board][i][j], possibleBoards[board][i][j])
        this.board[i][j] = tile
      }
    }
    this.size = possibleBoards[board].length
  }

  playTile(potentialTiles: Tile[], locations: [number, number][]) {
    // for (let i = 0; i < potentialTiles.length; i++) {
    //   this.board[locations[i][0]][locations[i][1]] = potentialTiles[i]
    // }

    // check if all same row or column
    let r = locations[0][0]
    let c = locations[0][1]
    var direction, perpendicular;
    for (let i = 0; i < locations.length; i++) {
      if (locations[i][0] !== r && locations[i][1] !== c) {
        return "Invalid move"
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
      let [valid, value] = this.checkTile(potentialTiles[i], locations[i][0], locations[i][1], perpendicular)
      if (!valid) {
        return "Invalid move"
      } else {
        score += value as number
      }
    }
    let [valid, value] = this.checkTile(potentialTiles[0], locations[0][0], locations[0][1], direction)
    if (!valid) {
      return "Invalid move"
    } else {
      score += value as number
    }
    if (potentialTiles.length >= 7) {
      score += 50
    }
  }

  checkTile(tile: Tile, i: number, j: number, direction: string) {
    var score, bool;
    if (direction === "horizontal") {
      var [l, r] = [j,j]
      while (l-1 >= 0 && this.board[i][l-1].type === "tile") l--;
      while (r+1 < this.size && this.board[i][r+1].type === "tile") r++;

      [score, bool] = this.checkWord(i, l, i, r)
    } else {
      var [t,b] = [i,i]
      while (t-1 >= 0 && this.board[t-1][j].type === "tile") t--;
      while (b+1 < this.size && this.board[b+1][j].type === "tile") b++;
      [score, bool] = this.checkWord(t, j, b, j)
    }
    return [bool, score]
  }

  checkWord(i1: number, j1: number, i2: number, j2: number) {
    var word = ""
    if (i1 === i2 && j1 === j2) {
      return [0, true]
    } else if (i1 === i2) {
      for (let j = j1; j <= j2; j++) {
        word += this.board[i1][j].letter
      }
    } else if (j1 === j2) {
      for (let i = i1; i <= i2; i++) {
        word += this.board[i][j1].letter
      }
    } else {
      return [0, false]
    }
    
    // check word -> scrabble api

    return [word, true]
  }
}

class Player {
  name: string
  score: number
  hand: Tile[]

  constructor(name: string) {
    this.name = name
    this.score = 0
    this.hand = []
  }
}

export class GameState {
  board: Board
  players: Player[]
  currentPlayerIndex: number
  deck: Tile[]

  constructor(playerNames: string[], board: number) {
    this.board = new Board(board)
    this.players = playerNames.map(name => new Player(name))
    this.currentPlayerIndex = Math.floor(Math.random() * playerNames.length)
    this.deck = shuffleDeck()
  }


  doAction(action: string, playerIndex: number, tile: Tile = null) {
    if (playerIndex !== this.currentPlayerIndex) {
      return "Not your turn"
    }
    if (action === "draw-card") {
      this.drawCard(playerIndex)
    } 
  }

  drawCard(playerIndex: number) {
    // TODO: draw cards
  }




}

const dealCards = (state: GameState) => {
  state.players.forEach(player => {
    for (let i = 0; i < 7; i++) {
      player.hand.push(state.deck.pop())
    }
  })
}




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