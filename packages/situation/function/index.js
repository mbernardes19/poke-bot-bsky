"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dotenv = __importStar(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
const zod_1 = require("openai/helpers/zod");
const zod_2 = require("zod");
const utils_1 = require("./utils");
const cid_1 = require("multiformats/cid");
dotenv.config();
const getPokemonImagesByName = async (name) => {
    const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + name);
    const pokemon = await resp.json();
    return pokemon.sprites;
};
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
const systemPrompt = process.env.SYSTEM_PROMPT;
const PokemonSuggestion = zod_2.z.object({
    name: zod_2.z.string().toLowerCase(),
    description: zod_2.z.string()
});
async function main(event) {
    try {
        (0, utils_1.log)('=== event' + JSON.stringify(event));
        const eventPayload = JSON.parse(event.body);
        const bot = new utils_1.AtpBot();
        await bot.login(process.env.BLUESKY_USERNAME, process.env.BLUESKY_PASSWORD);
        const prompt = eventPayload.record.text.slice(0, 200);
        const completion = await openai.beta.chat.completions.parse({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            response_format: (0, zod_1.zodResponseFormat)(PokemonSuggestion, 'pokemon')
        });
        console.log('ChatGPT Response:', completion.choices[0].message.parsed);
        const sprites = await getPokemonImagesByName(completion.choices[0].message.parsed?.name);
        await bot.post({
            reply: {
                parent: {
                    uri: eventPayload.uri,
                    cid: cid_1.CID.parse(eventPayload.cid).toString()
                },
                root: {
                    uri: eventPayload.uri,
                    cid: cid_1.CID.parse(eventPayload.cid).toString()
                }
            },
            text: completion.choices[0].message.parsed?.description,
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
        });
    }
    catch (error) {
        throw new Error(`error in main: ${error}`);
    }
}
const handler = async (event) => {
    (0, utils_1.log)(`Event: ${JSON.stringify(event)}`);
    try {
        (0, utils_1.log)(`Created agent`);
        await main(event);
        (0, utils_1.log)(`Posted successfully`);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Posted successfully',
            }),
        };
    }
    catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to post' + err,
            }),
        };
    }
};
exports.handler = handler;
