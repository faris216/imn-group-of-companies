"use client";
import { useState, useTransition } from "react";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/fields";
import { useToast } from "@/components/ui/Toast";
import { submitEnquiry } from "@/app/actions/contact";
import type { Company } from "@/lib/types";

export function ContactForm({ companies }: { companies: Company[] }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [fields, setFields] = useState({ name: "", email: "", phone: "", company_id: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const res = await submitEnquiry(fields);
      if (res.ok) {
        toast("Thank you — your enquiry has been recorded. We will respond shortly.");
        setFields({ name: "", email: "", phone: "", company_id: fields.company_id, subject: "", message: "" });
      } else {
        toast(res.error, "error");
        setErrors(res.fields ?? {});
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="glass-light rounded-md p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="cf-name">Name *</Label>
          <Input id="cf-name" value={fields.name} onChange={set("name")} required autoComplete="name" />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="cf-email">Email *</Label>
          <Input id="cf-email" type="email" value={fields.email} onChange={set("email")} required autoComplete="email" />
          <FieldError message={errors.email} />
        </div>
        <div>
          <Label htmlFor="cf-phone">Phone</Label>
          <Input id="cf-phone" type="tel" value={fields.phone} onChange={set("phone")} autoComplete="tel" />
          <FieldError message={errors.phone} />
        </div>
        <div>
          <Label htmlFor="cf-company">Regarding division</Label>
          <Select id="cf-company" value={fields.company_id} onChange={set("company_id")}>
            <option value="">General / Group</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="cf-subject">Subject</Label>
          <Input id="cf-subject" value={fields.subject} onChange={set("subject")} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="cf-message">Message *</Label>
          <Textarea id="cf-message" value={fields.message} onChange={set("message")} required rows={5} />
          <FieldError message={errors.message} />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex items-center gap-2 rounded-sm bg-navy-700 px-7 py-3 text-sm font-medium tracking-wide text-ivory-50 shadow-soft transition-all hover:bg-navy-600 hover:shadow-lift disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ivory-50/40 border-t-ivory-50" aria-hidden="true" />
            Sending…
          </>
        ) : (
          "Send Enquiry"
        )}
      </button>
    </form>
  );
}
