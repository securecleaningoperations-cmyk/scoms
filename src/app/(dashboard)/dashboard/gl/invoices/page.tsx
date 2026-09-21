"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Loader2, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";

interface Invoice {
  id: string;
  invoice_id?: string;
  invoice_number?: string;
  client_id?: string | null;
  amount?: number;
  total?: number;
  due_date?: string | null;
  issue_date?: string | null;
  status: string;
  created_at?: string;
  // resolved client name
  client_name?: string;
}

interface Client {
  id: string;
  name: string;
}

const STATUS_OPTIONS = ["pending", "sent", "paid", "overdue", "cancelled"];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editRow, setEditRow] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    client_id: "",
    amount: "",
    due_date: "",
    status: "pending",
  });

  const fetchClients = useCallback(async () => {
    const { data } = await supabase.from("clients").select("id, name").order("name");
    if (data) setClients(data);
  }, []);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, clientRes] = await Promise.all([
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name"),
      ]);

      const clientsMap = new Map<string, string>(
        (clientRes.data || []).map((c: Client) => [c.id, c.name])
      );

      const formatted: Invoice[] = (invRes.data || []).map((inv: any) => ({
        ...inv,
        invoice_number: inv.invoice_id || inv.invoice_number || `INV-${inv.id?.slice(0, 6)?.toUpperCase()}`,
        client_name: clientsMap.get(inv.client_id) || "—",
        total_amount: Number(inv.amount || inv.total || 0),
      }));

      setInvoices(formatted);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    const handleEntityCreated = (e: any) => {
      if (e.detail?.type === "invoice") fetchInvoices();
    };
    window.addEventListener("scoms-entity-created", handleEntityCreated);
    return () => window.removeEventListener("scoms-entity-created", handleEntityCreated);
  }, [fetchInvoices, fetchClients]);

  const resetForm = () => {
    setForm({ client_id: "", amount: "", due_date: "", status: "pending" });
    setErrorMsg("");
  };

  // ── CREATE ────────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setErrorMsg("");

    const amount = parseFloat(form.amount) || 0;
    const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;

    // ⚠️  Only insert columns that actually exist in the schema.
    //     DO NOT include a `client` (text) column — the table uses `client_id` (FK).
    const payload: Record<string, any> = {
      invoice_id: invoiceNum,
      client_id: form.client_id || null,
      amount: amount,
      due_date: form.due_date || null,
      status: form.status || "pending",
      issue_date: new Date().toISOString().split("T")[0],
    };

    const { error } = await supabase.from("invoices").insert([payload]);
    if (!error) {
      fetchInvoices();
      setShowModal(false);
      resetForm();
    } else {
      setErrorMsg("Failed to create invoice: " + error.message);
    }
    setIsAdding(false);
  };

  // ── UPDATE STATUS ─────────────────────────────────────────────────────
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await supabase.from("invoices").update({ status: newStatus }).eq("id", id);
    fetchInvoices();
    setEditRow(null);
  };

  // ── DELETE ────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    await supabase.from("invoices").delete().eq("id", id);
    setDeleteId(null);
    fetchInvoices();
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-bold font-display text-foreground tracking-tight">
            Invoice Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Track and manage client billing — Accounts Receivable
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-muted text-xs uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
                <th className="p-4 pl-6">Invoice #</th>
                <th className="p-4">Client</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No invoices yet.</p>
                    <p className="text-sm mt-1">Create your first invoice to start billing clients.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs text-muted-foreground">
                      {inv.invoice_number}
                    </td>
                    <td className="p-4 font-semibold text-foreground">{inv.client_name}</td>
                    <td className="p-4 font-bold text-emerald-600">
                      ${(Number(inv.amount || inv.total || 0)).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4">
                      {editRow?.id === inv.id ? (
                        <select
                          autoFocus
                          value={editRow.status}
                          onChange={(e) => setEditRow({ ...editRow, status: e.target.value })}
                          onBlur={() => handleUpdateStatus(inv.id, editRow.status)}
                          className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditRow(inv)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition ${
                            inv.status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : inv.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : inv.status === "sent"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                          title="Click to change status"
                        >
                          {inv.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditRow(inv)}
                          className="p-1.5 text-muted-foreground hover:text-primary rounded hover:bg-muted transition"
                          title="Edit status"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(inv.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 rounded hover:bg-red-50 transition"
                          title="Delete invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-foreground">Create New Invoice</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-muted-foreground hover:text-foreground rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Client</label>
                <select
                  required
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Amount ($)</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
                <input
                  required
                  type="date"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  disabled={isAdding}
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                >
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Invoice?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              This action cannot be undone. The invoice will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="btn btn-secondary">Cancel</button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
