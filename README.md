# Pokémon Bots for Bluesky
This is a monorepo containing a some of the pokémon related bots I'm building to run on Bluesky.

## poke-day
A bot that fetches a random Pokémon from the [PokéAPI](https://pokeapi.co/) and posts it on a Bluesky account. The post consists of general information about the Pokémon and images.

This bot is deployed as a serverless function at AWS (Lambda) and runs daily at 8:00AM BRT through a cronjob that triggers the function.

Bot account: https://bsky.app/profile/pokemonoftheday.bsky.social

## situation
A bot that forwards messages from posts where it's tagged to ChatGPT and sends a reply telling which Pokémon best matches that message. It also makes requests to [PokéAPI](https://pokeapi.co/) to get the Pokémon images.

Although it's working locally, I've not deployed it yet because I'm preparing another application using [atproto-firehose](https://github.com/kcchu/atproto-firehose) to only send posts with mentions to the bot application. This way I'll be able to deploy this and the other bots as serverless functions.

## whosthat
A bot that gets a random Pokémon image from the [PokéAPI](https://pokeapi.co/) and uses [sharp](https://github.com/lovell/sharp) to transform it into a silhouette and post it on Bluesky asking "Who's that Pokémon?".

Still need to implement the part to identify which user answerd correcly and send the original image.
