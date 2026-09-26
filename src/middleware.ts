import type { MiddlewareHandler } from "astro";
import { VISITOR_COOKIE, cookieOptions, looksLikeVisitorId, newVisitorId } from "./lib/session";

/**
 * Resolve the anonymous demo session for every request, before any page or
 * endpoint runs. This is the only place a visitor id enters the application,
 * which is what makes "ownership comes from the server, never from the
 * client" true by construction rather than by discipline.
 *
 * The visitor row itself is written lazily, the first time the visitor saves
 * something (see ensureVisitor) — a reader who never saves anything leaves no
 * row behind.
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  const existing = context.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = looksLikeVisitorId(existing) ? existing : newVisitorId();
  context.locals.visitorId = visitorId;

  if (visitorId !== existing) {
    context.cookies.set(VISITOR_COOKIE, visitorId, cookieOptions(context.url.protocol === "https:"));
  }

  return next();
};
