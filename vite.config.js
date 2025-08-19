import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/',                                //added for deploy '/novi/'
  assetsInclude: ['**/*.mp4', '**/*.mpeg'] //required to tell vite that assets have video sources
})



