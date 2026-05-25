export const loader = async ({ request }) => {
  const { createClient } = await import("@supabase/supabase-js");
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const result = {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlStart: supabaseUrl ? supabaseUrl.substring(0, 30) : "MISSING",
    keyLength: supabaseKey ? supabaseKey.length : 0,
  };

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("videos")
      .select("id, shop_id, status")
      .limit(5);
    result.data = data;
    result.error = error?.message;
    result.count = data?.length;
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { "Content-Type": "application/json" }
  });
};