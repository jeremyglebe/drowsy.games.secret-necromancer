import { defineConfig } from 'vite';

export default defineConfig({
    // Relative base so the build works from any static host (e.g. GitHub Pages)
    base: './',
    server: { port: 5173 },
    build: { chunkSizeWarningLimit: 2000 },
});
