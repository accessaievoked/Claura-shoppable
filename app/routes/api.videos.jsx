import { createClient } from "@supabase/supabase-js";
const getSupabase = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = getSupabase();

// Map of custom domains → myshopify domain
// Add more entries here if you have more stores
const DOMAIN_MAP = {
  "claura.in":              "8613a2-5.myshopify.com",
  "www.claura.in":          "8613a2-5.myshopify.com",
};

function resolveShopId(shop) {
  return DOMAIN_MAP[shop] || shop;
}

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
  };

  try {
    const url  = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return new Response(JSON.stringify({ videos: [] }), { headers });
    }

    // Resolve custom domain to myshopify domain if needed
    const shopId = resolveShopId(shop);

    const { data: videos, error } = await supabase
      .from("videos")
      .select("id, title, r2_url, thumbnail_url, product_ids, show_on, views")
      .eq("shop_id", shopId)
      .eq("status", "live")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ videos: videos || [] }), { headers });

  } catch (err) {
    return new Response(
      JSON.stringify({ videos: [], error: err.message }),
      { headers }
    );
  }
};