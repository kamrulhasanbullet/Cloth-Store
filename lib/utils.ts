import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "BDT"): string {
  if (currency === "BDT") {
    return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );
}

export function formatDate(
  dateStr: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(dateStr).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}\u2026`;
}

export function getDiscountPercent(original: number, sale: number): number {
  if (!original || !sale || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function getEffectivePrice(
  basePrice: number,
  salePrice: number | null,
): number {
  if (salePrice !== null && salePrice < basePrice) return salePrice;
  return basePrice;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `ORD-${yymmdd}-${rand}`;
}

export function getStockStatus(
  qty: number,
  threshold = 5,
): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty === 0) return "out_of_stock";
  if (qty <= threshold) return "low_stock";
  return "in_stock";
}

export function calcCartSummary(
  items: Array<{ quantity: number; unit_price: number }>,
  discount = 0,
): {
  subtotal: number;
  shipping_fee: number;
  discount: number;
  tax: number;
  total: number;
  item_count: number;
} {
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const item_count = items.reduce((s, i) => s + i.quantity, 0);
  const shipping_fee = subtotal >= 1500 ? 0 : 80;
  const tax = 0;
  const total = subtotal + shipping_fee - discount + tax;
  return { subtotal, shipping_fee, discount, tax, total, item_count };
}

export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function getImageUrl(url: string, width = 800): string {
  if (!url)
    return "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg";
  if (url.includes("res.cloudinary.com")) {
    return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
  }
  return url;
}

export const BD_DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
] as const;

export const BD_DISTRICTS: Record<string, string[]> = {
  Dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Manikganj",
    "Munshiganj",
    "Narsingdi",
    "Tangail",
  ],
  Chittagong: [
    "Chittagong",
    "Cox's Bazar",
    "Comilla",
    "Noakhali",
    "Feni",
    "Lakshmipur",
    "Chandpur",
  ],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rajshahi: [
    "Rajshahi",
    "Chapainawabganj",
    "Naogaon",
    "Natore",
    "Sirajganj",
    "Pabna",
    "Bogra",
    "Joypurhat",
  ],
  Khulna: [
    "Khulna",
    "Jessore",
    "Satkhira",
    "Bagerhat",
    "Chuadanga",
    "Kushtia",
    "Meherpur",
    "Magura",
    "Jhenaidah",
    "Narail",
  ],
  Barisal: [
    "Barisal",
    "Patuakhali",
    "Bhola",
    "Pirojpur",
    "Barguna",
    "Jhalokati",
  ],
  Rangpur: [
    "Rangpur",
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Thakurgaon",
  ],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

export const PRODUCT_SIZES_CLOTHING = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
];
export const PRODUCT_SIZES_PANTS = [
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
];
