let SKY_HOST = 'stately-sky-beta.mellson.partykit.dev';
let SKY_API_URL = 'https://stately.ai/registry/api/sky';
let SKY_API_KEY: string | undefined = undefined;

if (typeof process !== 'undefined') {
  // require('dotenv').config();
  // We're likely running in Node.js
  if (process.env.NEXT_PUBLIC_SKY_HOST) {
    SKY_HOST = process.env.NEXT_PUBLIC_SKY_HOST;
  } else if (process.env.SKY_HOST) {
    SKY_HOST = process.env.SKY_HOST;
  }
  if (process.env.NEXT_PUBLIC_SKY_API_URL) {
    SKY_API_URL = process.env.NEXT_PUBLIC_SKY_API_URL;
  } else if (process.env.SKY_API_URL) {
    SKY_API_URL = process.env.SKY_API_URL;
  }
  if (process.env.NEXT_PUBLIC_SKY_API_KEY) {
    SKY_API_KEY = process.env.NEXT_PUBLIC_SKY_API_KEY;
  } else if (process.env.SKY_API_KEY) {
    SKY_API_KEY = process.env.SKY_API_KEY;
  }
} else if (import.meta.env) {
  // We're likely running in Vite
  if (import.meta.env.VITE_SKY_HOST) {
    SKY_HOST = import.meta.env.VITE_SKY_HOST;
  }
  if (import.meta.env.VITE_SKY_API_URL) {
    SKY_API_URL = import.meta.env.VITE_SKY_API_URL;
  }
  if (import.meta.env.VITE_SKY_API_KEY) {
    SKY_API_KEY = import.meta.env.VITE_SKY_API_KEY;
  }
}

export { SKY_API_KEY, SKY_API_URL, SKY_HOST };
