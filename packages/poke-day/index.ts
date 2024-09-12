import dotenv from 'dotenv';
import { Pokemon, PokemonSpecies, AtpBot, log, latestPokemonGamesByGeneration, getRandomPokemon } from './utils';

dotenv.config();

const fetchImageData = async (pok: Pokemon, bot: AtpBot) => {
    const blobs = await Promise.all([
        bot.uploadImage(pok.sprites.other['official-artwork'].front_default),
        bot.uploadImage(pok.sprites.front_default || pok.sprites.other.showdown.front_default),
        bot.uploadImage(pok.sprites.back_default || pok.sprites.other.showdown.back_default)
    ])

    return blobs
}

const fetchPokemonDescription = async (pok: Pokemon) => {
    const resp = await fetch(pok.species.url)
    const species = await resp.json() as PokemonSpecies
    const filteredDescriptions = species.flavor_text_entries
        .filter(description =>
                description.language.name === 'en' &&
                latestPokemonGamesByGeneration.includes(description.version.name))
    return filteredDescriptions[filteredDescriptions.length - 1]?.flavor_text
}

const getPostMessage = (pok: Pokemon, description: string) => `Number: ${pok.id}
Name: ${pok.name.charAt(0).toUpperCase()}${pok.name.slice(1)}
Type: ${pok.types.map(type => `${type.type.name.charAt(0).toUpperCase()}${type.type.name.slice(1)}`).join(' / ')}
Height: ${(pok.height * 0.1).toFixed(2)}m
Weight: ${(pok.weight * 0.1).toFixed(2)}kg

${description}
`

async function main(event?: any) {
    try {
        const bot = new AtpBot()
        log('=== created bot')
        await bot.login(process.env.BLUESKY_USERNAME!, process.env.BLUESKY_PASSWORD!)
        log('=== authenticated bot')
        const pok = await getRandomPokemon() as Pokemon
        log('=== got random pokemon')
        log(pok)

        const [images, description] = await Promise.all([
            fetchImageData(pok, bot),
            fetchPokemonDescription(pok)
        ])
        
        log(images)
        await bot.post({
            text: getPostMessage(pok, description),
            embed: {
                images: [
                    {
                        image: images?.[0],
                        alt: ''
                    },
                    {
                        image: images?.[1],
                        alt: ''
                    },
                    {
                        image: images?.[2],
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

export const handler = async (event?: any): Promise<any> => {
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