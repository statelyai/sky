let SKY_HOST: string | undefined;
let SKY_API_URL: string | undefined;

if (typeof process !== 'undefined') {
  require('dotenv').config();
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
} else if (import.meta.env) {
  // We're likely running in Vite
  if (import.meta.env.VITE_SKY_HOST) {
    SKY_HOST = import.meta.env.VITE_SKY_HOST;
  }
  if (import.meta.env.VITE_SKY_API_URL) {
    SKY_API_URL = import.meta.env.VITE_SKY_API_URL;
  }
}

export { SKY_API_URL, SKY_HOST };
