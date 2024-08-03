export default defineEventHandler(async () => {
  return await usePocketbase().collection("customers").getFullList();
});
