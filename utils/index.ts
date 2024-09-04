import { Pokemon } from "../index.js"

export const getRandomNumber = (max: number) => {
    return Math.round(Math.random() * max) + 1
}

export const getRandomPokemon = async (): Promise<Pokemon> => {
    const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + getRandomNumber(parseInt(process.env.TOTAL_POKEMON as string)))
    return await resp.json() as Pokemon
}
