import { z } from "zod";

export const orderImageRequest = z.object({
  orderId: z.string().min(1),
  image: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive()
});

export type OrderImageRequest = z.infer<typeof orderImageRequest>;
