import * as dotenv from 'dotenv';
import OpenAI from 'openai'
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Pokemon, PokemonSprites, log, AtpBot } from './utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

type FirehoseEvent = {
    action: 'create'
    path: string
    cid: any
    record: {
        text: string
        $type: string
        langs: string[]
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
            }[]
        createdAt: string
    },
    uri: string
}

dotenv.config();

const getPokemonImagesByName = async (name: string): Promise<PokemonSprites> => {
    const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + name)
    const pokemon = await resp.json() as Pokemon
    return pokemon.sprites
}

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})
const systemPrompt = process.env.SYSTEM_PROMPT!

const PokemonSuggestion = z.object({
    name: z.string().toLowerCase(),
    description: z.string()
})

async function main(event: FirehoseEvent): Promise<void> {
  try {
    const bot = new AtpBot()
    await bot.login(process.env.BLUESKY_USERNAME!, process.env.BLUESKY_PASSWORD!)

    const prompt = event.record.text.slice(0, 200)
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
        reply: {
            parent: {
                uri: event.uri,
                cid: event.cid
            },
            root: {
                uri: event.uri,
                cid: event.cid
            }
        },
        text: completion.choices[0].message.parsed?.description!,
        images: [
            {
                data: sprites.other['official-artwork'].front_default,
                alt: completion.choices[0].message.parsed?.description
            },
            {
                data: sprites.front_default,
                alt: completion.choices[0].message.parsed?.description
            },
            {
                data: sprites.back_default,
                alt: completion.choices[0].message.parsed?.description
            }
        ]
    })
  } catch (error) {
    if (error) {
      console.error('Error:', error);
    } else {
      console.error('Unexpected Error:', error);
    }
  }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    log(`Event: ${event.body}`)
    try {
        log(`Created agent`)
        await main(JSON.parse(event.body!) as FirehoseEvent)
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
