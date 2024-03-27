// import {install} from 'vue3-recaptcha-v2';

// export default defineNuxtPlugin((nuxtApp) => {
//   nuxtApp.vueApp.use(install, {
//     siteKey: useRuntimeConfig().public.recaptcha.SiteKey,
//     // sitekey: "6LeObKIpAAAAAOyXseaPq1RU9kBVkMuPlK16VYpi",
//     cnDomains: false,
//   });
// });

// import vueRecaptcha from 'vue3-recaptcha-v2';

// export default defineNuxtPlugin((nuxtApp) => {
//   const {
//     public: {recaptcha},
//   } = useRuntimeConfig()
//   nuxtApp.vueApp.use(vueRecaptcha, recaptcha);
// }
// );

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