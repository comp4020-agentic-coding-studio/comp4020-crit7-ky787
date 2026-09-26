import { randomBytes } from "node:crypto";

/**
 * Anonymous demo sessions.
 *
 * There is no login here and no real ANU identity. A visitor is a random id
 * the server generates and hands back in an httpOnly cookie; every read and
 * write of personal state resolves ownership from that cookie server-side.
 * Nothing a client submits — a form field, a query string, a JSON body — is
 * ever accepted as a visitor id, so one visitor cannot name another's session
 * and read or edit their notes.
 */

export const VISITOR_COOKIE = "sto_visitor";

/** 192 bits from the platform CSPRNG: not guessable, not enumerable. */
export function newVisitorId(): string {
  return randomBytes(24).toString("base64url");
}

/** A cookie value that did not come from newVisitorId is not a session. */
export function looksLikeVisitorId(value: string | undefined): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{32}$/.test(value);
}

export const COOKIE_MAX_AGE_DAYS = 180;

export const cookieOptions = (secure: boolean) =>
  ({
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
  }) as const;
