"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/portal/PortalSidebar";
import { getPortalUser, getPortalInvoices, getPortalBillingSummary } from "@/lib/services/customerPortal";
import { DollarSign, Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  unpaid: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-slate-100 text-slate-400',
  draft: 'bg-slate-100 text-slate-500',
};

export default function PortalBillingPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const pu = await getPortalUser();
      if (!pu) { router.push('/portal/login'); return; }
      if (!pu.can_view_invoices) { router.push('/portal/dashboard'); return; }
      setPortalUser(pu);
      const [invs, bill] = await Promise.all([getPortalInvoices(pu.client_id), getPortalBillingSummary(pu.client_id)]);
      setInvoices(invs);
      setBilling(bill);
      setLoading(false);
    };
    init();
  }, [router]);

  const fmt = (v: number | null) => v != null ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-9 h-9 animate-spin text-blue-500" /></div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PortalSidebar clientName={portalUser?.clients?.name} />
      <main className="pl-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Billing &amp; Invoices</h1>
            <p className="text-slate-500 text-sm mt-0.5">View your invoices and payment history.</p>
          </div>

          {/* Billing Summary */}
          {billing && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Paid', val: fmt(billing.total_paid), color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                { label: 'Outstanding', val: fmt(billing.total_outstanding), color: billing.total_outstanding > 0 ? 'text-amber-600' : 'text-slate-700', bg: 'bg-white border-slate-200' },
                { label: 'Overdue', val: fmt(billing.total_overdue), color: billing.total_overdue > 0 ? 'text-red-600' : 'text-slate-700', bg: billing.total_overdue > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200' },
              ].map(b => (
                <div key={b.label} className={`rounded-2xl border p-5 shadow-sm ${b.bg}`}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{b.label}</p>
                  <p className={`text-2xl font-bold ${b.color}`}>{b.val}</p>
                  {billing.next_due_date && b.label === 'Outstanding' && (
                    <p className="text-xs text-slate-400 mt-1">Due: {new Date(billing.next_due_date).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Invoices */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Invoice History</h2>
            </div>
            {invoices.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-semibold">No invoices on file.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <div key={inv.id}>
                    <button
                      onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <p className="font-semibold text-slate-900">{inv.invoice_number ?? `INV-${inv.id.substring(0, 8).toUpperCase()}`}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_STYLES[inv.status] ?? 'bg-slate-100 text-slate-500'}`}>
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '—'}{inv.due_date ? ` · Due: ${new Date(inv.due_date).toLocaleDateString()}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`text-lg font-bold ${inv.status === 'paid' ? 'text-emerald-600' : inv.status === 'overdue' ? 'text-red-600' : 'text-slate-900'}`}>
                          {fmt(inv.amount)}
                        </p>
                        {inv.status === 'paid' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                      </div>
                    </button>
                    {/* Line Items */}
                    {expandedId === inv.id && inv.invoice_line_items?.length > 0 && (
                      <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100">
                        <table className="w-full text-sm mt-3">
                          <thead>
                            <tr className="text-xs font-semibold text-slate-400 uppercase text-left border-b border-slate-200 pb-1">
                              <th className="pb-2 pr-4">Description</th>
                              <th className="pb-2 pr-4 text-right">Qty</th>
                              <th className="pb-2 pr-4 text-right">Unit Price</th>
                              <th className="pb-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {inv.invoice_line_items.map((li: any) => (
                              <tr key={li.id} className="text-slate-700">
                                <td className="py-2 pr-4">{li.description}</td>
                                <td className="py-2 pr-4 text-right">{li.quantity}</td>
                                <td className="py-2 pr-4 text-right">{fmt(li.unit_price)}</td>
                                <td className="py-2 text-right font-semibold">{fmt(li.total_price)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="font-bold text-slate-900 border-t border-slate-200">
                              <td colSpan={3} className="pt-2 text-right text-sm">Total:</td>
                              <td className="pt-2 text-right">{fmt(inv.amount)}</td>
                            </tr>
                          </tfoot>
                        </table>
                        {inv.notes && <p className="text-xs text-slate-400 mt-2 italic">{inv.notes}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
