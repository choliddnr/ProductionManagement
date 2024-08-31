// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    "@nuxt/ui-pro",
    "app/base",
    // "app/items",
    // "app/customers",
    // "app/orders",
    // "app/products",
    "app/production",
  ],

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@pinia/nuxt",
  ],

  pinia: {
    storesDirs: [
      // "./app/items/stores",
      // "./app/orders/stores",
      // "./app/customers/stores",
      // "./app/products/stores",
      "./app/production/stores",
    ],
  },

  ui: {
    icons: ["heroicons", "simple-icons"],
    safelistColors: ["primary", "red", "orange", "green"],
  },

  colorMode: {
    disableTransition: true,
  },

  routeRules: {
    // Temporary workaround for prerender regression. see https://github.com/nuxt/nuxt/issues/27490
    "/": { prerender: true },
  },

  devtools: {
    enabled: true,
  },

  typescript: {
    strict: false,
  },

  future: {
    compatibilityVersion: 4,
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  compatibilityDate: "2024-07-11",
  nitro: {
    storage: {
      memory: {
        driver: "memory",
      },
      disk: {
        driver: "fs",
        base: "./data",
      },
    },
  },
});
