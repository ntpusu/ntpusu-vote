export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            CRYPTO_KEY: process.env.CRYPTO_KEY,
            ADMIN_USERNAME: process.env.ADMIN_USERNAME,
        },
    },
    modules: [
        '@element-plus/nuxt',
        '@nuxtjs/tailwindcss',
    ],
});
