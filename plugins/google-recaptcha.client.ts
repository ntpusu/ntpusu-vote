import { VueReCaptcha } from 'vue-recaptcha-v3';
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VueReCaptcha, {
        siteKey: "6Ld6-_8lAAAAABa0IOi_1zMvKT-jWZ-z9BTwo_9G",
        loaderOptions: {
            explicitRenderParameters: {
                badge: 'bottomright',
            },
        },
    });
});