import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://Batt0sa1.github.io',
  base: '/conecta-litoral/',
  integrations: [tailwind()],
  output: 'static',
});
