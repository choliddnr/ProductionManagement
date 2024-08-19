export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await usePocketbase().collection("products").create(body);
});
