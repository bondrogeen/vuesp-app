import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url';
import VueRouter from "unplugin-vue-router/vite";

const pathPages = fileURLToPath(new URL('./frontend/pages', import.meta.url))
const pathFrontend = fileURLToPath(new URL('./frontend', import.meta.url))

// https://vitejs.dev/config
export default defineConfig({
    plugins: [VueRouter({ routesFolder: pathPages }), vue(), tailwindcss(),],
    resolve: {
        alias: {
            '@': pathFrontend,
        },
    },
    server: {
        allowedHosts: ['vuesp.ru', 'test.vuesp.ru', 'home.vuesp.ru'],
        host: '0.0.0.0',
        // port: 5173,
        proxy: {
            '/api/v1': {
                target: 'http://localhost:3005',
                changeOrigin: true,
            },
            '/proxy': {
                target: 'http://localhost:3005',
                changeOrigin: true,
            },
            '/ws/': {
                target: 'ws://localhost:3005',
                ws: true,
                changeOrigin: true
            },
        },
    },
});