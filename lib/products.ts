import { supabase } from "./supabase";
import type { Product, ProductFilters, PaginatedResponse } from "./types";

export async function getProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<Product>> {
  const {
    category,
    collection,
    min_price,
    max_price,
    sort = "newest",
    search,
    page = 1,
    per_page = 12,
    is_featured,
    is_new_arrival,
    is_best_seller,
    is_flash_sale,
  } = filters;

  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*, order:sort_order),
      variants:product_variants(*)
    `,
      { count: "exact" },
    )
    .eq("is_active", true)
    .eq("status", "active");

  if (search) query = query.ilike("name", `%${search}%`);
  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();

    if (cat) {
      query = query.eq("category_id", cat.id);
    } else {
      return { data: [], count: 0, page, per_page, total_pages: 0 };
    }
  }

  if (min_price !== undefined) query = query.gte("base_price", min_price);
  if (max_price !== undefined) query = query.lte("base_price", max_price);
  if (is_featured) query = query.eq("is_featured", true);
  if (is_new_arrival) query = query.eq("is_new_arrival", true);
  if (is_best_seller) query = query.eq("is_best_seller", true);
  if (is_flash_sale) query = query.eq("is_flash_sale", true);

  if (collection) {
    const { data: coll } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", collection)
      .maybeSingle();
    if (coll) {
      const { data: pIds } = await supabase
        .from("product_collections")
        .select("product_id")
        .eq("collection_id", coll.id);
      const ids = (pIds ?? []).map((r: { product_id: string }) => r.product_id);
      if (ids.length === 0)
        return { data: [], count: 0, page, per_page, total_pages: 0 };
      query = query.in("id", ids);
    }
  }

  switch (sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "popular":
      query = query.order("total_sold", { ascending: false });
      break;
    case "rating":
      query = query.order("avg_rating", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * per_page;
  query = query.range(from, from + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as Product[],
    count: count ?? 0,
    page,
    per_page,
    total_pages: Math.ceil((count ?? 0) / per_page),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return data as Product | null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("is_active", true)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("is_active", true)
    .eq("status", "active")
    .eq("is_new_arrival", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("is_active", true)
    .eq("status", "active")
    .eq("is_best_seller", true)
    .order("total_sold", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getFlashSaleProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("is_active", true)
    .eq("status", "active")
    .eq("is_flash_sale", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("is_active", true)
    .eq("status", "active")
    .neq("id", productId)
    .limit(limit);

  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Product[];
}
