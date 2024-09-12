"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.latestPokemonGamesByGeneration = exports.getRandomPokemon = exports.getRandomNumber = void 0;
const getRandomNumber = (max) => {
    return Math.round(Math.random() * max) + 1;
};
exports.getRandomNumber = getRandomNumber;
const getRandomPokemon = async () => {
    const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + (0, exports.getRandomNumber)(parseInt(process.env.TOTAL_POKEMON)));
    return await resp.json();
};
exports.getRandomPokemon = getRandomPokemon;
exports.latestPokemonGamesByGeneration = ['scarlet', 'sword', 'sun', 'x'];
