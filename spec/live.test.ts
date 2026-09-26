import { describe, expect, inject, it } from "vitest";
import { Visitor } from "./session";

/**
 * The starter's live-update channel, kept and given this app's job.
 *
 * It matters here for one reason beyond the feature: the stream is per
 * session, and the filtering happens on the server. A connection must never
 * be sent another visitor's activity, even with a client that would ignore it.
 */
const baseUrl = inject("baseUrl");
const ITEM = "seeing-through-obfuscated-code:claim-boundaries";

const readUntil = async (
  res: Response,
  stop: (seen: string) => boolean,
  ms: number,
): Promise<string> => {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("no response body");
  const decoder = new TextDecoder();
  let seen = "";
  const deadline = Date.now() + ms;
  // The stream only sends a keep-alive every 30 seconds, so a plain read()
  // blocks far past the deadline. Racing it is what lets "nothing arrived"
  // be an assertion rather than a hang.
  const expiry = new Promise<"timeout">((resolve) =>
    setTimeout(() => resolve("timeout"), ms).unref?.(),
  );
  try {
    while (!stop(seen) && Date.now() < deadline) {
      const next = await Promise.race([reader.read(), expiry]);
      if (next === "timeout") break;
      if (next.done) break;
      seen += decoder.decode(next.value, { stream: true });
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return seen;
};

describe("the live stream", () => {
  it("opens immediately and stays open", async () => {
    const res = await fetch(new URL("/api/events", baseUrl));
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    const seen = await readUntil(res, (s) => s.includes(": connected"), 5_000);
    expect(seen).toContain(": connected");
  }, 15_000);

  it("tells a visitor about their own save", async () => {
    const visitor = new Visitor(baseUrl);
    await visitor.get("/");
    const cookie = visitor.cookieValue ?? "";

    const stream = await fetch(new URL("/api/events", baseUrl), { headers: { cookie } });
    const reading = readUntil(stream, (s) => s.includes("event: saves"), 8_000);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await visitor.post("/api/saves", { action: "save", item: ITEM, return: "/saved/" });

    const seen = await reading;
    expect(seen).toContain("event: saves");
    expect(seen).toMatch(/"savedCount":\s*\d+/);
  }, 20_000);

  it("tells nobody else about it", async () => {
    const mine = new Visitor(baseUrl);
    const theirs = new Visitor(baseUrl);
    await mine.get("/");
    await theirs.get("/");

    const eavesdrop = await fetch(new URL("/api/events", baseUrl), {
      headers: { cookie: theirs.cookieValue ?? "" },
    });
    const reading = readUntil(eavesdrop, (s) => s.includes("event: saves"), 3_000);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await mine.post("/api/saves", { action: "save", item: ITEM, return: "/saved/" });

    const seen = await reading;
    expect(seen).not.toContain("event: saves");
  }, 20_000);
});
