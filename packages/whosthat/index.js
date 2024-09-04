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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const dotenv = __importStar(require("dotenv"));
const index_1 = require("../../utils/index");
dotenv.config();
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const pokemon = yield (0, index_1.getRandomPokemon)();
    yield (0, sharp_1.default)(pokemon.sprites.other['official-artwork'].front_default)
        .ensureAlpha() // Ensure the image has an alpha channel (RGBA)
        .raw()
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => {
        const { width, height, channels } = info;
        const pixelData = new Uint8Array(data); // Correct data type for the buffer
        // Iterate over each pixel
        for (let i = 0; i < pixelData.length; i += channels) {
            pixelData[i] = 0; // Red
            pixelData[i + 1] = 0; // Green
            pixelData[i + 2] = 0; // Blue
        }
        return (0, sharp_1.default)(pixelData, {
            raw: {
                width,
                height,
                channels,
            },
        })
            .toFile('out2.png');
    })
        .then(() => {
        console.log('Image processing complete.');
    })
        .catch((err) => {
        console.error('Error processing image:', err);
    });
});
main();
