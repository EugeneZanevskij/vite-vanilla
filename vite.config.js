import { defineConfig } from 'vite';
import html from '@rollup/plugin-html';

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
        widget: 'widget.html',  
      },
      output: {
        entryFileNames: 'scripts/[name].js',
        chunkFileNames: 'scripts/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  plugins: [
    html({
      template: ({ attributes, files, publicPath, title }) => {
        return `
          <!DOCTYPE html>
          <html ${attributes.html}>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>${title}</title>
              ${
                files.css
                  ? files.css.map((file) => {
                      return `<link rel="stylesheet" href="${
                        publicPath + file.fileName
                      }">`;
                    }).join('')
                  : ''
              }
            </head>
            <body>
              <div></div>
              ${
                files.js
                  ? files.js.map((file) => {
                    return `<script type="module" src="${
                      publicPath + file.fileName
                    }" ${Object.keys(attributes.script)
                      .map((key) => `${key}="${attributes.script[key]}"`)
                      .join(' ')}></script>`;
                  }).join('')
                  : ''
              }
            </body>
          </html>
        `;
      },
    }),
  ],
  // Specify assets to be copied directly to 'dist'
  assetsInclude: ['data/**'],
});