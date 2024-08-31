import { restoreSnapshot, prefixStorage, snapshot } from "unstorage";
import type { StorageValue, Storage } from "unstorage";
import type { Cache } from "~/types";

export default defineNitroPlugin(async (nitro) => {
  const selfproduced: Cache = await usePocketbase()
    .collection("cache")
    .getFirstListItem('key="self_produced"');
  const spp = prefixStorage(memoryStorage, "self_produced_meta");
  spp.setItem("maxAge", selfproduced.maxAge);
  spp.setItem("lastUpdate", new Date().getTime());
  console.log(
    "nitro plugin",
    await spp.getItem("maxAge"),
    await spp.getItem("lastUpdate")
  );

  // nitro.hooks.hook("afterResponse", async (event, { body }) => {
  // Will run when nitro is being closed
  // console.log("afterResponse", event.method, body);
  // });
});
