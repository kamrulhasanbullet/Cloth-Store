"use server";

import { getServerSupabase, getServerUserId } from "@/lib/supabase-server";
import type { ApiResponse, Profile, Address } from "@/lib/types";

export async function getProfile(): Promise<Profile | null> {
  const userId = await getServerUserId();
  if (!userId) return null;

  const sb = await getServerSupabase();

  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  return data as Profile | null;
}

export async function updateProfile(
  updates: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>,
): Promise<ApiResponse> {
  const userId = await getServerUserId();
  if (!userId)
    return { data: null, error: "Not authenticated", success: false };

  const sb = await getServerSupabase();

  const { error } = await sb.from("profiles").update(updates).eq("id", userId);

  if (error) return { data: null, error: error.message, success: false };
  return { data: null, error: null, success: true };
}

export async function getAddresses(): Promise<Address[]> {
  const userId = await getServerUserId();
  if (!userId) return [];

  const sb = await getServerSupabase();

  const { data, error } = await sb
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) return [];
  return (data ?? []) as Address[];
}

export async function addAddress(
  address: Omit<Address, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<ApiResponse> {
  const userId = await getServerUserId();
  if (!userId)
    return { data: null, error: "Not authenticated", success: false };

  const sb = await getServerSupabase();

  if (address.is_default) {
    await sb
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const { error } = await sb
    .from("addresses")
    .insert({ ...address, user_id: userId });

  if (error) return { data: null, error: error.message, success: false };
  return { data: null, error: null, success: true };
}

export async function updateAddress(
  id: string,
  updates: Partial<Address>,
): Promise<ApiResponse> {
  const userId = await getServerUserId();
  if (!userId)
    return { data: null, error: "Not authenticated", success: false };

  const sb = await getServerSupabase();

  if (updates.is_default) {
    await sb
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const { error } = await sb
    .from("addresses")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { data: null, error: error.message, success: false };
  return { data: null, error: null, success: true };
}

export async function deleteAddress(id: string): Promise<ApiResponse> {
  const userId = await getServerUserId();
  if (!userId)
    return { data: null, error: "Not authenticated", success: false };

  const sb = await getServerSupabase();

  const { error } = await sb
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { data: null, error: error.message, success: false };
  return { data: null, error: null, success: true };
}
