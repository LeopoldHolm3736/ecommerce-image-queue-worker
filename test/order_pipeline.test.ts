import assert from "node:assert/strict";
import { makeImageJob } from "../src/order_pipeline.ts";

const job = makeImageJob({ orderId: "o-7", image: "upload-7", width: 800, height: 600 }, "resize-7");
assert.deepEqual(job, { orderId: "o-7", image: "resize-7", state: "queued" });
assert.throws(() => makeImageJob({ orderId: "o-8", image: "upload-8", width: 0, height: 600 }, "resize-8"));
console.log("order decision test passed");
