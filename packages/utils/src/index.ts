import { AtpBot } from "./AtpBot"

export { AtpBot }

export type PokemonSprites = {
    front_default: string
    back_default: string
    other: {
        'official-artwork': {
            front_default: string
        },
        showdown: {
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

export const getRandomPokemon = async (): Promise<Pokemon> => {
    const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + getRandomNumber(parseInt(process.env.TOTAL_POKEMON as string)))
    return await resp.json() as Pokemon
}

export async function getImageBlob(imageUrl: string) {
    try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl);

    // Check if the fetch was successful
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    // Convert the response into a Blob
    const blob = await response.blob();
    return blob;
    } catch (error) {
    console.error('Error fetching the image:', error);
    }
}

export const log = (message: any) => {
    console.log(`[${new Date().toISOString()}] ${typeof message !== 'string' ? JSON.stringify(message) : message}`)
}