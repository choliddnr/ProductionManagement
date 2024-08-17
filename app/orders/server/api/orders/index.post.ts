export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("body:", body);

  const data = await usePocketbase().send("/c_api/orders", {
    method: "POST",
    body,
  });
  console.log("data", data);

  return data;
});
