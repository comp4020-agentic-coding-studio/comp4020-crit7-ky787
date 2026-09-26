import { EventEmitter } from "node:events";

// One process, one bus: every open SSE connection subscribes here. This only
// works because the app runs on exactly one machine (see fly.toml) — a second
// machine would have its own bus and clients would miss events.
//
// Events carry the visitor they belong to, and /api/events compares that
// against the session it resolved from the cookie before writing anything to
// the stream. Filtering happens on the server: a connection is never sent
// another visitor's activity and then trusted to ignore it.
export const bus = new EventEmitter();
bus.setMaxListeners(0);

export type SaveEvent = {
  visitorId: string;
  savedCount: number;
};

export function broadcastSaveChange(event: SaveEvent): void {
  bus.emit("saves", event);
}
