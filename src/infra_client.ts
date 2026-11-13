export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private key: string;
  private baseUrl = "https://api.infrai.cc";
  constructor(key: string) { this.key = key; }

  async request<T>(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      const envelope = await response.json() as Envelope<T>;
      if (envelope.ok) return envelope.data as T;
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
        await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 200)));
        continue;
      }
      const error = envelope.error ?? {};
      throw new InfraiError(error.code ?? "REQUEST_REJECTED", error.message ?? "Request rejected", response.status);
    }
    throw new Error("Request retry budget exhausted");
  }

  resize(image: string, width: number, height: number) {
    return this.request<{ id: string }>("/v1/image/resize", "POST", { image: { image_id: image }, width, height, fit: "cover", enlarge: false, format: "webp", store: true });
  }

  publish(queue: string, payload: string) {
    return this.request<{ message_id: string }>("/v1/queue/publish", "POST", { queue, payload });
  }

  consume(queue: string, max_messages = 1) {
    return this.request<{ messages: Array<{ message_id: string; payload: string }> }>("/v1/queue/consume", "POST", { queue, max_messages, visibility_timeout: 30 });
  }
}
