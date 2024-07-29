export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  return await usePocketbase().collection("ingredients").create(data);
});
