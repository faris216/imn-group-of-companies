import { z } from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  company_id: z.string().min(1, "Division is required"),
  category_id: z.string().min(1, "Category is required").nullable(),
  name: z.string().min(2, "Product name is required").max(120),
  short_description: z.string().max(300).nullable().optional(),
  description: z.string().max(6000).nullable().optional(),
  main_image_url: z.string().min(1, "A main image is required"),
  featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
  is_ai_draft: z.boolean().optional(),
});

export const variantSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1),
  variant_name: z.string().min(1, "Variant name is required").max(60),
  size: z.string().max(40).nullable().optional(),
  weight: z.coerce.number().nonnegative("Weight must be non-negative").nullable().optional(),
  unit: z.string().max(10).nullable().optional(),
  price: z.coerce.number().nonnegative("Price must be a valid positive amount").nullable().optional(),
  quantity: z.coerce.number().int().nonnegative("Quantity must be non-negative"),
  availability: z.enum(["in_stock", "out_of_stock", "preorder"]).optional(),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  company_id: z.string().min(1),
  name: z.string().min(2, "Project name is required").max(140),
  location: z.string().max(140).nullable().optional(),
  project_type: z.enum(["residential", "commercial"], { message: "Project type is required" }),
  description: z.string().min(10, "A description is required").max(8000),
  main_image_url: z.string().min(1, "A cover image is required"),
  featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export const gallerySchema = z.object({
  id: z.string().optional(),
  company_id: z.string().min(1, "Division is required"),
  title: z.string().max(140).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  image_url: z.string().min(1, "An image is required"),
  category: z.string().max(60).nullable().optional(),
  is_published: z.boolean().optional(),
});

export const bannerSchema = z.object({
  id: z.string().optional(),
  company_id: z.string().min(1),
  title: z.string().max(140).nullable().optional(),
  subtitle: z.string().max(140).nullable().optional(),
  image_url: z.string().min(1, "A banner image is required"),
  button_text: z.string().max(40).nullable().optional(),
  button_url: z.string().max(300).nullable().optional(),
  is_active: z.boolean().optional(),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  company_id: z.string().min(1),
  name: z.string().min(2, "Category name is required").max(80),
  description: z.string().max(600).nullable().optional(),
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

export const contactSchema = z.object({
  email: z.string().email("A valid email is required").nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  address: z.string().max(400).nullable().optional(),
  maps_url: z.string().url("Must be a valid URL").nullable().optional().or(z.literal("")),
});

export const whatsappSchema = z.object({
  id: z.string().optional(),
  company_id: z.string().min(1),
  phone_number: z.string().regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
  label: z.string().max(80).nullable().optional(),
  is_primary: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const enquirySchema = z.object({
  company_id: z.string().nullable().optional(),
  product_id: z.string().nullable().optional(),
  name: z.string().min(2, "Please tell us your name").max(120),
  email: z.string().email("A valid email is required"),
  phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number").nullable().optional().or(z.literal("")),
  subject: z.string().max(160).nullable().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(4000),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const settingsSchema = z.object({
  site_title: z.string().min(2).max(120),
  tagline: z.string().max(200).nullable().optional(),
  address: z.string().max(400).nullable().optional(),
  maps_url: z.string().max(2000).nullable().optional(),
  maps_qr_image_url: z.string().max(500).nullable().optional(),
  website_qr_image_url: z.string().max(500).nullable().optional(),
  whatsapp_qr_image_url: z.string().max(500).nullable().optional(),
  footer_note: z.string().max(400).nullable().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(400).nullable().optional(),
});

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fields?: Record<string, string> };

export const ok = <T,>(data?: T, message?: string): ActionResult<T> => ({ ok: true, data, message });
export const fail = <T,>(error: string, fields?: Record<string, string>): ActionResult<T> => ({ ok: false, error, fields });
