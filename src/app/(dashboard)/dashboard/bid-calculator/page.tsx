"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  calculateBid,
  getBidRequests,
  createBidRequest,
  getLaborRateCards,
  approveBidVersion,
} from "@/lib/services/bidCalculator";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard, Drawer } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Calculator,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

type BidSummary = {
  bid_request_id: string;
  title: string;
  request_status: string;
  bid_version_id: string | null;
  version_number: number | null;
  recommended_bid_per_month: number | null;
  min_bid_per_month: number | null;
  premium_bid_per_month: number | null;
  annual_value: number | null;
  target_margin_pct: number | null;
  underbid_warning: boolean | null;
  overbid_warning: boolean | null;
  version_status: string | null;
  calculated_at: string | null;
  lead_name: string | null;
  client_name: string | null;
  [key: string]: any;
};

const EMPTY_CALC = {
  cleanable_sqft: "35000",
  frequency: "5x_week",
  visits_per_month: "20",
  labor_hours_per_visit: "4.5",
  labor_rate_per_hour: "22",
  burden_rate_pct: "30",
  supply_cost_per_month: "650",
  equipment_cost_per_month: "150",
  overhead_pct: "15",
  insurance_pct: "5",
  target_margin_pct: "22",
};

export default function BidCalculatorPage() {
  const [bids, setBids] = useState<BidSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [activeBid, setActiveBid] = useState<BidSummary | null>(null);

  const [calc, setCalc] = useState(EMPTY_CALC);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [newReqForm, setNewReqForm] = useState({ title: "", lead_id: "", client_id: "" });
  const [approving, setApproving] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bidsRes, leadsRes, clientsRes] = await Promise.all([
        getBidRequests().catch((e) => {
          console.error("bids error", e);
          return [];
        }),
        supabase
          .from("leads")
          .select("id,company_name")
          .order("created_at", { ascending: false })
          .limit(50)
          .then((r) => r.data || []),
        supabase
          .from("clients")
          .select("id,name")
          .order("name")
          .limit(100)
          .then((r) => r.data || []),
      ]);
      setBids(bidsRes);
      setLeads(leadsRes);
      setClients(clientsRes);
    } catch (e) {
      console.error("Fetch all failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const metrics = useMemo(() => {
    const totalRequests = bids.length;
    const totalPipelineValue = bids.reduce((acc, b) => acc + (b.annual_value || 0), 0);
    const approvedBids = bids.filter((b) => b.version_status === "approved").length;
    const avgMargin =
      bids.filter((b) => b.target_margin_pct != null).length > 0
        ? Math.round(
            bids.reduce((acc, b) => acc + (b.target_margin_pct || 0), 0) /
              bids.filter((b) => b.target_margin_pct != null).length
          )
        : 22;

    return {
      totalRequests,
      pipelineValue:
        totalPipelineValue > 0 ? `$${(totalPipelineValue / 1000).toFixed(0)}k/yr` : "$0/yr",
      approvedBids,
      avgMargin: `${avgMargin}%`,
    };
  }, [bids]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBidRequest({
        title: newReqForm.title,
        lead_id: newReqForm.lead_id || undefined,
        client_id: newReqForm.client_id || undefined,
      });
      setShowNewRequest(false);
      setNewReqForm({ title: "", lead_id: "", client_id: "" });
      fetchAll();
    } catch (err: any) {
      alert("Failed to create bid request: " + err.message);
    }
  };

  const handleOpenCalc = (bid: BidSummary) => {
    setActiveBid(bid);
    setCalcResult(null);
    setShowCalcModal(true);
  };

  const runCalculation = async () => {
    if (!activeBid) return;
    setIsCalculating(true);
    try {
      const result = await calculateBid({
        bid_request_id: activeBid.bid_request_id,
        cleanable_sqft: parseInt(calc.cleanable_sqft) || 0,
        frequency: calc.frequency,
        visits_per_month: parseFloat(calc.visits_per_month) || 4,
        labor_hours_per_visit: parseFloat(calc.labor_hours_per_visit) || 0,
        labor_rate_per_hour: parseFloat(calc.labor_rate_per_hour) || 0,
        burden_rate_pct: parseFloat(calc.burden_rate_pct) || 30,
        supply_cost_per_month: parseFloat(calc.supply_cost_per_month) || 0,
        equipment_cost_per_month: parseFloat(calc.equipment_cost_per_month) || 0,
        overhead_pct: parseFloat(calc.overhead_pct) || 15,
        insurance_pct: parseFloat(calc.insurance_pct) || 5,
        target_margin_pct: parseFloat(calc.target_margin_pct) || 20,
      });
      setCalcResult(result);
      fetchAll();
    } catch (err: any) {
      alert("Calculation error: " + err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleApprove = async (versionId: string) => {
    setApproving(versionId);
    try {
      await approveBidVersion(versionId);
      fetchAll();
    } catch (err: any) {
      alert("Approval error: " + err.message);
    } finally {
      setApproving(null);
    }
  };

  const columns: Column<BidSummary>[] = [
    {
      key: "title",
      header: "Bid Project / Account",
      sortable: true,
      render: (b) => (
        <div>
          <span className="font-semibold text-text-primary block text-body-sm">{b.title}</span>
          <span className="text-caption text-text-muted">
            {b.client_name ? `Client: ${b.client_name}` : b.lead_name ? `Lead: ${b.lead_name}` : "General Bid"}
          </span>
        </div>
      ),
    },
    {
      key: "recommended_bid_per_month",
      header: "Monthly Bid (Rec)",
      sortable: true,
      render: (b) => (
        <div>
          <span className="font-semibold text-primary-600 block text-body-sm">
            {b.recommended_bid_per_month ? `$${b.recommended_bid_per_month.toLocaleString()}/mo` : "Not Calculated"}
          </span>
          {b.annual_value && (
            <span className="text-caption text-text-muted">${b.annual_value.toLocaleString()}/yr</span>
          )}
        </div>
      ),
    },
    {
      key: "target_margin_pct",
      header: "Target Margin",
      sortable: true,
      render: (b) => (
        <span className="font-medium text-text-primary text-body-sm">
          {b.target_margin_pct ? `${b.target_margin_pct}%` : "—"}
        </span>
      ),
    },
    {
      key: "version_status",
      header: "Status",
      sortable: true,
      render: (b) => {
        const s = b.version_status || b.request_status || "Draft";
        return (
          <StatusBadge
            status={s === "approved" ? "Active" : s === "rejected" ? "Cancelled" : "Draft"}
            label={s.toUpperCase()}
          />
        );
      },
    },
    {
      key: "risk",
      header: "Pricing Validation",
      render: (b) => {
        if (b.underbid_warning) {
          return (
            <span className="badge badge-danger flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Underbid Risk
            </span>
          );
        }
        if (b.overbid_warning) {
          return (
            <span className="badge badge-warning flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Overbid Risk
            </span>
          );
        }
        if (b.recommended_bid_per_month) {
          return (
            <span className="badge badge-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Margin Validated
            </span>
          );
        }
        return <span className="text-caption text-text-muted">Pending Calculation</span>;
      },
    },
    {
      key: "actions",
      header: "",
      render: (b) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleOpenCalc(b)}
            className="btn btn-secondary btn-sm text-[11px] px-2.5 py-1 flex items-center gap-1"
          >
            <Calculator className="w-3 h-3" /> Calculate
          </button>
          {b.bid_version_id && b.version_status !== "approved" && (
            <button
              onClick={() => handleApprove(b.bid_version_id!)}
              disabled={approving === b.bid_version_id}
              className="btn btn-primary btn-sm text-[11px] px-2.5 py-1 flex items-center gap-1"
            >
              Approve
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Bid Estimator & Pricing Engine"
        description="Scientific labor calculation, square footage production rates, burden margins, and profitability modeling"
        breadcrumbs={[
          { label: "Commercial", href: "/dashboard/leads" },
          { label: "Bid Calculator" },
        ]}
        actions={
          <button
            onClick={() => setShowNewRequest(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Bid Request
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Active Bid Inquiries"
          value={metrics.totalRequests}
          subtitle="Proposals in formulation"
          icon={<Calculator className="w-5 h-5" />}
        />
        <MetricCard
          title="Estimated Annualized Volume"
          value={metrics.pipelineValue}
          subtitle="Total proposal value"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Approved Bids"
          value={metrics.approvedBids}
          subtitle="Ready for contract signing"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <MetricCard
          title="Average Target Margin"
          value={metrics.avgMargin}
          subtitle="Target gross profitability"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Bids Table */}
      <DataTable
        data={bids}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search bid by title, account, client..."
        searchKeys={["title", "client_name", "lead_name"]}
        emptyTitle="No Bid Proposals Recorded"
        emptyDescription="Create a bid inquiry for commercial proposals and automated price modeling."
        emptyAction={
          <button onClick={() => setShowNewRequest(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Create First Bid
          </button>
        }
      />

      {/* Create Bid Request Modal */}
      <Modal
        open={showNewRequest}
        onClose={() => setShowNewRequest(false)}
        title="Create Bid Inquiry"
        description="Initialize a new price calculation model for a prospect or existing client facility."
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowNewRequest(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-bid-form"
              className="btn btn-primary btn-sm"
            >
              Initialize Bid
            </button>
          </>
        }
      >
        <form id="new-bid-form" onSubmit={handleCreateRequest} className="space-y-4">
          <FormField label="Bid Title / Assignment" required>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. 50,000 sq ft BioTech Cleanroom Full Contract"
              value={newReqForm.title}
              onChange={(e) => setNewReqForm({ ...newReqForm, title: e.target.value })}
            />
          </FormField>

          <FormField label="Prospect Lead (Optional)">
            <select
              className="form-input"
              value={newReqForm.lead_id}
              onChange={(e) =>
                setNewReqForm({ ...newReqForm, lead_id: e.target.value, client_id: "" })
              }
            >
              <option value="">None / Select from Leads...</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company_name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Existing Client (Optional)">
            <select
              className="form-input"
              value={newReqForm.client_id}
              onChange={(e) =>
                setNewReqForm({ ...newReqForm, client_id: e.target.value, lead_id: "" })
              }
            >
              <option value="">None / Select from Clients...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
        </form>
      </Modal>

      {/* Calculate Bid Drawer */}
      <Drawer
        open={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        title={activeBid ? `Cost Model: ${activeBid.title}` : "Bid Calculator"}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cleanable Square Footage" required>
              <input
                type="number"
                className="form-input"
                value={calc.cleanable_sqft}
                onChange={(e) => setCalc({ ...calc, cleanable_sqft: e.target.value })}
              />
            </FormField>

            <FormField label="Cleaning Service Frequency" required>
              <select
                className="form-input"
                value={calc.frequency}
                onChange={(e) => setCalc({ ...calc, frequency: e.target.value })}
              >
                <option value="1x_week">1x per week</option>
                <option value="2x_week">2x per week</option>
                <option value="3x_week">3x per week</option>
                <option value="5x_week">5x per week (Daily Mon-Fri)</option>
                <option value="7x_week">7x per week (Daily 24/7)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Visits / Month">
              <input
                type="number"
                className="form-input"
                value={calc.visits_per_month}
                onChange={(e) => setCalc({ ...calc, visits_per_month: e.target.value })}
              />
            </FormField>

            <FormField label="Hours / Visit">
              <input
                type="number"
                step="0.25"
                className="form-input"
                value={calc.labor_hours_per_visit}
                onChange={(e) => setCalc({ ...calc, labor_hours_per_visit: e.target.value })}
              />
            </FormField>

            <FormField label="Labor Rate ($/hr)">
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={calc.labor_rate_per_hour}
                onChange={(e) => setCalc({ ...calc, labor_rate_per_hour: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Labor Burden (%)" hint="Payroll tax, workers comp">
              <input
                type="number"
                className="form-input"
                value={calc.burden_rate_pct}
                onChange={(e) => setCalc({ ...calc, burden_rate_pct: e.target.value })}
              />
            </FormField>

            <FormField label="Monthly Chemical Supplies ($)">
              <input
                type="number"
                className="form-input"
                value={calc.supply_cost_per_month}
                onChange={(e) => setCalc({ ...calc, supply_cost_per_month: e.target.value })}
              />
            </FormField>

            <FormField label="Target Profit Margin (%)">
              <input
                type="number"
                className="form-input"
                value={calc.target_margin_pct}
                onChange={(e) => setCalc({ ...calc, target_margin_pct: e.target.value })}
              />
            </FormField>
          </div>

          <button
            onClick={runCalculation}
            disabled={isCalculating}
            className="w-full btn btn-primary py-2.5 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isCalculating ? "Calculating Cost Matrices..." : "Compute Bid Proposals"}
          </button>

          {/* Results Display */}
          {calcResult && (
            <div className="mt-6 space-y-4 p-5 rounded-xl border border-primary-200 dark:border-primary-800 bg-surface-hover">
              <div className="flex items-center justify-between">
                <h4 className="text-body-sm font-bold text-text-primary">Computed Bid Recommendations</h4>
                <span className="badge badge-primary">Version #{calcResult.version_number || 1}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-surface rounded-lg border border-border">
                  <p className="text-caption text-text-muted">Minimum Floor</p>
                  <p className="text-title-sm font-bold text-text-primary mt-1">
                    ${calcResult.min_bid_per_month?.toLocaleString() || "—"}/mo
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">Break-even</p>
                </div>

                <div className="p-3 bg-primary-500/10 rounded-lg border border-primary-300 dark:border-primary-700">
                  <p className="text-caption text-primary-700 dark:text-primary-300 font-semibold">
                    Recommended Bid
                  </p>
                  <p className="text-title-sm font-bold text-primary-600 mt-1">
                    ${calcResult.recommended_bid_per_month?.toLocaleString() || "—"}/mo
                  </p>
                  <p className="text-[11px] text-primary-600 mt-0.5">
                    ${calcResult.annual_value?.toLocaleString() || "—"}/yr
                  </p>
                </div>

                <div className="p-3 bg-surface rounded-lg border border-border">
                  <p className="text-caption text-text-muted">Premium Tier</p>
                  <p className="text-title-sm font-bold text-text-primary mt-1">
                    ${calcResult.premium_bid_per_month?.toLocaleString() || "—"}/mo
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">White Glove SLA</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowCalcModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
