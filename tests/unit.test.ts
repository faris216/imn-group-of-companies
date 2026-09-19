import { describe, expect, it } from "vitest";
import { brightstoneEnquiryMessage, indonPurchaseMessage, waUrl } from "../lib/whatsapp";
import { slugify, whatsappDigits, formatINR, mapsEmbedUrl } from "../lib/utils";
import { variantSchema, enquirySchema, productSchema } from "../lib/validation";
import { verifyToken, signToken, hashPassword, verifyPassword } from "../lib/auth";

describe("whatsapp (§89)", () => {
  it("builds wa.me url with digits and encoded message", () => {
    const url = waUrl("70104 44471", indonPurchaseMessage("INDON Wild Honey", "500g", 25));
    expect(url.startsWith("https://wa.me/917010444471?text=")).toBe(true);
    const text = decodeURIComponent(url.split("text=")[1]!);
    expect(text).toContain("Product: INDON Wild Honey");
    expect(text).toContain("Variant: 500g");
    expect(text).toContain("Listed availability: 25");
    expect(text).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/); // no internal IDs
  });
  it("encodes newlines and rupee-safe text", () => {
    const url = waUrl("89253 45865", brightstoneEnquiryMessage("Ruby Collection Piece"));
    expect(url).toContain("%0A");
    expect(decodeURIComponent(url.split("text=")[1]!)).toContain("Hello, I am interested in the Brightstone Ruby Collection Piece.");
  });
  it("normalises phone formats", () => {
    expect(whatsappDigits("70104 44471")).toBe("917010444471");
    expect(whatsappDigits("+91 89253 45865")).toBe("918925345865");
  });
});

describe("validation (§68)", () => {
  it("rejects negative quantity and price", () => {
    expect(variantSchema.safeParse({ product_id: "x", variant_name: "500g", quantity: -1 }).success).toBe(false);
    expect(variantSchema.safeParse({ product_id: "x", variant_name: "500g", quantity: 5, price: -10 }).success).toBe(false);
    expect(variantSchema.safeParse({ product_id: "x", variant_name: "500g", quantity: 5, price: 450 }).success).toBe(true);
  });
  it("requires product name, image and category", () => {
    expect(productSchema.safeParse({ company_id: "c", category_id: null, name: "", main_image_url: "" }).success).toBe(false);
    expect(productSchema.safeParse({ company_id: "c", category_id: "k", name: "Tea", main_image_url: "/a.png" }).success).toBe(true);
  });
  it("validates enquiry contact fields", () => {
    expect(enquirySchema.safeParse({ name: "A", email: "bad", message: "short" }).success).toBe(false);
    expect(enquirySchema.safeParse({ name: "Anand", email: "a@b.co", message: "Hello there, enquiry." }).success).toBe(true);
  });
});

describe("utils", () => {
  it("slugifies", () => expect(slugify("INDON Wild Honey!")).toBe("indon-wild-honey"));
  it("formats INR", () => expect(formatINR(1450)).toBe("₹1,450"));
  it("derives maps embed from stored maps url", () => {
    const u = mapsEmbedUrl("https://www.google.com/maps/@10.7587221,78.6864707,3a", null);
    expect(u).toContain("10.7587221%2C78.6864707");
  });
});

describe("local session crypto", () => {
  it("round-trips token", () => {
    const t = signToken({ email: "a@b.c", exp: Date.now() + 60_000 });
    expect(verifyToken(t)?.email).toBe("a@b.c");
    expect(verifyToken(`${t}x`)).toBeNull();
  });
  it("hashes and verifies password", () => {
    const h = hashPassword("Secret@123");
    expect(verifyPassword("Secret@123", h)).toBe(true);
    expect(verifyPassword("wrong", h)).toBe(false);
  });
});
