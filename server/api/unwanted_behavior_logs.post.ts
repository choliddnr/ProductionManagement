export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return usePocketbase().collection("unwanted_behavior_logs").create(body);
});
