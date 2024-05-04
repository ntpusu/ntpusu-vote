// https://nuxt.com/docs/api/configuration/nuxt-config
let baseURL = "http://localhost:3000/api/auth";

if (process.env.VERCEL) {
    switch (process.env.VERCEL_ENV) {
        case "production":
            if (process.env.PRODUCTION_URL) {
                baseURL = process.env.PRODUCTION_URL + "/api/auth";
            } else {
                baseURL = `https://${process.env.VERCEL_GIT_REPO_SLUG}.vercel.app/api/auth`;
            }
            break;
        case "preview":
            baseURL = `https://${process.env.VERCEL_BRANCH_URL}/api/auth`;
            break;
        case "development":
            baseURL = `https://${process.env.VERCEL_URL}/api/auth`;
    }
}

export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            productionUrl: process.env.PRODUCTION_URL,
            pdfUrl: process.env.PDF_URL,
            igPostUrl: process.env.IG_POST_URL,
            recaptchaSiteKey: process.env.RECAPTCHA_V2_INVISIBLE_SITE_KEY,
        },
    },
    modules: [
        "@element-plus/nuxt",
        "@nuxt/image",
        "@nuxtjs/tailwindcss",
        "@sidebase/nuxt-auth",
        "nuxt-security",
        "@nuxtjs/google-fonts",
        "@nuxt/eslint"
    ],
    plugins: [
        "~/plugins/vercel.client.ts",
        "~/plugins/recaptcha.client.ts",
    ],
    app: {
        pageTransition: { name: "page", mode: "out-in" },
    },
    googleFonts: {
        families: {
            "Noto Sans TC": [400, 700],
        },
    },
    auth: {
        /**
         * Whether the module is enabled at all
         */
        isEnabled: true,
        /**
         * Full url at which the app will run combined with the path to authentication. You can set this differently depending on your selected authentication-provider:
         * - `authjs`: You must set the full URL, with origin and path in production. You can leave this empty in development
         * - `local`: You can set a full URL, but can also leave this empty to fallback to the default value of `/api/auth` or set only the path.
         *
         * ### `authjs`
         *
         * `baseURL` can be `undefined` during development but _must_ be set to the combination of origin + path that points to your `NuxtAuthHandler` for production. The origin consists out of:
         * - `scheme`: http / https
         * - `host`: e.g., localhost, example.org, google.com
         * - `port`: _empty_ (implies `:80` for http and `:443` for https), :3000, :8888
         *
         * The path then is a string like `/path/to/auth/api/endpoint/root`.
         *
         * ### `local`
         *
         * Defaults to `/api/auth` for both development and production. Setting this is optional, if you set it you can set it to either:
         * - just a path: Will lead to `nuxt-auth` using `baseURL` as a relative path appended to the origin you deploy to. Example: `/backend/auth`
         * - an origin and a path: Will leav to `nuxt-auth` using `baseURL` as an absolute request path to perform requests to. Example: `https://example.com/auth`
         *
         * Note: If you point to a different origin than the one you deploy to you likely have to take care of CORS: Allowing cross origin requests.
         *
         * @example undefined
         * @example http://localhost:3000
         * @example https://example.org/_auth
         * @example https://my-cool-site.com/api/authentication
         * @default http://localhost:3000/api/auth Default for `authjs` provider in development
         * @default undefined                      Default for `authjs` in production, will result in an error
         * @default /api/auth                      Default for `local` for both production and development
         */
        baseURL: baseURL,
        /**
         * Configuration of the authentication provider. Different providers are supported:
         * - auth.js: OAuth focused provider for non-static Nuxt 3 applications
         * - local: Provider for credentials & token based backends, e.g., written by yourself or provided by something like Laraval
         *
         * Find more about supported providers here: https://sidebase.io/nuxt-auth/v0.6/getting-started
         *
         */
        provider: {
            /**
             * Uses the `authjs` provider to facilitate autnetication. Currently, two providers exclusive are supported:
             * - `authjs`: `next-auth` / `auth.js` based OAuth, Magic URL, Credential provider for non-static applications
             * - `local`: Username and password provider with support for static-applications
             *
             * Read more here: https://sidebase.io/nuxt-auth/v0.6/getting-started
             */
            type: "authjs",
            /**
             * If set to `true`, `authjs` will use either the `x-forwarded-host` or `host` headers instead of `auth.baseURL`.
             *
             * Make sure that reading `x-forwarded-host` on your hosting platform can be trusted.
             * - ⚠ **This is an advanced option.** Advanced options are passed the same way as basic options,
             * but **may have complex implications** or side effects.
             * You should **try to avoid using advanced options** unless you are very comfortable using them.
             * @default false
             */
            trustHost: false,
            /**
             * Select the default-provider to use when `signIn` is called. Setting this here will also effect the global middleware behavior: E.g., when you set it to `github` and the user is unauthorized, they will be directly forwarded to the Github OAuth page instead of seeing the app-login page.
             *
             * @example "github"
             * @default undefined
             */
            defaultProvider: undefined,
            /**
             * Whether to add a callbackUrl to sign in requests. Setting this to a string-value will result in that being used as the callbackUrl path. Setting this to `true` will result in the blocked original target path being chosen (if it can be determined).
             */
            addDefaultCallbackUrl: true,
        },
        /**
         * Configuration of the application-side session.
         */
        session: {
            /**
             * Whether to refresh the session every `X` milliseconds. Set this to `false` to turn it off. The session will only be refreshed if a session already exists.
             *
             * Setting this to `true` will refresh the session every second.
             * Setting this to `false` will turn off session refresh.
             * Setting this to a number `X` will refresh the session every `X` milliseconds.
             *
             * @example 1000
             * @default false
             *
             */
            enableRefreshPeriodically: false,
            /**
             * Whether to refresh the session every time the browser window is refocused.
             *
             * @example false
             * @default true
             */
            enableRefreshOnWindowFocus: true,
        },
        /**
         * Whether to add a global authentication middleware that protects all pages. Can be either `false` to disable, `true` to enabled
         * or an object to enable and apply extended configuration.
         *
         * If you enable this, everything is going to be protected and you can selectively disable protection for some pages by specifying `definePageMeta({ auth: false })`
         * If you disable this, everything is going to be public and you can selectively enable protection for some pages by specifying `definePageMeta({ auth: true })`
         *
         * Read more on this topic [in the page protection docs](https://sidebase.io/nuxt-auth/v0.6/application-side/protecting-pages#global-middleware).
         *
         * @example true
         * @example { allow404WithoutAuth: true }
         * @default false
         */
        globalAppMiddleware: {
            /**
             * Whether to add a global authentication middleware that protects all pages.
             *
             * @example true
             * @default false
             */
            isEnabled: true,
            /**
             * Whether to enforce authentication if the target-route does not exist. Per default the middleware redirects
             * to Nuxts" default 404 page instead of forcing a sign-in if the target does not exist. This is to avoid a
             * user-experience and developer-experience of having to sign-in only to see a 404 page afterwards.
             *
             * Note: Setting this to `false` this may lead to `vue-router` + node related warnings like: "Error [ERR_HTTP_HEADERS_SENT] ...",
             * this may be related to https://github.com/nuxt/framework/issues/9438.
             *
             * @example false
             * @default true
             */
            allow404WithoutAuth: true,
            /**
             * Whether to automatically set the callback url to the page the user tried to visit when the middleware stopped them. This is useful to disable this when using the credentials provider, as it does not allow a `callbackUrl`. Setting this
             * to a string-value will result in that being used as the callbackUrl path. Note: You also need to set the global `addDefaultCallbackUrl` setting to `false` if you want to fully disable this.
             *
             * @example false
             * @example /i-caught-you-but-now-you-are-signed-in
             * @default true
             */
            addDefaultCallbackUrl: true,
        }
    },
    security: {
        headers: {
            crossOriginEmbedderPolicy: "unsafe-none",
        },
        xssValidator: false,
        corsHandler: {
            methods: ["GET", "PUT", "POST", "DELETE"],
        }
    },
    devtools: {
        enabled: true,
        timeline: {
            enabled: true,
        },
    }
});
