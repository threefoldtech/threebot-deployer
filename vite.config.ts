import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  base:'/threebot-deployer/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'deployer.js',
      },
    },
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
    nodePolyfills(),
  ],
});
