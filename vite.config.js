import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        demo: 'widget/demo.html',
      },
      output: {
        entryFileNames: 'scripts/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  // Specify assets to be copied directly to 'dist'
  assetsInclude: ['data/**'],
});