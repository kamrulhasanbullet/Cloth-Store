import { supabase } from "./supabase";
import type { Collection, Category, Banner } from "./types";

export async function getActiveCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .or("starts_at.is.null,starts_at.lte." + new Date().toISOString())
    .or("ends_at.is.null,ends_at.gt." + new Date().toISOString())
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Collection[];
}

export async function getFeaturedCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Collection[];
}

export async function getCollectionBySlug(
  slug: string,
): Promise<Collection | null> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data as Collection | null;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getHeroBanners(): Promise<Banner[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .eq("placement", "hero")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Banner[];
}
