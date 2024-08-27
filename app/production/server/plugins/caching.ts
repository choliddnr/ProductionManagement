export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("afterResponse", async (event, { body }) => {
    // Will run when nitro is being closed
    // console.log("afterResponse", event.method, body);
  });
});
