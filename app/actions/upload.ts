"use server";
import { requireAdmin } from "@/lib/auth";
import { getAdapter } from "@/lib/data";
import { ok, fail, type ActionResult } from "@/lib/validation";
import { uid } from "@/lib/utils";

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 8 * 1024 * 1024;

function readDimensions(buf: Buffer, mime: string): { w: number; h: number } | null {
  try {
    if (mime === "image/png" && buf.length > 24) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (mime === "image/webp" && buf.length > 30) return { w: buf.readUInt16LE(26) + 1, h: buf.readUInt16LE(28) + 1 };
    if (mime === "image/jpeg") {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1] ?? 0;
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        }
        const len = buf.readUInt16BE(i + 2);
        i += 2 + len;
      }
    }
  } catch { /* fall through */ }
  return null;
}

/** Validated admin image upload → Supabase Storage or /public/uploads (local mode). */
export async function uploadImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  const file = formData.get("file");
  const dir = String(formData.get("dir") ?? "gallery");
  if (!(file instanceof File)) return fail("No file received.");
  const mime = file.type;
  const ext = ALLOWED[mime];
  if (!ext) return fail("Unsupported file type — use PNG, JPEG, WebP or AVIF.");
  if (file.size > MAX_BYTES) return fail("File is larger than 8 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const dims = readDimensions(buffer, mime);
  if (dims && (dims.w > 6000 || dims.h > 6000)) return fail("Image dimensions exceed 6000 px.");
  const safeDir = ["builder", "indon", "brightstone", "gallery", "banners", "brand", "qr"].includes(dir) ? dir : "gallery";
  const filename = `${Date.now()}-${uid().slice(0, 8)}.${ext}`;
  try {
    const adapter = getAdapter();
    const res = await adapter.saveUpload(buffer, { dir: safeDir, filename, mime });
    const session = await requireAdmin();
    await adapter.logAudit(session.email, "upload.saved", "storage", res.path, { mime, bytes: file.size });
    return ok({ url: res.url }, "Image uploaded.");
  } catch {
    return fail("Upload failed — please try again.");
  }
}
