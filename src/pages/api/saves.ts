import type { APIRoute } from "astro";
import { broadcastSaveChange } from "../../lib/events";
import { addSave, countSaves, getItemById, getSave, removeSave, setNote } from "../../lib/queries";
import { isVisible } from "../../lib/outline";

/**
 * The one mutation endpoint: save, unsave, write a note, clear a note.
 *
 * Three rules, and they are the whole of the security story here:
 *
 *   1. The visitor is `locals.visitorId`, resolved by the middleware from an
 *      httpOnly cookie. The request body is never consulted for identity, so
 *      a crafted form cannot address another visitor's rows.
 *   2. Astro's same-origin check runs before this handler on every non-GET
 *      request, which is what stops another site POSTing here on a visitor's
 *      behalf. CI re-checks that both halves of it still work after a deploy.
 *   3. Every input is validated before it reaches the database, and a rejected
 *      write says so in the redirect rather than reporting a success that did
 *      not happen.
 */

export const NOTE_LIMIT = 2000;

/** Fixed outcomes. The redirect carries a key, never visitor text. */
export type Outcome =
  | "saved"
  | "removed"
  | "note-saved"
  | "note-cleared"
  | "error-unknown-item"
  | "error-not-saved"
  | "error-note-too-long"
  | "error-bad-request";

/** Only same-site paths, so `return` cannot be used as an open redirect. */
function safeReturn(value: unknown): string {
  const path = typeof value === "string" ? value : "";
  return /^\/(?!\/)[\w\-./]*\/?(\?[\w\-=&.%/:+]*)?$/.test(path) ? path : "/saved/";
}

function back(redirect: (path: string, status: 303) => Response, to: string, outcome: Outcome) {
  const url = new URL(to, "http://local");
  url.searchParams.set("status", outcome);
  return redirect(`${url.pathname}${url.search}${url.hash}`, 303);
}

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const visitorId = locals.visitorId;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response("expected a form submission", { status: 400 });
  }

  const to = safeReturn(form.get("return"));
  const action = String(form.get("action") ?? "");
  const itemId = String(form.get("item") ?? "");

  const item = getItemById(itemId);
  if (!item || !isVisible(item)) return back(redirect, to, "error-unknown-item");

  let outcome: Outcome;
  switch (action) {
    case "save":
      addSave(visitorId, item.id);
      outcome = "saved";
      break;
    case "remove":
      removeSave(visitorId, item.id);
      outcome = "removed";
      break;
    case "note": {
      const raw = form.get("note");
      const note = typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
      if (note.length > NOTE_LIMIT) {
        outcome = "error-note-too-long";
        break;
      }
      // Writing a note on something not yet saved saves it too — the note is
      // the reason you wanted it kept.
      if (!getSave(visitorId, item.id)) addSave(visitorId, item.id);
      outcome = setNote(visitorId, item.id, note)
        ? note === ""
          ? "note-cleared"
          : "note-saved"
        : "error-not-saved";
      break;
    }
    default:
      outcome = "error-bad-request";
  }

  if (!outcome.startsWith("error-")) {
    broadcastSaveChange({ visitorId, savedCount: countSaves(visitorId) });
  }
  return back(redirect, to, outcome);
};
