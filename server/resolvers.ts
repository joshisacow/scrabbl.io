import { GameState, Action, createNewGame, Config } from './game-logic/game-model'
import { gameStates, users, waitingRooms } from './server'

const fetchGameState = async (gameId: string): Promise<GameState> => {
    const state = await gameStates.findOne({ gameId: gameId })
    if (!state) {
        throw new Error("Game not found")
    }
    return new GameState(state.board, state.players, state.currentPlayerIndex, state.deck, state.swap)
}

const saveGameState = async (gameId: string, state: GameState) => {
    await gameStates.updateOne(
        { gameId: gameId }, 
        { $set: {
            board: state.board,
            players: state.players,
            currentPlayerIndex: state.currentPlayerIndex,
            deck: state.deck,
            swap: state.swap
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
            const room = await waitingRooms.findOne({ gameId: gameId })
            if (room && room.config.playerNames.length < room.config.playerCount && !room.config.playerNames.includes(playerName)) {
                await waitingRooms.updateOne(
                    { gameId: gameId },
                    { $push: { 'config.playerNames': playerName } }
                )
                return true
            }
            return false
        },
        startGame: async (_: any, { gameId }: { gameId: string }) => {
            console.log("startGame", gameId)
            const room = await waitingRooms.findOne({ gameId: gameId })
            console.log(room)
            const state = createNewGame(room.config)
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