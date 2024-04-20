import {install} from 'vue3-recaptcha-v2';

export default defineNuxtPlugin((nuxtApp) => {
  const {
      public: {recaptchaSiteKey},
      } = useRuntimeConfig()

  nuxtApp.vueApp.use(install, {
    sitekey: recaptchaSiteKey,
    cnDomains: false,
  });
});