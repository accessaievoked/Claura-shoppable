import { createClient } from "@supabase/supabase-js";

// ── Module-level singleton: reused across warm invocations ──
let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        global: { fetch }, // use native fetch — no extra overhead
        auth: { persistSession: false }, // no session storage on server
      }
    );
  }
  return _supabase;
}

// ── In-memory cache: avoids hitting Supabase on every request ──
// Key: shopId, Value: { data, expiresAt }
const MEM_CACHE = new Map();
const MEM_TTL_MS = 60 * 1000; // 60 seconds in-memory

function getCached(shopId) {
  const entry = MEM_CACHE.get(shopId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { MEM_CACHE.delete(shopId); return null; }
  return entry.data;
}
function setCache(shopId, data) {
  MEM_CACHE.set(shopId, { data, expiresAt: Date.now() + MEM_TTL_MS });
}

// ── Domain → myshopify mapping ──
const DOMAIN_MAP = {
  "claura.in":     "8613a2-5.myshopify.com",
  "www.claura.in": "8613a2-5.myshopify.com",
};
function resolveShopId(shop) {
  return DOMAIN_MAP[shop] || shop;
}

// ── CORS + cache headers ──
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export const loader = async ({ request }) => {
  // Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS });
  }

  const headers = {
    "Content-Type": "application/json",
    ...CORS,
    // Browser caches for 5 min, CDN serves stale for 60 min while revalidating
    "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    // Vercel edge caches for 5 min
    "CDN-Cache-Control": "public, max-age=300",
    "Vercel-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
  };

  const url    = new URL(request.url);
  const shop   = url.searchParams.get("shop");
  const empty  = JSON.stringify({ videos: [] });

  if (!shop) {
    return new Response(empty, { headers });
  }

  const shopId = resolveShopId(shop);

  // ── 1. Serve from in-memory cache instantly (0ms) ──
  const cached = getCached(shopId);
  if (cached) {
    return new Response(cached, {
      headers: { ...headers, "X-Cache": "HIT" },
    });
  }

  try {
    const { data: videos, error } = await getSupabase()
      .from("videos")
      .select("id, title, r2_url, thumbnail_url, product_ids, show_on, views")
      .eq("shop_id", shopId)
      .eq("status", "live")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const body = JSON.stringify({ videos: videos || [] });
    setCache(shopId, body); // store raw JSON string

    return new Response(body, {
      headers: { ...headers, "X-Cache": "MISS" },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ videos: [], error: err.message }),
      { headers }
    );
  }
};