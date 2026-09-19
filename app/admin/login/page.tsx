import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAdapter } from "@/lib/data";
import { LoginCard } from "@/components/admin/LoginCard";

export const metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");
  const mode = getAdapter().mode;
  return <LoginCard mode={mode} />;
}
