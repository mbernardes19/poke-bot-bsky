"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.getRandomNumber = exports.latestPokemonGamesByGeneration = exports.getRandomPokemon = exports.AtpBot = void 0;
const AtpBot_1 = require("./AtpBot");
Object.defineProperty(exports, "AtpBot", { enumerable: true, get: function () { return AtpBot_1.AtpBot; } });
const Pokemon_1 = require("./Pokemon");
Object.defineProperty(exports, "getRandomPokemon", { enumerable: true, get: function () { return Pokemon_1.getRandomPokemon; } });
Object.defineProperty(exports, "latestPokemonGamesByGeneration", { enumerable: true, get: function () { return Pokemon_1.latestPokemonGamesByGeneration; } });
Object.defineProperty(exports, "getRandomNumber", { enumerable: true, get: function () { return Pokemon_1.getRandomNumber; } });
const log = (message) => {
    console.log(`[${new Date().toISOString()}] ${typeof message !== 'string' ? JSON.stringify(message) : message}`);
};
exports.log = log;
