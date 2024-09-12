export type PokemonSprites = {
    front_default: string
    back_default: string
    other: {
        'official-artwork': {
            front_default: string
        },
        showdown: {
            front_default: string
            back_default: string
        }
    }
}

export type PokemonSpeciesFlavorText = {
    flavor_text: string
    language: {
        name: string
    }
    version: {
        name: string
    }
}

export type PokemonSpecies = {
    flavor_text_entries: PokemonSpeciesFlavorText[]
}

export type Pokemon = {
    sprites: PokemonSprites
    id: number
    name: string
    height: number
    weight: number
    types: {
        type: {
            name: string
        }
    }[]
    species: {
        url: string
    }
}

export const getRandomNumber = (max: number) => {
    return Math.round(Math.random() * max) + 1
}

export const getRandomPokemon = async () => {
    const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + getRandomNumber(parseInt(process.env.TOTAL_POKEMON as string)))
    return await resp.json()
}

export const latestPokemonGamesByGeneration = ['scarlet', 'sword', 'sun', 'x']
