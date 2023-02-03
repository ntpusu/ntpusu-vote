export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            CRYPTO_KEY: process.env.CRYPTO_KEY,
        },
    },
    modules: [
        '@element-plus/nuxt',
    ],
    css: [
        '@/assets/css/main.css',
    ],
});
