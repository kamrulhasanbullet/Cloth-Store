import { getServerSupabase } from "@/lib/supabase-server";

export async function getBannersByPlacement(placement: string) {
  const sb = await getServerSupabase();
  const { data } = await sb
    .from("banners")
    .select("*")
    .eq("placement", placement)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return data ?? [];
}
