import { GameState, GameObject, Action, createNewGame, Config } from './game-logic/game-model'
import { gameStates, users } from './server'
import { ObjectId } from 'mongodb'

const fetchGameState = async (gameId: string): Promise<GameState> => {
    const state = await gameStates.findOne({ _id: new ObjectId(gameId) })
    if (!state) {
        throw new Error("Game not found")
    }
    return new GameState(state.board, state.players, state.currentPlayerIndex, state.deck)
}

const saveGameState = async (gameId: string, state: GameState) => {
    await gameStates.updateOne(
        { _id: new ObjectId(gameId) }, 
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
        createGame: async (_: any, args: any) => {
            console.log("createGame", args)
            return args
        },
        joinGame: async (_: any, args: any) => {
            console.log("joinGame", args)
            return args
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
            state.doAction(action)
            await saveGameState(gameId, state)
            return state
        }
    },
};

export default resolvers;