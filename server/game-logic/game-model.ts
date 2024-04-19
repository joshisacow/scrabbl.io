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

export interface GameObject {
  board: string[][]
  players: Player[]
  currentPlayerIndex: number
  deck: string[]
}
export class GameState {
  board: string[][]
  players: Player[]
  currentPlayerIndex: number
  deck: string[]
  // phase: GamePhase

  constructor(board: string[][], players: Player[], currentPlayerIndex: number, deck: string[]) {
    this.board = board
    this.players = players
    this.currentPlayerIndex = currentPlayerIndex
    this.deck = deck
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

const dealCards = (players: Player[], deck: string[]) => {
  players.forEach(player => {
    for (let i = 0; i < 7; i++) {
      player.hand.push(deck.pop())
    }
  })
}

export interface Config {
  playerCount: number
  board: number
  playerNames: string[]
}

export function createNewGame(config: Config): GameState {
  if (config.playerNames.length < 2 || config.playerNames.length > 4) {
    throw new Error("Must have 2-4 players")
  }
  const board = JSON.parse(JSON.stringify(possibleBoards[config.board]))
  const players = config.playerNames.map(name => new Player(name))
  const currentPlayerIndex = Math.floor(Math.random() * players.length)
  var deck = newDeck()
  dealCards(players, deck)
  return new GameState(board, players, currentPlayerIndex, deck)
}

const config: Config = {
  playerCount: 2,
  board: 0,
  playerNames: ["a", "b"]
}
createNewGame(config)

