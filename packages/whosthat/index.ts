import sharp from 'sharp'
import * as dotenv from 'dotenv';
import { getRandomPokemon } from './utils'

dotenv.config();

const main = async () => {
    const pokemon = await getRandomPokemon()
    await sharp(pokemon.sprites.other['official-artwork'].front_default)
    .ensureAlpha() // Ensure the image has an alpha channel (RGBA)
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const { width, height, channels } = info;
      const pixelData = new Uint8Array(data); // Correct data type for the buffer
  
      // Iterate over each pixel
      for (let i = 0; i < pixelData.length; i += channels) {
        pixelData[i] = 0;   // Red
        pixelData[i + 1] = 0; // Green
        pixelData[i + 2] = 0; // Blue
      }
  
      return sharp(pixelData, {
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
}
main()