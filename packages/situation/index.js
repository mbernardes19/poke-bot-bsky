"use strict";
// import * as dotenv from 'dotenv';
// import OpenAI from 'openai'
// import { Bot } from '@skyware/bot';
// import { zodResponseFormat } from "openai/helpers/zod";
// import { z } from "zod";
// import { getImageBlob, Pokemon, PokemonSprites } from '../../index.js';
// dotenv.config();
// const bot = new Bot({
//     eventEmitterOptions: {
//         pollingInterval: 20
//     }
// })
// const getPokemonImagesByName = async (name: string): Promise<PokemonSprites> => {
//     const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + name)
//     const pokemon = await resp.json() as Pokemon
//     return pokemon.sprites
// }
// const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})
// const systemPrompt = process.env.SYSTEM_PROMPT!
// const PokemonSuggestion = z.object({
//     name: z.string().toLowerCase(),
//     description: z.string()
// })
// // Function to interact with ChatGPT
// async function interactWithChatGPT(): Promise<void> {
//   try {
//     await bot.login({
//         identifier: process.env.BLUESKY_USERNAME!,
//         password: process.env.BLUESKY_PASSWORD!
//     })
//     bot.on('mention', async (post) => {
//         const prompt = post.text.slice(0, 200)
//         const completion = await openai.beta.chat.completions.parse({
//             model: 'gpt-4o-mini',
//             messages: [
//                 { role: 'system', content: systemPrompt},
//                 { role: 'user', content: prompt}
//             ],
//             response_format: zodResponseFormat(PokemonSuggestion, 'pokemon')
//         })
//         console.log('ChatGPT Response:', completion.choices[0].message.parsed);
//         const sprites = await getPokemonImagesByName(completion.choices[0].message.parsed?.name!)
//         post.reply({
//             text: completion.choices[0].message.parsed?.description!,
//             images: [
//                 {
//                     data: sprites.other['official-artwork'].front_default,
//                     alt: completion.choices[0].message.parsed?.description
//                 },
//                 {
//                     data: sprites.front_default,
//                     alt: completion.choices[0].message.parsed?.description
//                 },
//                 {
//                     data: sprites.back_default,
//                     alt: completion.choices[0].message.parsed?.description
//                 }
//             ]
//         })
//     })
//   } catch (error) {
//     if (error) {
//       console.error('Error:', error);
//     } else {
//       console.error('Unexpected Error:', error);
//     }
//   }
// }
// // Example usage
// interactWithChatGPT();
