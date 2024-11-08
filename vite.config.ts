import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // @ts-ignore
            '@': path.resolve(__dirname, './src'),
            // @ts-ignore
            '@np': path.resolve(__dirname, './np')
        }
    },
    server: {
        port: 3000
    }
});