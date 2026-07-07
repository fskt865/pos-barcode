/**
 * pos-barcode reserve service — Cloudflare Worker + D1.
 *
 * The web app generates a candidate code client-side, then POSTs it here to be
 * reserved. D1 (SQLite) has a PRIMARY KEY on `code`, so an INSERT either wins
 * (first time that code is seen anywhere) or fails with a UNIQUE violation —
 * which makes global uniqueness atomic even with many people generating at once.
 *
 * Routes:
 *   GET  /            -> { ok: true }
 *   GET  /count       -> { count: <total reserved> }
 *   POST /reserve     body { code } -> 200 { reserved: true, count } | 409 { reserved: false }
 *
 * D1 binding must be named `DB`.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const ALLOWED = "ABCDEFGHJKMNPQRSTUVWXYZ0123456789"; // A–Z minus I,L,O + digits

function isValidCode(code) {
  if (typeof code !== "string" || code.length < 8 || code.length > 12) return false;
  let digits = 0;
  for (const ch of code) {
    if (!ALLOWED.includes(ch)) return false;
    if (ch >= "0" && ch <= "9") digits++;
  }
  return digits >= 3 && digits <= 5; // matches the generator's format
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { ...CORS, "Content-Type": "application/json" },
      });

    try {
      if (request.method === "GET" && url.pathname === "/") {
        return json({ ok: true, service: "pos-barcode reserve" });
      }

      if (request.method === "GET" && url.pathname === "/count") {
        const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM issued_codes").first();
        return json({ count: row ? row.n : 0 });
      }

      if (request.method === "POST" && url.pathname === "/reserve") {
        const body = await request.json().catch(() => ({}));
        const code = body && body.code;
        if (!isValidCode(code)) return json({ reserved: false, error: "bad_format" }, 400);

        try {
          await env.DB.prepare("INSERT INTO issued_codes (code) VALUES (?)").bind(code).run();
        } catch (e) {
          if (/unique/i.test(String(e && e.message ? e.message : e))) {
            return json({ reserved: false }, 409); // already issued somewhere
          }
          throw e;
        }

        const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM issued_codes").first();
        return json({ reserved: true, count: row ? row.n : 0 });
      }

      return json({ error: "not_found" }, 404);
    } catch (e) {
      return json({ error: "server_error", detail: String(e && e.message ? e.message : e) }, 500);
    }
  },
};
