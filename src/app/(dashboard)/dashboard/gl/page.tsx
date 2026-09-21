"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DollarSign, Plus, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import Link from "next/link";

interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  description: string;
  recorded_at: string;
  account_code?: string;
  reference?: string;
}

export default function GeneralLedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ledger")
        .select("*")
        .order("recorded_at", { ascending: false });
      if (data) setEntries(data);
    } catch (err) {
      console.error("Error fetching ledger:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLedger(); }, [fetchLedger]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  const revenue = entries.filter(e => e.type === "Revenue").reduce((s, e) => s + Number(e.amount || 0), 0);
  const expenses = entries.filter(e => e.type === "Expense").reduce((s, e) => s + Number(e.amount || 0), 0);
  const netProfit = revenue - expenses;

  const columns: Column<LedgerEntry>[] = [
    {
      key: "recorded_at", label: "Date", sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString() : "—",
    },
    {
      key: "description", label: "Description", sortable: true,
      render: (val) => <span className="text-body-sm font-medium">{val || "—"}</span>,
    },
    {
      key: "type", label: "Type", sortable: true,
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-body-sm font-medium ${val === "Revenue" ? "text-success-600" : "text-danger-600"}`}>
          {val === "Revenue" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {val}
        </span>
      ),
    },
    {
      key: "account_code", label: "Account", sortable: true,
      render: (val) => <span className="text-caption font-mono text-text-muted">{val || "—"}</span>,
    },
    {
      key: "amount", label: "Amount", sortable: true, align: "right",
      render: (val, row) => (
        <span className={`text-body-sm font-medium ${row.type === "Revenue" ? "text-success-600" : "text-danger-600"}`}>
          {formatCurrency(Number(val || 0))}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1300px] mx-auto space-y-5 pb-12">
      <PageHeader
        title="General Ledger"
        description="Immutable financial transaction records and audit trail."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance" },
          { label: "General Ledger" },
        ]}
        actions={
          <button className="btn btn-primary">
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        }
      />

      {/* Finance sub-nav */}
      <div className="flex items-center gap-5 border-b border-border overflow-x-auto">
        <Link href="/dashboard/gl/accountant" className="tab">Accountant</Link>
        <Link href="/dashboard/gl" className="tab tab-active">Ledger</Link>
        <Link href="/dashboard/gl/invoices" className="tab">Invoices</Link>
        <Link href="/dashboard/gl/quotes" className="tab">Quotes</Link>
        <Link href="/dashboard/gl/job-costing" className="tab">Job Costing</Link>
        <Link href="/dashboard/gl/assets" className="tab">Assets</Link>
        <Link href="/dashboard/gl/tax" className="tab">Tax</Link>
      </div>

      {/* Financial Summary */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Revenue" value={formatCurrency(revenue)} icon={<ArrowUpRight className="w-4 h-4" />} />
          <MetricCard label="Expenses" value={formatCurrency(expenses)} icon={<ArrowDownRight className="w-4 h-4" />} />
          <MetricCard
            label="Net Profit"
            value={formatCurrency(netProfit)}
            icon={<TrendingUp className="w-4 h-4" />}
            change={netProfit >= 0 ? { value: "Positive", positive: true } : { value: "Loss", positive: false }}
          />
          <MetricCard label="Entries" value={entries.length} icon={<DollarSign className="w-4 h-4" />} />
        </div>
      )}

      <DataTable
        data={entries}
        columns={columns}
        loading={loading}
        emptyTitle="No ledger entries"
        emptyDescription="Financial transactions will appear here once recorded."
        searchable
        searchPlaceholder="Search entries..."
        searchKeys={["description", "type", "account_code"]}
        exportable
      />
    </div>
  );
}
