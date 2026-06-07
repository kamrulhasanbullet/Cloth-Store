import { redirect } from "next/navigation";
import { getServerSupabase, getServerUserId } from "@/lib/supabase-server";

export async function requireAuth() {
  const userId = await getServerUserId();

  if (!userId) {
    redirect("/auth/login?redirect=/dashboard");
  }

  return userId;
}

export async function requireAdminUser() {
  const userId = await getServerUserId();

  if (!userId) {
    redirect("/auth/login?redirect=/admin");
  }

  const sb = await getServerSupabase();
  const { data: profile, error } = await sb
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || profile?.role !== "admin") {
    redirect("/");
  }

  return userId;
}
