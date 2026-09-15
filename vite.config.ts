import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  cacheDir: '.temp/vite',
  plugins: [
    react(),
    babel({
      include: /[\\/]src[\\/].*\.[jt]sx?(?:$|\?)/,
      presets: [reactCompilerPreset()],
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // Keep Three.js core separate from its renderer and addons.
            {
              name: 'three-core',
              test: /node_modules[\\/]three[\\/]build[\\/]three\.core\.js$/,
            },
            { name: 'three-renderer', test: /node_modules[\\/]three[\\/]/ },
            { name: 'mui', test: /node_modules[\\/](?:@mui|@emotion)[\\/]/ },
            { name: 'vendor', test: /node_modules[\\/]/ },
          ],
        },
      },
    },
  },
})
