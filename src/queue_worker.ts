import { InfraiClient } from "./infra_client.ts";

export async function runWorker(client: InfraiClient, queue: string): Promise<number> {
  const result = await client.consume(queue, 10);
  return result.messages.length;
}
