import type { APIRoute } from "astro";
import { type SaveEvent, bus } from "../../lib/events";

// The live channel the starter shipped, kept and given this app's job: when a
// visitor saves or unsaves something in one tab, their other tabs update their
// saved count without a reload. Server-sent events are one-directional and
// plain HTTP, which is the simplest thing that works everywhere.
//
// The stream is per session. The handler closes over the visitor id resolved
// from the cookie by the middleware and drops every event that is not theirs,
// so no connection can observe another visitor's activity.
export const GET: APIRoute = ({ locals }) => {
  const visitorId = locals.visitorId;
  let onSave: (event: SaveEvent) => void;
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<string>({
    start(controller) {
      // an opening comment so the client (and the post-deploy CI probe) sees
      // bytes immediately, and a periodic one so proxies don't drop the
      // connection as idle
      controller.enqueue(": connected\n\n");
      heartbeat = setInterval(() => controller.enqueue(": ping\n\n"), 30_000);
      onSave = (event) => {
        if (event.visitorId !== visitorId) return;
        controller.enqueue(`event: saves\ndata: ${JSON.stringify({ savedCount: event.savedCount })}\n\n`);
      };
      bus.on("saves", onSave);
    },
    cancel() {
      clearInterval(heartbeat);
      bus.off("saves", onSave);
    },
  });

  return new Response(stream.pipeThrough(new TextEncoderStream()), {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
    },
  });
};
