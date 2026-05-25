export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const shop = url.searchParams.get("shop");

  const HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  if (!id || !shop) {
    return new Response(JSON.stringify({ error: "Missing id or shop" }), { headers: HEADERS });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Get session for this shop from Supabase sessions table
    const { unauthenticated } = await import("../shopify.server.js");
    const { storefront } = await unauthenticated.storefront(shop);

    const res = await storefront.graphql(`
      query getProduct($id: ID!) {
        product(id: $id) {
          title
          handle
          featuredImage { url }
          variants(first: 1) {
            edges {
              node {
                price { amount }
                compareAtPrice { amount }
              }
            }
          }
        }
      }
    `, { variables: { id: `gid://shopify/Product/${id}` } });

    const data = await res.json();
    const p = data.data?.product;
    if (!p) return new Response(JSON.stringify({ error: "Not found" }), { headers: HEADERS });

    const variant = p.variants.edges[0]?.node;
    const price = Math.round(parseFloat(variant?.price?.amount || 0) * 100);
    const compareAt = variant?.compareAtPrice?.amount
      ? Math.round(parseFloat(variant.compareAtPrice.amount) * 100) : null;

    return new Response(JSON.stringify({
      title: p.title,
      handle: p.handle,
      price,
      compare_at_price: compareAt,
      image: p.featuredImage?.url || null,
    }), { headers: HEADERS });

  } catch (e) {
    console.error("api.product error:", e);
    return new Response(JSON.stringify({ error: e.message }), { headers: HEADERS });
  }
};