"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  PageHeader,
  StatusBadge,
  Modal,
  FormField,
  MetricCard,
  Tabs,
} from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Bot, Phone, Star, TrendingUp, Plus, MessageSquare, HeartHandshake, CheckCircle2 } from "lucide-react";
import { fetchCustomerMetrics, addInquiry, addReview } from "@/lib/queries/customer";

export default function CustomerPage() {
  const [metrics, setMetrics] = useState({
    inquiries: [] as any[],
    reviews: [] as any[],
    totalInquiries: 0,
    newUncontacted: 0,
    totalReviews: 0,
    avgRating: "N/A",
    aiStatus: "active",
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inquiries");

  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [inquiryForm, setInquiryForm] = useState({
    customer_name: "",
    customer_email: "",
    inquiry_type: "Quote",
    message: "",
    source: "web",
    status: "new",
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review_text: "",
    platform: "Google",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomerMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load customer metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const channels = supabase
      .channel("customer-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "inquiries" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, [loadData]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addInquiry(inquiryForm);
      setShowInquiryModal(false);
      setInquiryForm({
        customer_name: "",
        customer_email: "",
        inquiry_type: "Quote",
        message: "",
        source: "web",
        status: "new",
      });
      loadData();
    } catch (err: any) {
      alert("Error adding inquiry: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview(reviewForm);
      setShowReviewModal(false);
      setReviewForm({ rating: 5, review_text: "", platform: "Google" });
      loadData();
    } catch (err: any) {
      alert("Error adding review: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inquiryColumns: Column<any>[] = [
    {
      key: "customer_name",
      header: "Customer / Contact",
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-semibold text-text-primary block text-body-sm">{r.customer_name}</span>
          <span className="text-caption text-text-muted">{r.customer_email || "No email"}</span>
        </div>
      ),
    },
    {
      key: "inquiry_type",
      header: "Inquiry Type",
      sortable: true,
      render: (r) => (
        <span className="badge badge-primary text-[11px] font-semibold">{r.inquiry_type}</span>
      ),
    },
    {
      key: "message",
      header: "Client Message / Request",
      render: (r) => (
        <span className="text-body-sm text-text-secondary truncate max-w-[320px] block" title={r.message}>
          {r.message}
        </span>
      ),
    },
    {
      key: "source",
      header: "Origin Channel",
      render: (r) => (
        <span className="text-caption text-text-muted capitalize">{r.source || "web"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (r) => (
        <StatusBadge
          status={r.status === "resolved" ? "Active" : r.status === "in_progress" ? "Pending" : "Draft"}
          label={r.status?.toUpperCase() || "NEW"}
        />
      ),
    },
  ];

  const reviewColumns: Column<any>[] = [
    {
      key: "rating",
      header: "Rating (CSAT)",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1 text-warning-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-bold text-body-sm text-text-primary">{r.rating} / 5</span>
        </div>
      ),
    },
    {
      key: "review_text",
      header: "Client Testimonial / Feedback",
      render: (r) => (
        <span className="text-body-sm text-text-secondary leading-normal">{r.review_text}</span>
      ),
    },
    {
      key: "platform",
      header: "Source Platform",
      sortable: true,
      render: (r) => (
        <span className="text-caption text-text-muted font-medium">{r.platform || "Direct"}</span>
      ),
    },
    {
      key: "created_at",
      header: "Date Received",
      sortable: true,
      render: (r) => (
        <span className="text-caption text-text-muted">
          {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Intelligence & Retention"
        description="Service requests, customer satisfaction (CSAT) scoring, AI receptionist logs, and feedback management"
        breadcrumbs={[{ label: "Commercial" }, { label: "Customer Experience" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReviewModal(true)}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <Star className="w-4 h-4" /> Add Review
            </button>
            <button
              onClick={() => setShowInquiryModal(true)}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Inquiry
            </button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Customer Inquiries"
          value={metrics.totalInquiries}
          subtitle="Total support & quote requests"
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <MetricCard
          title="Pending Response"
          value={metrics.newUncontacted}
          subtitle="Uncontacted inbound requests"
          icon={<Phone className="w-5 h-5" />}
        />
        <MetricCard
          title="Average CSAT Rating"
          value={metrics.avgRating}
          subtitle="Client satisfaction benchmark"
          icon={<Star className="w-5 h-5" />}
        />
        <MetricCard
          title="Verified Reviews"
          value={metrics.totalReviews}
          subtitle="Feedback submitted"
          icon={<HeartHandshake className="w-5 h-5" />}
        />
      </div>

      {/* Tab Selector */}
      <Tabs
        tabs={[
          { id: "inquiries", label: `Customer Inquiries (${metrics.inquiries.length})` },
          { id: "reviews", label: `Reviews & CSAT (${metrics.reviews.length})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tables based on active tab */}
      {activeTab === "inquiries" ? (
        <DataTable
          data={metrics.inquiries}
          columns={inquiryColumns}
          loading={loading}
          searchable={true}
          searchPlaceholder="Search customer requests by name, email, message..."
          searchKeys={["customer_name", "customer_email", "message"]}
          emptyTitle="No Open Inquiries"
          emptyDescription="Customer tickets and quote requests will appear here."
          emptyAction={
            <button onClick={() => setShowInquiryModal(true)} className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4 mr-1.5" /> Log Customer Request
            </button>
          }
        />
      ) : (
        <DataTable
          data={metrics.reviews}
          columns={reviewColumns}
          loading={loading}
          searchable={true}
          searchPlaceholder="Search review feedback..."
          searchKeys={["review_text", "platform"]}
          emptyTitle="No Client Reviews"
          emptyDescription="Verified customer feedback and satisfaction ratings will appear here."
          emptyAction={
            <button onClick={() => setShowReviewModal(true)} className="btn btn-primary btn-sm">
              <Star className="w-4 h-4 mr-1.5" /> Record Client Review
            </button>
          }
        />
      )}

      {/* Log Inquiry Modal */}
      <Modal
        open={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        title="Log Customer Inquiry"
        description="Record an inbound phone call, portal ticket, or estimate request."
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowInquiryModal(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="inquiry-form"
              disabled={submitting}
              className="btn btn-primary btn-sm"
            >
              {submitting ? "Saving..." : "Save Inquiry"}
            </button>
          </>
        }
      >
        <form id="inquiry-form" onSubmit={handleInquirySubmit} className="space-y-4">
          <FormField label="Customer Name" required>
            <input
              type="text"
              required
              className="form-input"
              value={inquiryForm.customer_name}
              onChange={(e) => setInquiryForm({ ...inquiryForm, customer_name: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Customer Email">
              <input
                type="email"
                className="form-input"
                value={inquiryForm.customer_email}
                onChange={(e) => setInquiryForm({ ...inquiryForm, customer_email: e.target.value })}
              />
            </FormField>

            <FormField label="Inquiry Type">
              <select
                className="form-input"
                value={inquiryForm.inquiry_type}
                onChange={(e) => setInquiryForm({ ...inquiryForm, inquiry_type: e.target.value })}
              >
                <option value="Quote">Quote Request</option>
                <option value="Service Issue">Service Issue</option>
                <option value="Emergency Cleaning">Emergency Cleaning</option>
                <option value="Billing">Billing Inquiry</option>
              </select>
            </FormField>
          </div>

          <FormField label="Detailed Message / Request" required>
            <textarea
              required
              className="form-input h-24 resize-none"
              value={inquiryForm.message}
              onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>

      {/* Add Review Modal */}
      <Modal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Record Customer Satisfaction Review"
        description="Document client feedback, testimonial, or external rating."
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="review-form"
              disabled={submitting}
              className="btn btn-primary btn-sm"
            >
              {submitting ? "Saving..." : "Save Review"}
            </button>
          </>
        }
      >
        <form id="review-form" onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Rating Score (1-5 Stars)">
              <select
                className="form-input"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
              >
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Good</option>
                <option value="3">3 Stars - Average</option>
                <option value="2">2 Stars - Poor</option>
                <option value="1">1 Star - Critical Defect</option>
              </select>
            </FormField>

            <FormField label="Review Platform">
              <select
                className="form-input"
                value={reviewForm.platform}
                onChange={(e) => setReviewForm({ ...reviewForm, platform: e.target.value })}
              >
                <option value="Google">Google Business</option>
                <option value="Direct CSAT">Direct CSAT Survey</option>
                <option value="Quarterly Review">QBR Quarterly Review</option>
              </select>
            </FormField>
          </div>

          <FormField label="Customer Testimonial" required>
            <textarea
              required
              className="form-input h-24 resize-none"
              placeholder="Record the exact client comments and service feedback..."
              value={reviewForm.review_text}
              onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
