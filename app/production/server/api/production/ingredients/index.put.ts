export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  const id = getQuery(event).id as string;
  return await usePocketbase().collection("ingredients").update(id, data);
});
