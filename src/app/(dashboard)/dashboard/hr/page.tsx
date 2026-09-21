"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, EmptyState, Tabs } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Users, Plus, UserPlus, GraduationCap, Award, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  position?: string;
  department?: string;
  status: string;
  pay_type?: string;
  pay_rate?: number;
  hire_date?: string;
  phone?: string;
  location?: string;
  created_at?: string;
}

// ── Component ──────────────────────────────────────────────────────────

export default function HRManagementPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("employees");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "field_employee",
    position: "",
    department: "",
    pay_type: "hourly",
    pay_rate: "",
    phone: "",
  });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hr/employees");
      const json = await res.json();
      if (json.data) {
        setEmployees(json.data);
      } else if (json.error) {
        setError(json.error);
      }
    } catch (err: any) {
      setError("Failed to load employees. The API may not be configured.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();

    const handleEntityCreated = (e: any) => {
      if (e.detail?.type === "employee") fetchEmployees();
    };
    window.addEventListener("scoms-entity-created", handleEntityCreated);
    return () => window.removeEventListener("scoms-entity-created", handleEntityCreated);
  }, [fetchEmployees]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/hr/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create employee");

      setShowAddModal(false);
      setForm({ first_name: "", last_name: "", email: "", role: "field_employee", position: "", department: "", pay_type: "hourly", pay_rate: "", phone: "" });
      fetchEmployees();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Table Columns ─────────────────────────────────────────────────

  const columns: Column<Employee>[] = [
    {
      key: "name",
      label: "Employee",
      sortable: true,
      render: (_v, row) => (
        <div>
          <p className="text-body-sm font-medium text-text-primary">
            {row.first_name || "—"} {row.last_name || ""}
          </p>
          <p className="text-caption text-text-muted font-mono">{row.email || "—"}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (val) => (
        <span className="text-body-sm capitalize">{(val || "—").replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "position",
      label: "Position",
      sortable: true,
      render: (val) => val || "—",
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (val) => val || "—",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val) => <StatusBadge status={val || "Active"} />,
    },
    {
      key: "pay_type",
      label: "Pay Type",
      sortable: true,
      render: (val) => (
        <span className="text-body-sm capitalize">{val || "—"}</span>
      ),
    },
    {
      key: "pay_rate",
      label: "Rate",
      sortable: true,
      align: "right",
      render: (val) =>
        val ? `$${Number(val).toFixed(2)}` : "—",
    },
  ];

  // ── Tab Content ───────────────────────────────────────────────────

  const tabs = [
    { id: "employees", label: "Employees", count: employees.length },
    { id: "recruiting", label: "Recruiting" },
    { id: "training", label: "Training" },
    { id: "certifications", label: "Certifications" },
    { id: "performance", label: "Performance" },
  ];

  const tabLinks: Record<string, string> = {
    recruiting: "/dashboard/hr/recruiting",
    training: "/dashboard/hr/training",
    certifications: "/dashboard/hr/certifications",
    performance: "/dashboard/hr/performance",
  };

  return (
    <div className="p-6 max-w-[1300px] mx-auto space-y-5 pb-12">
      <PageHeader
        title="Workforce Management"
        description="Manage employees, roles, payroll, training, and certifications."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workforce" },
        ]}
        actions={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        }
      />

      {/* Tabs — navigate to sub-pages */}
      <div className="flex items-center gap-5 border-b border-border overflow-x-auto">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          if (t.id !== "employees" && tabLinks[t.id]) {
            return (
              <Link
                key={t.id}
                href={tabLinks[t.id]}
                className="tab whitespace-nowrap"
              >
                {t.label}
              </Link>
            );
          }
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`tab ${isActive ? "tab-active" : ""}`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={`ml-1.5 text-[10px] font-semibold rounded-full px-1.5 py-0.5 ${
                  isActive ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-500"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Employee Data Table */}
      {error ? (
        <div className="p-3 rounded-md bg-warning-50 border border-warning-100 text-body-sm text-warning-700">
          <strong>Note:</strong> {error}
        </div>
      ) : null}

      <DataTable
        data={employees}
        columns={columns}
        loading={loading}
        emptyTitle="No employees found"
        emptyDescription="Add your first employee to get started with workforce management."
        emptyAction={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            <UserPlus className="w-4 h-4" />
            Add First Employee
          </button>
        }
        searchable
        searchPlaceholder="Search employees by name, email, role..."
        searchKeys={["first_name", "last_name", "email", "role", "position", "department"]}
        exportable
        selectable
        onRowClick={(row) => router.push(`/dashboard/hr/${row.id}`)}
      />

      {/* ── Add Employee Modal ──────────────────────────────────────── */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Employee"
        description="Create a new employee record in the system."
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddEmployee} disabled={saving}>
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              Save Employee
            </button>
          </>
        }
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <input
                required
                type="text"
                value={form.first_name}
                onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                className="input"
                placeholder="John"
              />
            </FormField>
            <FormField label="Last Name" required>
              <input
                required
                type="text"
                value={form.last_name}
                onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
                className="input"
                placeholder="Doe"
              />
            </FormField>
          </div>

          <FormField label="Email" required>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="input"
              placeholder="john.doe@company.com"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role" required>
              <select
                required
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="input"
              >
                <option value="field_employee">Field Employee</option>
                <option value="supervisor">Supervisor</option>
                <option value="operations_manager">Operations Manager</option>
                <option value="hr_manager">HR Manager</option>
                <option value="finance_admin">Finance Admin</option>
                <option value="compliance_officer">Compliance Officer</option>
              </select>
            </FormField>
            <FormField label="Department">
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                className="input"
                placeholder="Operations"
              />
            </FormField>
          </div>

          <FormField label="Position">
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              className="input"
              placeholder="Cleaning Specialist"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Pay Type" required>
              <select
                required
                value={form.pay_type}
                onChange={(e) => setForm((p) => ({ ...p, pay_type: e.target.value }))}
                className="input"
              >
                <option value="hourly">Hourly</option>
                <option value="salary">Salary</option>
              </select>
            </FormField>
            <FormField label="Pay Rate ($)" required>
              <input
                required
                type="number"
                step="0.01"
                value={form.pay_rate}
                onChange={(e) => setForm((p) => ({ ...p, pay_rate: e.target.value }))}
                className="input"
                placeholder="15.00"
              />
            </FormField>
          </div>

          <FormField label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="input"
              placeholder="(214) 555-0100"
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
