// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    preset: "bun",
  },

  extends: [process.env.NUXT_UI_PRO_PATH || "@nuxt/ui-pro", "app/items"],

  modules: ["@nuxt/ui", "@nuxt/fonts", "@vueuse/nuxt", "@pinia/nuxt"],

  pinia: {
    storesDirs: ["./app/items/stores"],
  },

  ui: {
    icons: ["heroicons", "simple-icons"],
    safelistColors: ["primary", "red", "orange", "green"],
  },

  colorMode: {
    disableTransition: true,
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

  compatibilityDate: "2024-07-04",
  vite: {
    optimizeDeps: {
      exclude: ["unicorn-magic"],
    },
  },
});
