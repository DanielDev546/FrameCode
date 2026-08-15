import type { Handle } from "@sveltejs/kit";

import { verifyJWT } from "$lib/server/services/auth.js";

const PROTECTED = [
  "/dashboard",
  "/ide",
  "/templates",
  "/meter",
  "/fork",
  "/settings",
];

const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

// ─────────────────────────────────────────────
// IN-MEMORY RATE LIMIT
// ─────────────────────────────────────────────

const rateLimitStore = new Map<string, number[]>();

function rateLimit(ip: string, path: string, maxPerMinute: number) {
  const prefix = path.split("/").slice(0, 3).join("/");

  const key = `${ip}:${prefix}`;

  const now = Date.now();
  const windowMs = 60_000;

  const hits = (rateLimitStore.get(key) ?? []).filter(
    (timestamp) => now - timestamp < windowMs,
  );

  hits.push(now);

  rateLimitStore.set(key, hits);

  return hits.length > maxPerMinute;
}

// ─────────────────────────────────────────────
// HANDLE
// ─────────────────────────────────────────────

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  // ─────────────────────────────────────
  // RATE LIMIT
  // ─────────────────────────────────────

  const ip = event.getClientAddress();

  const isAuth = AUTH_ROUTES.some((route) => path.startsWith(route));

  const limited = rateLimit(ip, path, isAuth ? 10 : 60);

  if (limited) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // ─────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────

  event.locals.user = null;

  const token = event.cookies.get("fc_token");

  if (token) {
    const payload = await verifyJWT(token);

    if (
      payload &&
      typeof payload === "object" &&
      typeof payload.sub === "string"
    ) {
      event.locals.user = {
        id: payload.sub,
        email: typeof payload.email === "string" ? payload.email : "",
        name: typeof payload.name === "string" ? payload.name : "",
        role: typeof payload.role === "string" ? payload.role : "user",
      };
    } else {
      event.cookies.delete("fc_token", {
        path: "/",
      });
    }
  }

  // ─────────────────────────────────────
  // PROTECTED ROUTES
  // ─────────────────────────────────────

  const isProtected = PROTECTED.some((route) => path.startsWith(route));

  if (isProtected && !event.locals.user) {
    const redirectTo = encodeURIComponent(path + event.url.search);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/auth/login?redirect=${redirectTo}`,
      },
    });
  }

  // ─────────────────────────────────────
  // SECURITY HEADERS
  // ─────────────────────────────────────

  const response = await resolve(event);

  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  response.headers.set("X-Content-Type-Options", "nosniff");

  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
};
