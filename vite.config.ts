import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '',
        },
        {
          src: 'public/background.js',
          dest: '',
        },
        {
          src: 'public/content.js',
          dest: '',
        },
        {
          src: 'public/icons',
          dest: '',
        },
      ],
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        sidepanel: resolve(__dirname, 'public/sidepanel.html'),
      },
    },
  },
});
