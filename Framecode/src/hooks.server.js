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

// In-memory rate limit store
const rateLimitStore = new Map();

function rateLimit(ip, path, maxPerMinute) {
  const prefix = path.split("/").slice(0, 3).join("/");
  const key = `${ip}:${prefix}`;
  const now = Date.now();
  const window = 60_000;

  const hits = (rateLimitStore.get(key) ?? []).filter((t) => now - t < window);
  hits.push(now);
  rateLimitStore.set(key, hits);

  return hits.length > maxPerMinute;
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const path = event.url.pathname;

  // ── Rate limiting ─────────────────────────────
  const ip = event.getClientAddress();
  const isAuth = AUTH_ROUTES.some((r) => path.startsWith(r));
  const limited = rateLimit(ip, path, isAuth ? 10 : 60);

  if (limited) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── JWT verification ──────────────────────────
  event.locals.user = null;
  const token = event.cookies.get("fc_token");

  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      event.locals.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        plan: payload.plan ?? "free",
      };
    } else {
      event.cookies.delete("fc_token", { path: "/" });
    }
  }

  // ── Route guard ───────────────────────────────
  const isProtected = PROTECTED.some((p) => path.startsWith(p));
  if (isProtected && !event.locals.user) {
    const redirectTo = encodeURIComponent(path);
    return new Response(null, {
      status: 302,
      headers: { Location: `/auth/login?redirect=${redirectTo}` },
    });
  }

  // ── Security headers ──────────────────────────
  const response = await resolve(event);
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}
