import { z } from "zod";

export const orderStatuses = [
  "order accepted",
  "waiting",
  "under production",
  "ready",
  "done",
] as const;

export const orderSchema = z.object({
  id: z.string().optional(),
  customer: z.string(),
  note: z.string(),
  status: z.enum(orderStatuses),
  products: z.array(
    z.object({
      product: z.string(),
      qty: z.number(),
      note: z.string().optional(),
    })
  ),
});

export type Order = Omit<z.output<typeof orderSchema>, "products">;

export type OrderProducts = {
  order: string;
  product: string;
  qty: number;
  note?: string;
  is_ready: boolean;
};
