import { getAdapter } from "@/lib/data";

export const metadata = { title: "Audit Log" };

export default async function AdminAuditPage() {
  const adapter = getAdapter();
  const logs = await adapter.listAudit(300);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Audit Log</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Every administrative action, newest first. Passwords are never logged.</p>
      </div>
      <div className="overflow-x-auto rounded-md border border-charcoal-800/8 bg-white shadow-soft">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-charcoal-800/8 bg-ivory-100/70 text-[11px] uppercase tracking-[0.14em] text-charcoal-600">
            <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Admin</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th></tr>
          </thead>
          <tbody className="divide-y divide-charcoal-800/6">
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap px-4 py-2.5 text-charcoal-600">{new Date(l.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                <td className="px-4 py-2.5 text-charcoal-700">{l.actor_email}</td>
                <td className="px-4 py-2.5 font-semibold text-charcoal-800">{l.action}</td>
                <td className="px-4 py-2.5 text-charcoal-600">{l.entity_type}</td>
              </tr>
            ))}
            {logs.length === 0 ? <tr><td colSpan={4} className="px-4 py-10 text-center text-charcoal-600">No administrative actions recorded yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
