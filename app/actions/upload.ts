"use server";

import { requireAdmin } from "@/app/actions/admin";

export async function uploadToCloudinary(
  formData: FormData,
): Promise<{ url: string; public_id: string } | { error: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=aristo/banners&timestamp=${timestamp}`;

  const crypto = await import("crypto");
  const signature = crypto
    .createHash("sha256")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  const uploadBody = new FormData();
  uploadBody.append("file", dataUri);
  uploadBody.append("folder", "aristo/banners");
  uploadBody.append("timestamp", String(timestamp));
  uploadBody.append("api_key", apiKey);
  uploadBody.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: uploadBody },
  );

  if (!res.ok) {
    const err = await res.json();
    return { error: err.error?.message ?? "Upload failed" };
  }

  const data = await res.json();
  return { url: data.secure_url, public_id: data.public_id };
}
