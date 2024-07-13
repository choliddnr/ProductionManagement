export default defineEventHandler(async (event) => {
  const id = (getQuery(event).id as string) || undefined;
  if (id) {
    return usePocketbase().collection("items").getOne(id);
  } else {
    return await usePocketbase().collection("items").getFullList();
  }
});
