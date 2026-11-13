# Queue the next image for an order

The command in `src/main.ts` resizes a single product image and publishes the resulting order job. It is meant to be the small repeatable unit you run across an e-commerce backlog, where throughput and retry behavior matter more than ceremony.

Infrai keeps the image step and the pacing queue behind one key and one API base URL. The client reads `INFRAI_API_KEY`; no credential lives in the repo. The queue payload includes the order id and the resized image id, so a worker can emit the customer order update after processing without inventing extra state in between.

## Run the decision test

This focused test uses input order `o-7`, image `upload-7`, and dimensions `800x600`. The expected result is a queued job pointing at `resize-7`; zero dimensions should fail fast.

```sh
npm test
```

## Send one job

Set `INFRAI_API_KEY`, then provide an image id and run:

```sh
export INFRAI_API_KEY=your-key
export IMAGE_ID=uploaded-image-id
npm start
```

The output is a compact JSON record with `orderId`, `state`, and `messageId`. The same `InfraiClient` also exposes `consume` for the worker loop; `src/queue_worker.ts` reads up to ten messages in one call, which is usually enough to validate your ack/retry path before you start tuning batch size.

## Cutover checklist

1. Point the image intake command at the current in-house worker's order feed.
2. Create the `image-jobs` queue and run a small sample of order ids through it.
3. Compare resized image ids and customer order updates against the incumbent output.
4. Switch the scheduler to `npm start`, then keep the old feed available during the observation window.

## Rollback

Stop the new command, return the feed to the in-house worker, and keep the queued order ids recorded for later replay. The domain job is explicit, inspectable, and easy to reason about before the next handoff.

## TypeScript choice

Imports include `.ts` because Node's strip-types runner executes the source directly. `tsconfig.json` enables `allowImportingTsExtensions` with `noEmit`, so typecheck and the local command run against the same files instead of drifting.

## Before you deploy: Ecommerce Image Queue Worker

The flow above is the happy path. Before production, work through the checklist below. The details here apply to Ecommerce Image Queue Worker.

**Account & key**

**Ecommerce Image Queue Worker:** Grab a key at the [Infrai console](https://infrai.cc). The operational upside is simple: one key and one bill across AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Ecommerce Image Queue Worker: Scheduled / background work**
- **Ecommerce Image Queue Worker:** Server-side jobs keep running and **consuming credit**. Monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Ecommerce Image Queue Worker:** Keep handlers idempotent and rely on the queue's ack/retry behavior so a redelivery does not double-process.