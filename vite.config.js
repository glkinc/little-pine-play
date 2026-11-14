import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import renderContent from './vite-plugins/render-content.js';

// BASE_PATH is set by the deploy workflow (e.g. "/little-pine-play/" while the
// site lives at username.github.io/little-pine-play). Locally and on a custom
// domain it is simply "/".
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [tailwindcss(), renderContent()],
});
