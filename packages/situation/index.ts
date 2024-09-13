import * as dotenv from 'dotenv';
import OpenAI from 'openai'
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Pokemon, PokemonSprites, log, AtpBot } from './utils';
import { APIGatewayProxyResult } from 'aws-lambda';


type WebhookEvent = {
    body: string
    headers: Record<string, string>
}

type FirehoseEvent = {
    action: 'create'
    path: string
    cid: any
    record: {
        text: string
        $type: string
        langs: string[],
        reply?: {
            parent: {
                cid: string,
                uri: string
            },
            root: {
                cid: string,
                uri: string
            }
        },
        facets:
            {
                $type: string
                index: {
                    byteEnd: number,
                    byteStart: number
                }
                features: {
                    did: string
                    $type: string
                }[]
            }[],
        createdAt: string
    },
    uri: string
}

dotenv.config();

const getPokemonImagesByName = async (name: string): Promise<PokemonSprites> => {
    const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + name.toLowerCase().replace(/[^a-zA-Z0-9- ]/g, '').replace(/\s+/g, '-'))
    const pokemon = await resp.json() as Pokemon
    return pokemon.sprites
}

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})
const systemPrompt = process.env.SYSTEM_PROMPT!

const PokemonSuggestion = z.object({
    name: z.string().toLowerCase(),
    description: z.string()
})

async function main(event: WebhookEvent): Promise<void> {
  try {
    log('=== event' + JSON.stringify(event))
    const eventPayload = JSON.parse(event.body) as FirehoseEvent
    const bot = new AtpBot()
    await bot.login(process.env.BLUESKY_USERNAME!, process.env.BLUESKY_PASSWORD!)

    eventPayload.record.langs
    const prompt = `${eventPayload.record.text.slice(0, 269).replace(/@\S+\s?/,'')}. language:${eventPayload.record.langs.join('')}`
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt},
            { role: 'user', content: prompt}
        ],
        response_format: zodResponseFormat(PokemonSuggestion, 'pokemon')
    })
    console.log('ChatGPT Response:', completion.choices[0].message.parsed);
    const sprites = await getPokemonImagesByName(completion.choices[0].message.parsed?.name!)

    await bot.post({
        message: completion.choices[0].message.parsed?.description!,
        images: [
            {
                url: sprites.other['official-artwork'].front_default,
                alt: completion.choices[0].message.parsed?.description || ''
            },
            {
                url: sprites.front_default || sprites.other.showdown.front_default,
                alt: completion.choices[0].message.parsed?.description || ''
            },
            {
                url: sprites.back_default || sprites.other.showdown.back_default,
                alt: completion.choices[0].message.parsed?.description || ''
            }
        ],
        originalMessage: eventPayload
    })

  } catch (error) {
    throw new Error(`error in main: ${error}`)
  }
}

export const handler = async (event: WebhookEvent): Promise<APIGatewayProxyResult> => {
    log(`Event: ${JSON.stringify(event)}`)
    if (event.headers['x-au-key'] !== process.env.KEY) {
        return {
            statusCode: 401,
            body: JSON.stringify({
              message: 'Unauthenticated'
            }),
          };
    }

    try {
        log(`Created agent`)
        await main(event as WebhookEvent)
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
