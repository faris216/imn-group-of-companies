/** WhatsApp deep-link builder — single source of truth for messages & encoding. */
import { whatsappDigits } from "@/lib/utils";

export interface WhatsAppTarget {
  phone_number: string;
}

export function waUrl(phone: string, message: string): string {
  return `https://wa.me/${whatsappDigits(phone)}?text=${encodeURIComponent(message)}`;
}

/** INDON Mart purchase message (spec §06). Product + variant names only — no internal IDs. */
export function indonPurchaseMessage(productName: string, variantName: string | null, availability?: number): string {
  const lines = [
    "Hello, I am interested in purchasing:",
    "",
    `Product: ${productName}`,
  ];
  if (variantName) lines.push(`Variant: ${variantName}`);
  if (typeof availability === "number") lines.push(`Listed availability: ${availability}`);
  lines.push("", "Please provide availability and purchase details.");
  return lines.join("\n");
}

/** Brightstone enquiry message (spec §08). */
export function brightstoneEnquiryMessage(productName: string): string {
  return `Hello, I am interested in the Brightstone ${productName}.\nPlease provide more information.`;
}

/** Generic division enquiry message (builder/projects/contact cards). */
export function genericEnquiryMessage(subject: string): string {
  return `Hello, I would like to enquire about ${subject}.\nPlease share more details.`;
}

export function primaryNumber(numbers: WhatsAppTarget[]): string | null {
  return numbers[0]?.phone_number ?? null;
}
