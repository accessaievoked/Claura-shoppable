export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const shop = url.searchParams.get("shop");
  const handle = url.searchParams.get("handle");

  const HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300", // cache 5 min on CDN
  };

  if (!shop) {
    return new Response(JSON.stringify({ error: "Missing shop" }), { headers: HEADERS });
  }

  try {
    // ── Strategy 1: fetch by handle via public storefront (no auth needed, never expires) ──
    if (handle) {
      const res = await fetch(`https://${shop}/products/${handle}.json`);
      if (res.ok) {
        const data = await res.json();
        const pr = data.product;
        const v = pr?.variants?.[0];
        if (pr && v) {
          return new Response(JSON.stringify({
            title: pr.title,
            handle: pr.handle,
            price: Math.round(parseFloat(v.price) * 100),
            compare_at_price: v.compare_at_price ? Math.round(parseFloat(v.compare_at_price) * 100) : null,
            image: pr.images?.[0]?.src || null,
          }), { headers: HEADERS });
        }
      }
    }

    // ── Strategy 2: fetch by numeric ID via public products.json (no auth needed) ──
    if (id) {
      const cleanId = String(id).replace("gid://shopify/Product/", "").trim();

      // Try fetching all products and find by ID (works for stores with <250 products)
      const res = await fetch(`https://${shop}/products.json?limit=250`);
      if (res.ok) {
        const data = await res.json();
        const pr = (data.products || []).find(p => String(p.id) === cleanId);
        if (pr) {
          const v = pr.variants?.[0];
          return new Response(JSON.stringify({
            title: pr.title,
            handle: pr.handle,
            price: Math.round(parseFloat(v?.price || 0) * 100),
            compare_at_price: v?.compare_at_price ? Math.round(parseFloat(v.compare_at_price) * 100) : null,
            image: pr.images?.[0]?.src || null,
          }), { headers: HEADERS });
        }
      }

      // ── Strategy 3: fall back to Admin API with stored session (may expire, but worth trying) ──
      try {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();
        const session = await prisma.session.findFirst({ where: { shop } });
        await prisma.$disconnect();

        if (session?.accessToken) {
          const gid = `gid://shopify/Product/${cleanId}`;
          const adminRes = await fetch(`https://${shop}/admin/api/2025-04/graphql.json`, {
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

          const adminData = await adminRes.json();
          const p = adminData.data?.product;
          if (p) {
            const variant = p.variants.edges[0]?.node;
            return new Response(JSON.stringify({
              title: p.title,
              handle: p.handle,
              price: Math.round(parseFloat(variant?.price || 0) * 100),
              compare_at_price: variant?.compareAtPrice ? Math.round(parseFloat(variant.compareAtPrice) * 100) : null,
              image: p.featuredImage?.url || null,
            }), { headers: HEADERS });
          }
        }
      } catch (adminErr) {
        console.warn("api.product: Admin API fallback failed:", adminErr.message);
      }
    }

    return new Response(JSON.stringify({ error: "Product not found" }), { headers: HEADERS });

  } catch (e) {
    console.error("api.product error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { headers: HEADERS });
  }
};