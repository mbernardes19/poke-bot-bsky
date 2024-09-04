import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();

export type PokemonSprites = {
    front_default: string
    back_default: string
    other: {
        'official-artwork': {
            front_default: string
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

const getRandomNumber = (max: number) => {
    return Math.round(Math.random() * max) + 1
}

const getRandomPokemon = async () => {
    const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + getRandomNumber(parseInt(process.env.TOTAL_POKEMON as string)))
    return await resp.json()
}

const log = (message: any) => {
    console.log(`[${new Date().toISOString()}] ${typeof message !== 'string' ? JSON.stringify(message) : message}`)
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

const fetchImageData = async (pok: Pokemon, agent: BskyAgent) => {
    const blobs = await Promise.all([
        getImageBlob(pok.sprites.other['official-artwork'].front_default),
        getImageBlob(pok.sprites.front_default),
        getImageBlob(pok.sprites.back_default)
    ])
    const uploadedImages = Promise.all([
        agent.uploadBlob(blobs[0], {encoding: 'image/png'}),
        agent.uploadBlob(blobs[1], {encoding: 'image/png'}),
        agent.uploadBlob(blobs[2], {encoding: 'image/png'})
    ])
    return uploadedImages
}

const fetchProductDescription = async (pok: Pokemon) => {
    const resp = await fetch(pok.species.url)
    const species = await resp.json() as PokemonSpecies
    return species.flavor_text_entries.find(description => description.language.name === 'en' && description.version.name === 'sword')?.flavor_text || ''
}

async function main(agent: BskyAgent) {
    try {
        await agent.login({ identifier: process.env.BLUESKY_USERNAME!, password: process.env.BLUESKY_PASSWORD!})
        const pok = await getRandomPokemon() as Pokemon
        log(pok)

        const [images, description] = await Promise.all([
            fetchImageData(pok, agent),
            fetchProductDescription(pok)
        ])
        
        log(images)
            await agent.post({
                text: `Number: ${pok.id}
Name: ${pok.name.charAt(0).toUpperCase()}${pok.name.slice(1)}
Type: ${pok.types.map(type => `${type.type.name.charAt(0).toUpperCase()}${type.type.name.slice(1)}`).join(' / ')}
Height: ${(pok.height * 0.1).toFixed(2)}m
Weight: ${pok.weight * 0.1}kg

${description}
`,
                embed: {
                    images: [
                        {
                            image: images?.[0].data.blob,
                            alt: ''
                        },
                        {
                            image: images?.[1].data.blob,
                            alt: ''
                        },
                        {
                            image: images?.[2].data.blob,
                            alt: ''
                        }
                    ],
                    $type: 'app.bsky.embed.images'
                }
            })
    } catch (err) {
        log(`error in main: ${err}`)
        throw new Error(`error in main: ${err}`)
    }
}

export const handler = async (): Promise<APIGatewayProxyResult> => {
    try {
        // Create a Bluesky Agent 
        const agent = new BskyAgent({
            service: 'https://bsky.social',
        })
        log(`Created agent`)
        await main(agent)
        log(`Posted successfully`)
        return {
            statusCode: 200,
            body: JSON.stringify({
              message: 'Posted successfully',
            }),
          };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
              message: 'Failed to post' + err,
            }),
          };
    }
};

handler()