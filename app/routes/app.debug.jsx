import { authenticate } from "../shopify.server";
import { supabase } from "../supabase.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  
  const { data: videos, error } = await supabase
    .from("videos")
    .select("id, shop_id, status")
    .eq("shop_id", shop);

  return Response.json({ 
    sessionShop: shop,
    videosFound: videos?.length || 0,
    videos: videos?.slice(0,3),
    error: error?.message 
  });
};