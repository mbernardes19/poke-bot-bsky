import { AtpBot } from './AtpBot'
import { getRandomPokemon, latestPokemonGamesByGeneration, getRandomNumber, Pokemon, PokemonSpecies } from './Pokemon'

export { 
    AtpBot,
    getRandomPokemon,
    latestPokemonGamesByGeneration,
    getRandomNumber,
    Pokemon,
    PokemonSpecies
}

export const log = (message: any) => {
    console.log(`[${new Date().toISOString()}] ${typeof message !== 'string' ? JSON.stringify(message) : message}`)
}