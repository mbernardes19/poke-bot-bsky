import dotenv from 'dotenv';
import { Pokemon, getImageBlob, PokemonSpecies, AtpBot, log } from './utils';
import { Agent } from '@atproto/api';

dotenv.config();

const getRandomNumber = (max: number) => {
    return Math.round(Math.random() * max) + 1
}

const getRandomPokemon = async () => {
    const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + getRandomNumber(parseInt(process.env.TOTAL_POKEMON as string)))
    return await resp.json()
}

const fetchImageData = async (pok: Pokemon, agent: Agent) => {
    const blobs = await Promise.all([
        getImageBlob(pok.sprites.other['official-artwork'].front_default),
        getImageBlob(pok.sprites.front_default),
        getImageBlob(pok.sprites.back_default || pok.sprites.other.showdown.back_default)
    ])
    const uploadedImages = Promise.all([
        agent.uploadBlob(blobs[0], {encoding: 'image/png'}),
        agent.uploadBlob(blobs[1], {encoding: 'image/png'}),
        agent.uploadBlob(blobs[2], {encoding: 'image/png'})
    ])
    return uploadedImages
}

const fetchProductDescription = async (pok: Pokemon) => {
    const hasSwordDescription = (description: any) =>
            description.language.name === 'en' &&
                description.version.name === 'sword'

    const hasSunDescription = (description: any) =>
        description.language.name === 'en' &&
            description.version.name === 'sun'

    const resp = await fetch(pok.species.url)
    const species = await resp.json() as PokemonSpecies
    return species.flavor_text_entries.find(
        description =>
            hasSwordDescription(description)
        )?.flavor_text ||
        species.flavor_text_entries.find(
            description =>
                hasSunDescription(description)
        )?.flavor_text || ''
}

async function main(event?: any) {
    try {
        const bot = new AtpBot()
        console.log('=== created bot')
        console.log(process.env.BLUESKY_USERNAME!, process.env.BLUESKY_PASSWORD!)
        await bot.login(process.env.BLUESKY_USERNAME!, process.env.BLUESKY_PASSWORD!)
        console.log('=== authenticated bot')
        const pok = await getRandomPokemon() as Pokemon
        console.log('=== got random pokemon')
        log(pok)

        const [images, description] = await Promise.all([
            fetchImageData(pok, bot.getAgent()),
            fetchProductDescription(pok)
        ])
        
        log(images)
            await bot.post({
                text: `Number: ${pok.id}
Name: ${pok.name.charAt(0).toUpperCase()}${pok.name.slice(1)}
Type: ${pok.types.map(type => `${type.type.name.charAt(0).toUpperCase()}${type.type.name.slice(1)}`).join(' / ')}
Height: ${(pok.height * 0.1).toFixed(2)}m
Weight: ${(pok.weight * 0.1).toFixed(2)}kg

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

export const handler = async (event: any): Promise<any> => {
    log(`Event: ${event}`)
    try {
        log(`Created agent`)
        await main(event)
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
