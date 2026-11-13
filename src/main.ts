import { InfraiClient } from "./infra_client.ts";
import { makeImageJob } from "./order_pipeline.ts";
import { orderImageRequest } from "./request_schema.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY");

const order = orderImageRequest.parse({ orderId: process.env.ORDER_ID ?? "order-demo-001", image: process.env.IMAGE_ID ?? "image-demo-001", width: 1200, height: 1200 });
const client = new InfraiClient(key);
const resized = await client.resize(order.image, order.width, order.height);
const job = makeImageJob(order, resized.id);
const published = await client.publish(process.env.IMAGE_QUEUE ?? "image-jobs", JSON.stringify(job));
console.log(JSON.stringify({ orderId: job.orderId, state: job.state, messageId: published.message_id }));
