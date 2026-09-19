import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GlobalBack } from "@/components/layout/GlobalBack";
import { getAdapter } from "@/lib/data";

/** Public site chrome. Admin routes live outside this group so they never
 *  inherit the marketing header/footer (previously caused double sticky
 *  headers overlapping on /admin). */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const adapter = getAdapter();
  const typo = await adapter.getContent<{ paragraph_align?: string }>("typography");
  const align = typo?.paragraph_align === "left" ? "left" : "justify";
  return (
    <>
      <Header />
      <GlobalBack />
      <main id="main" data-paragraph-align={align}>{children}</main>
      <Footer />
    </>
  );
}
