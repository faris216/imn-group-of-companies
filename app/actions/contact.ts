"use server";
import { headers } from "next/headers";
import { getAdapter } from "@/lib/data";
import { rateLimit } from "@/lib/ratelimit";
import { enquirySchema, ok, fail, type ActionResult } from "@/lib/validation";

export async function submitEnquiry(input: Record<string, string>): Promise<ActionResult> {
  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? "local";
  const limit = Number(process.env.CONTACT_RATE_LIMIT_PER_MIN ?? 3);
  if (!rateLimit(`contact:${ip}`, limit)) return fail("Too many enquiries — please try again in a minute.");

  const parsed = enquirySchema.safeParse({
    company_id: input.company_id || null,
    product_id: input.product_id || null,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    subject: input.subject || null,
    message: input.message,
  });
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    parsed.error.issues.forEach((i) => { fields[String(i.path[0])] = i.message; });
    return fail("Please correct the highlighted fields.", fields);
  }
  try {
    const adapter = getAdapter();
    await adapter.createEnquiry(parsed.data);
    return ok(undefined, "Enquiry received.");
  } catch {
    return fail("We could not save your enquiry. Please try again or contact us directly.");
  }
}
