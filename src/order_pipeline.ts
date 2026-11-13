import type { OrderImageRequest } from "./request_schema.ts";

export type OrderImage = OrderImageRequest;
export type ImageJob = { orderId: string; image: string; state: "queued" };

export function makeImageJob(order: OrderImage, resizedImage: string): ImageJob {
  if (order.width < 1 || order.height < 1) throw new Error("Image dimensions must be positive");
  return { orderId: order.orderId, image: resizedImage, state: "queued" };
}
