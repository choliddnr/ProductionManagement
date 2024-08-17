import { type ItemsTable } from "~/schemas/item.schema";

export default defineEventHandler(async (e) => {
  const id = getQuery(e).id as string;
  const body = await readBody<ItemsTable>(e);

  try {
    const currentData = await usePocketbase().collection("items").getOne(id);
    const lastUpdate = currentData.updated;
    const newUpdate = body.updated.toString();

    if (newUpdate !== lastUpdate) {
      throw createError({
        statusCode: 404,
        statusMessage:
          "Data telah di update sebelumnya. Silahkan perbarui local database dan tinjau kembali perubahannya.",
      });
    }
    const data = await usePocketbase().collection("items").update(id, body);
    return data;
  } catch (error) {
    throw error;
  }
});
