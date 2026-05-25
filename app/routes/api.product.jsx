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
    // Get access token from session storage (Prisma)
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const session = await prisma.session.findFirst({
      where: { shop }
    });
    await prisma.$disconnect();

    if (!session?.accessToken) {
      return new Response(JSON.stringify({ error: "No session for shop" }), { headers: HEADERS });
    }

    // Fetch product from Shopify Admin API
    const gid = `gid://shopify/Product/${id}`;
    const res = await fetch(`https://${shop}/admin/api/2025-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      },
      body: JSON.stringify({
        query: `query {
          product(id: "${gid}") {
            title handle
            featuredImage { url }
            variants(first: 1) {
              edges { node { price compareAtPrice } }
            }
          }
        }`
      })
    });

    const data = await res.json();
    const p = data.data?.product;
    if (!p) return new Response(JSON.stringify({ error: "Product not found" }), { headers: HEADERS });

    const variant = p.variants.edges[0]?.node;
    const price = Math.round(parseFloat(variant?.price || 0) * 100);
    const compareAt = variant?.compareAtPrice ? Math.round(parseFloat(variant.compareAtPrice) * 100) : null;

    return new Response(JSON.stringify({
      title: p.title,
      handle: p.handle,
      price,
      compare_at_price: compareAt,
      image: p.featuredImage?.url || null,
    }), { headers: HEADERS });

  } catch (e) {
    console.error("api.product error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { headers: HEADERS });
  }
};