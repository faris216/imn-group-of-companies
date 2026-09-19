"use client";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-sm border border-charcoal-800/15 bg-white px-3.5 py-2.5 text-sm text-charcoal-800 placeholder:text-charcoal-600/50 transition-colors focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/15 disabled:bg-ivory-100";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, className)} {...props} />;
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, "min-h-[110px]", className)} {...props} />;
}
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(field, "appearance-none pr-8", className)} {...props} />;
}
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-700", className)} {...props} />;
}
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-700" role="alert">{message}</p>;
}
