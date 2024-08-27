export default defineNuxtConfig({
  components: [
    {
      path: "./components",
      prefix: "Production",
    },
  ],
  nitro: {
    storage: {
      productionDisk: {
        driver: "fs",
        base: "./app/production/data",
      },
      productionMemory: {
        driver: "memory",
      },
    },
  },
});
