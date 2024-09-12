export type PokemonSprites = {
    front_default: string;
    back_default: string;
    other: {
        'official-artwork': {
            front_default: string;
        };
        showdown: {
            front_default: string;
            back_default: string;
        };
    };
};
export type PokemonSpeciesFlavorText = {
    flavor_text: string;
    language: {
        name: string;
    };
    version: {
        name: string;
    };
};
export type PokemonSpecies = {
    flavor_text_entries: PokemonSpeciesFlavorText[];
};
export type Pokemon = {
    sprites: PokemonSprites;
    id: number;
    name: string;
    height: number;
    weight: number;
    types: {
        type: {
            name: string;
        };
    }[];
    species: {
        url: string;
    };
};
export declare const getRandomNumber: (max: number) => number;
export declare const getRandomPokemon: () => Promise<any>;
export declare const latestPokemonGamesByGeneration: string[];
