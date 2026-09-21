"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Loader2, Pencil, Trash2, X, Check, Send, DollarSign } from "lucide-react";

interface Quote {
  id: string;
  client_id?: string | null;
  client_name?: string;
  amount?: number;
  status?: string;
  notes?: string;
  valid_until?: string | null;
  created_at?: string;
}

interface Client {
  id: string;
  name: string;
}

const STATUS_OPTIONS = ["Draft", "Sent", "Approved", "Rejected", "Expired"];

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Sent: "bg-blue-100 text-blue-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
  Expired: "bg-amber-100 text-amber-700",
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editQuote, setEditQuote] = useState<Quote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    client_id: "",
    amount: "",
    notes: "",
    valid_until: "",
    status: "Draft",
  });

  const fetchClients = useCallback(async () => {
    const { data } = await supabase.from("clients").select("id, name").order("name");
    if (data) setClients(data);
  }, []);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      let quotesData: any[] = [];
      const [quotesRes, clientsRes] = await Promise.all([
        fetch("/api/quotes").then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/clients").then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      if (quotesRes.data) quotesData = quotesRes.data;
      const clientsList: Client[] = clientsRes.data || [];
      if (clientsList.length > 0) setClients(clientsList);

      const clientsMap = new Map<string, string>(
        clientsList.map((c: Client) => [c.id, c.name])
      );

      const formatted = quotesData.map((q: any) => ({
        ...q,
        client_name: clientsMap.get(q.client_id) || q.client_name || "—",
      }));

      setQuotes(formatted);
    } catch (err) {
      console.error("Failed to load quotes:", err);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    fetchClients();
  }, [fetchQuotes, fetchClients]);

  const resetForm = () => {
    setForm({ client_id: "", amount: "", notes: "", valid_until: "", status: "Draft" });
    setEditQuote(null);
    setErrorMsg("");
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (q: Quote) => {
    setEditQuote(q);
    setForm({
      client_id: q.client_id || "",
      amount: String(q.amount || ""),
      notes: q.notes || "",
      valid_until: q.valid_until || "",
      status: q.status || "Draft",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    const payload: Record<string, any> = {
      client_id: form.client_id || null,
      amount: parseFloat(form.amount) || 0,
      notes: form.notes,
      valid_until: form.valid_until || null,
      status: form.status,
    };

    try {
      if (editQuote) {
        payload.id = editQuote.id;
        const res = await fetch("/api/quotes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update quote");
      } else {
        const res = await fetch("/api/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create quote");
      }

      setShowModal(false);
      resetForm();
      fetchQuotes();
    } catch (err: any) {
      setErrorMsg(err.message || "Operation failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/quotes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setDeleteId(null);
      fetchQuotes();
    } catch (err) {
      console.error("Failed to delete quote:", err);
    }
  };

  const handleSend = async (q: Quote) => {
    try {
      await fetch("/api/quotes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: q.id, status: "Sent" }),
      });
      fetchQuotes();
    } catch (err) {
      console.error("Failed to send quote:", err);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-bold font-display text-foreground tracking-tight">
            Quotes &amp; Proposals
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Commercial estimates, pricing proposals, and client bids
          </p>
        </div>
        <button onClick={openAdd} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Quote
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-muted text-xs uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
                <th className="p-4 pl-6">Quote ID</th>
                <th className="p-4">Client</th>
                <th className="p-4">Estimated Value</th>
                <th className="p-4">Valid Until</th>
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
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No quotes yet.</p>
                    <p className="text-sm mt-1">
                      Create your first quote to start the commercial sales process.
                    </p>
                  </td>
                </tr>
              ) : (
                quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs text-muted-foreground">
                      {q.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4 font-semibold text-foreground">{q.client_name}</td>
                    <td className="p-4 font-bold text-foreground">
                      ${Number(q.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[q.status || "Draft"] || "bg-slate-100 text-slate-600"}`}>
                        {q.status || "Draft"}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center gap-1 justify-end">
                        {q.status === "Draft" && (
                          <button
                            onClick={() => handleSend(q)}
                            className="p-1.5 text-muted-foreground hover:text-blue-600 rounded hover:bg-blue-50 transition"
                            title="Mark as Sent"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(q)}
                          className="p-1.5 text-muted-foreground hover:text-primary rounded hover:bg-muted transition"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(q.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 rounded hover:bg-red-50 transition"
                          title="Delete"
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-foreground">
                {editQuote ? "Edit Quote" : "New Quote"}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
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
                <label className="block text-sm font-medium text-foreground mb-1">
                  Estimated Value ($)
                </label>
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
                <label className="block text-sm font-medium text-foreground mb-1">Valid Until</label>
                <input
                  type="date"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.valid_until}
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
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
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                <textarea
                  rows={3}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Scope of work, terms, or additional details..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button disabled={isSaving} type="submit" className="btn btn-primary flex items-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editQuote ? "Update Quote" : "Save Quote"}
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
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Quote?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              This action cannot be undone. The quote will be permanently removed.
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
