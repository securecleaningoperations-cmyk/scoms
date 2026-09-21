"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  PageHeader,
  StatusBadge,
  MetricCard,
  Tabs,
  Modal,
  FormField,
  LoadingState,
  EmptyState,
} from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  GraduationCap,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface EmployeeDetail {
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
  [key: string]: any;
}

const MOCK_TRAININGS = [
  { id: "t1", title: "OSHA Bloodborne Pathogens & PPE Protocol", status: "completed", score: 98, date: "2026-01-15" },
  { id: "t2", title: "Hazard Communication & Chemical SDS Handling", status: "completed", score: 95, date: "2026-02-01" },
  { id: "t3", title: "Cleanroom Terminal Sanitation ISO Level 5", status: "completed", score: 100, date: "2026-02-18" },
  { id: "t4", title: "Slip, Trip, and Fall Hazard Mitigation", status: "in_progress", score: null, date: "Due in 14 days" },
];

const MOCK_CERTS = [
  { id: "c1", name: "OSHA 10-Hour General Industry Certification", issuer: "OSHA / Safety Council", expires: "2028-01-15", status: "Active" },
  { id: "c2", name: "Biohazard Containment & Terminal Disinfection", issuer: "Clean Standards Institute", expires: "2027-06-30", status: "Active" },
];

export default function Employee360Page() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [assignedJobs, setAssignedJobs] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>(MOCK_TRAININGS);
  const [certifications, setCertifications] = useState<any[]>(MOCK_CERTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  const fetchEmployeeData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: emp, error: empErr } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();

      if (empErr) throw empErr;
      setEmployee(emp);

      // Query jobs assigned to this employee's name or id
      const fullName = `${emp.first_name} ${emp.last_name}`;
      const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .or(`assigned.eq.${fullName},assigned.eq.${emp.first_name}`)
        .order("job_date", { ascending: false })
        .limit(20);

      setAssignedJobs(jobs || []);
    } catch (err) {
      console.error("Error loading employee 360:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  if (loading) {
    return <LoadingState message="Loading Workforce Profile..." />;
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/dashboard/hr")}
          className="btn btn-secondary btn-sm flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to HR Directory
        </button>
        <EmptyState
          title="Personnel Record Not Found"
          description="The employee file does not exist or may have been offboarded."
          action={
            <Link href="/dashboard/hr" className="btn btn-primary btn-sm">
              Return to Workforce Directory
            </Link>
          }
        />
      </div>
    );
  }

  const fullName = `${employee.first_name} ${employee.last_name}`;

  const jobColumns: Column<any>[] = [
    {
      key: "title",
      header: "Assigned Job",
      sortable: true,
      render: (j) => (
        <div>
          <span className="font-semibold text-text-primary block text-body-sm">{j.title || j.service}</span>
          <span className="text-caption text-text-muted">{j.client}</span>
        </div>
      ),
    },
    {
      key: "job_date",
      header: "Scheduled Date",
      sortable: true,
      render: (j) => (
        <span className="text-body-sm text-text-secondary">
          {j.job_date ? new Date(j.job_date).toLocaleDateString() : "Recurring"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (j) => (
        <StatusBadge
          status={j.status === "Completed" ? "Active" : "Pending"}
          label={j.status}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (j) => (
        <Link
          href={`/dashboard/jobs/${j.id}`}
          className="btn btn-ghost btn-sm text-primary-600 hover:text-primary-700"
        >
          View Job &rarr;
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        description={`Role: ${employee.role} • Department: ${employee.department || "Operations"} • Position: ${
          employee.position || "Cleaning Specialist"
        }`}
        breadcrumbs={[
          { label: "Workforce", href: "/dashboard/hr" },
          { label: fullName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status="Active" label={employee.status?.toUpperCase() || "ACTIVE"} />
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Compensation Rate"
          value={employee.pay_rate ? `$${employee.pay_rate}/hr` : "Salary Plan"}
          subtitle={`Pay model: ${employee.pay_type || "Hourly"}`}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Service Seniority"
          value={employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "Active"}
          subtitle="Hire / Onboarding date"
          icon={<Calendar className="w-5 h-5" />}
        />
        <MetricCard
          title="Compliance Training"
          value="96%"
          subtitle="All mandatory OSHA modules valid"
          icon={<GraduationCap className="w-5 h-5" />}
        />
        <MetricCard
          title="Assigned Field Operations"
          value={assignedJobs.length}
          subtitle="Dispatched assignments"
          icon={<Briefcase className="w-5 h-5" />}
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "profile", label: "Employment & Contact Profile" },
          { id: "training", label: `Academy & Safety Training (${trainings.length})` },
          { id: "certifications", label: `Certifications & Badges (${certifications.length})` },
          { id: "shifts", label: `Assigned Operations (${assignedJobs.length})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
              Contact & Personal Details
            </h3>
            <div className="space-y-3 text-body-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Corporate Email</p>
                  <p className="text-text-secondary">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Dispatch Mobile Phone</p>
                  <p className="text-text-secondary">{employee.phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Record Created</p>
                  <p className="text-text-secondary">
                    {employee.created_at ? new Date(employee.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
              Organizational Role & Compensation
            </h3>
            <div className="space-y-3 text-body-sm">
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-secondary">System Role</span>
                <span className="font-mono text-caption text-primary-600 font-semibold">
                  {employee.role}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-secondary">Operating Department</span>
                <span className="font-medium text-text-primary">
                  {employee.department || "Operations"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-secondary">Compensation Base</span>
                <span className="font-medium text-text-primary">
                  {employee.pay_rate ? `$${employee.pay_rate} / hour` : "Salaried"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-secondary">Status</span>
                <StatusBadge status="Active" label={employee.status?.toUpperCase() || "ACTIVE"} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "training" && (
        <div className="card p-6 space-y-4">
          <h3 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
            OSHA, Safety & Operational Training Modules
          </h3>
          <div className="space-y-3">
            {trainings.map((t) => (
              <div
                key={t.id}
                className="p-3.5 border border-border rounded-lg bg-surface-hover flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-text-primary text-body-sm">{t.title}</p>
                  <p className="text-caption text-text-muted mt-0.5">
                    {t.status === "completed" ? `Completed on ${t.date} • Score: ${t.score}%` : t.date}
                  </p>
                </div>
                <StatusBadge
                  status={t.status === "completed" ? "Active" : "Pending"}
                  label={t.status?.toUpperCase()}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "certifications" && (
        <div className="card p-6 space-y-4">
          <h3 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
            Professional Credentials & Licenses
          </h3>
          <div className="space-y-3">
            {certifications.map((c) => (
              <div
                key={c.id}
                className="p-3.5 border border-border rounded-lg bg-surface-hover flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-text-primary text-body-sm">{c.name}</p>
                    <p className="text-caption text-text-muted mt-0.5">
                      Issued by {c.issuer} • Valid through {c.expires}
                    </p>
                  </div>
                </div>
                <StatusBadge status="Active" label="VERIFIED" />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "shifts" && (
        <DataTable
          data={assignedJobs}
          columns={jobColumns}
          emptyTitle="No Operations Dispatched"
          emptyDescription="This employee is not currently assigned to upcoming field jobs."
        />
      )}
    </div>
  );
}
