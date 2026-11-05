import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  assetsInclude: ['**/*.svg'],
  build: {
    outDir: 'dist-single', assetsInlineLimit: 100000000, cssCodeSplit: false, modulePreload: false,
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'app.js', assetFileNames: 'app[extname]' } }
  }
});
