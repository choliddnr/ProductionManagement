export default defineEventHandler(async (event) => {
  const id = getQuery(event).id as string;
  const body = await readBody(event);
  return usePocketbase().collection("orders").update(id, body);
});
