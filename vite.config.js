import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        demo: 'demo.html',
        demo1: 'demo_1.html',
        demo2: 'demo_2.html',
        demo3: 'demo_3.html',
        widget: 'widget/widget.html',  
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