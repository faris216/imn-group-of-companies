"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input, Label, FieldError } from "@/components/ui/fields";
import { useToast } from "@/components/ui/Toast";
import { login } from "@/app/actions/auth";

export function LoginCard({ mode }: { mode: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await login({ email, password });
      if (res.ok) {
        toast("Signed in successfully.");
        router.push("/admin");
        router.refresh();
      } else setError(res.error);
    });
  }

  return (
    <section className="flex min-h-[100svh] items-center justify-center bg-navy-950 px-5 py-16">
      <div className="glass w-full max-w-md rounded-md p-8 sm:p-10">
        <div className="mx-auto mb-8 w-fit rounded-sm bg-white/95 p-2.5">
          <Image src="/assets/brand/imn-logo.png" alt="IMN Group of Companies" width={277} height={112} style={{ width: 148, height: 60 }} priority />
        </div>
        <h1 className="text-center font-display text-2xl text-ivory-50">Administrator Sign In</h1>
        <p className="mt-2 text-center text-xs text-ivory-200/60">Staff access only — customers do not need an account.</p>
        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          <div>
            <Label htmlFor="li-email" className="text-ivory-200/80">Email</Label>
            <Input id="li-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required className="border-transparent" />
          </div>
          <div>
            <Label htmlFor="li-pass" className="text-ivory-200/80">Password</Label>
            <Input id="li-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border-transparent" />
          </div>
          <FieldError message={error ?? undefined} />
          <button type="submit" disabled={pending} className="w-full rounded-sm bg-gold-500 px-6 py-3 text-sm font-semibold tracking-wide text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-60">
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>
        {mode === "local" ? (
          <p className="mt-6 rounded-sm border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-center text-[11px] leading-relaxed text-gold-200">
            Local Demo Mode — sign in with the administrator account created for this installation.
          </p>
        ) : null}
      </div>
    </section>
  );
}
