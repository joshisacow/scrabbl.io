import { GameState, GameObject, Action, createNewGame, Config } from './game-logic/game-model'
import { gameStates, users, waitingRooms } from './server'
import { ObjectId } from 'mongodb'

const fetchGameState = async (gameId: string): Promise<GameState> => {
    const state = await gameStates.findOne({ gameId: gameId })
    if (!state) {
        throw new Error("Game not found")
    }
    return new GameState(state.board, state.players, state.currentPlayerIndex, state.deck)
}

const saveGameState = async (gameId: string, state: GameState) => {
    await gameStates.updateOne(
        { gameId: gameId }, 
        { $set: {
            board: state.board,
            players: state.players,
            currentPlayerIndex: state.currentPlayerIndex,
            deck: state.deck
        } },
        { upsert: true }
    )
}

const resolvers = {
    Mutation: {
        createGame: async (_: any, { config }: { config: Config }) => {
            console.log("createGame", config)
            const min = 1000;
            const max = 9999;
            var randomNumber = (Math.floor(Math.random() * (max - min + 1)) + min).toString();
            while (await waitingRooms.findOne({ gameId: randomNumber })) {
                randomNumber = (Math.floor(Math.random() * (max - min + 1)) + min).toString();
            }
            await waitingRooms.insertOne({ gameId: randomNumber, config: config })
            return randomNumber
        },
        joinGame: async (_: any, { gameId, playerName }: { gameId: string, playerName: string }) => {
            console.log("joinGame", gameId, playerName)
            if (!await waitingRooms.findOne({ gameId: gameId })) {
                return false
            }
            // TODO: add checks for player count
            await waitingRooms.updateOne(
                { gameId: gameId },
                { $push: { 'config.playerNames': playerName } }
            )
            return true
        },
        startGame: async (_: any, { gameId, config }: { gameId: string, config: Config }) => {
            console.log("startGame", gameId)
            const state = createNewGame(config)
            await saveGameState(gameId, state)
            return state
        },
        doAction: async (_: any, { gameId, action }: { gameId: string, action: Action }) => {
            console.log("doAction", gameId, action)
            const state = await fetchGameState(gameId)
            let message = state.doAction(action)
            console.log(message)
            await saveGameState(gameId, state)
            return state
        }
    },
};

export default resolvers;