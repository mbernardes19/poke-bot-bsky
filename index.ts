import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import { CronJob } from 'cron';
import * as process from 'process';

dotenv.config();

type PokemonSprites = {
    front_default: string
}

type Pokemon = {
    sprites: PokemonSprites
    id: number
    name: string
}

// Create a Bluesky Agent 
const agent = new BskyAgent({
    service: 'https://bsky.social',
  })

const getRandomNumber = (max: number) => {
    return Math.round(Math.random() * max) + 1
}

const getRandomPokemon = async () => {
    const resp = await fetch('https://pokeapi.co/api/v2/pokemon/' + getRandomNumber(parseInt(process.env.TOTAL_POKEMON as string)))
    return await resp.json()
}

const log = (message: any) => {
    console.log(`[${new Date().toISOString()}] ${message}`)
}

async function getImageBlob(imageUrl: string) {
    try {
      // Fetch the image from the URL
      const response = await fetch(imageUrl);
  
      // Check if the fetch was successful
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Convert the response into a Blob
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error fetching the image:', error);
    }
  }
  
  // Example usage
  getImageBlob('https://example.com/image.jpg').then((blob) => {
    if (blob) {
      console.log('Blob obtained:', blob);
    }
  });
  

async function main() {
    try {
        await agent.login({ identifier: process.env.BLUESKY_USERNAME!, password: process.env.BLUESKY_PASSWORD!})
        const pok = await getRandomPokemon() as Pokemon
        log(pok)
        const blob = await getImageBlob(pok.sprites.front_default)
        const imageUpload = await agent.uploadBlob(blob, {encoding: 'image/png'})
        log(imageUpload)
        try {
            await agent.post({
                text: `[${pok.id}] ${pok.name.charAt(0).toUpperCase()}${pok.name.slice(1)}`,
                embed: {
                    images: [
                        {
                            image: imageUpload.data.blob,
                            alt: ''
                        }
                    ],
                    $type: 'app.bsky.embed.images'
                }
            })
            log(`Posted successfully`)
        } catch (err) {
            log(`Failed to post: ${err}`)
        }
    } catch (err) {
        log(`Failed to run bot: ${err}`)
    }
}

main();


// Run this on a cron job
const scheduleExpression = process.env.CRONJOB as string; // Run daily at 7:05 in prof

const job = new CronJob(scheduleExpression, main); // change to scheduleExpressionMinute for testing

job.start();