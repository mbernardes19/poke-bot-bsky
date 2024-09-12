import { AtpBot } from './AtpBot'
import { getRandomPokemon, latestPokemonGamesByGeneration, getRandomNumber, Pokemon, PokemonSpecies, PokemonSprites } from './Pokemon'

export { 
    AtpBot,
    getRandomPokemon,
    latestPokemonGamesByGeneration,
    getRandomNumber,
    Pokemon,
    PokemonSpecies,
    PokemonSprites
}

export const log = (message: any) => {
    console.log(`[${new Date().toISOString()}] ${typeof message !== 'string' ? JSON.stringify(message) : message}`)
}