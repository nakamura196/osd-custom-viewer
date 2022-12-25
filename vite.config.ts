import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // >>> start
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "my-vue-libs",
      fileName: (format) => `my-vue-libs-${format}.js`
    },
    rollupOptions: {
      external: "vue",
      output: {
        globals: {
          vue: "Vue",
        }
      }
    }
  }
  // <<< end
})
