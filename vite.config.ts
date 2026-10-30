import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
// The build is a single index.html (JS and CSS inlined) so it can be opened straight
// from disk on Windows without a web server.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
})
