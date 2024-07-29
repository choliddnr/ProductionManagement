export default defineEventHandler(async (e) => {
  const body = await readBody(e);
  try {
    const data = await usePocketbase().collection("items").create(body);
    return data;
  } catch (error) {
    throw error;
  }
});
