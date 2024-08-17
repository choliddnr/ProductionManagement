import { z } from "zod";
export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  whatsapp: z.string().min(10),
  address: z.string().min(25),
  store_name: z.string().optional(),
});

export type Customer = z.output<typeof customerSchema>;
