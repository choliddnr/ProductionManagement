import { z } from "zod";
import type { Item } from "./item.schema";

export const SelfProducedProductSchema = z.object({
  id: z.string(),
  item: z.string(),
  description: z.string(),
});

export type SelfProducedProduct = z.infer<typeof SelfProducedProductSchema>;
