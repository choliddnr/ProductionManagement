import { z } from "zod";

export const orderStatuses = [
  "order accepted",
  "waiting",
  "under production",
  "ready",
  "done",
] as const;

export const today = new Date();
today.setHours(0, 0, 0, 0); // Set time to start of the day

export const orderSchema = z.object({
  id: z.string().optional(),
  customer: z.string(),
  date: z.date().refine(
    (d) => {
      d.setHours(0, 0, 0, 0);
      return d <= today;
    },
    {
      message: "Pilih hari ini atau beberapa hari sebelumnya!",
    }
  ),
  note: z.string().optional(),
  status: z.enum(orderStatuses),
  products: z
    .array(
      z.object({
        product: z.string(),
        quantity: z.number().positive(),
        note: z.string().optional(),
      })
    )
    .min(1, "Minimal memesan satu produk!"),
});

export type Order = Omit<z.output<typeof orderSchema>, "products"> & {
  total: number;
  ready: number;
};

export type OrderProducts = {
  id: string;
  order: string;
  product: string;
  quantity: number;
  note?: string;
  is_ready: boolean;
};
