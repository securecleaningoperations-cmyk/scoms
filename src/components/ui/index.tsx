"use client";

import React from "react";
import clsx from "clsx";

// ═══════════════════════════════════════════════════════════════════════════
// StatusBadge — Standardized status display across all modules
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_STYLES: Record<string, string> = {
  draft: "status-draft",
  pending: "status-pending",
  active: "status-active",
  scheduled: "status-scheduled",
  assigned: "status-assigned",
  "in progress": "status-in-progress",
  "in_progress": "status-in-progress",
  completed: "status-completed",
  approved: "status-approved",
  rejected: "status-rejected",
  cancelled: "status-cancelled",
  overdue: "status-overdue",
  escalated: "status-escalated",
  archived: "status-archived",
  // Additional common statuses
  open: "status-pending",
  closed: "status-archived",
  paid: "status-completed",
  sent: "status-active",
  new: "status-scheduled",
  qualified: "status-assigned",
  won: "status-approved",
  lost: "status-rejected",
  expired: "status-overdue",
  compliant: "status-approved",
  "non-compliant": "status-danger",
  valid: "status-active",
  investigating: "status-in-progress",
  resolved: "status-completed",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
  dot?: boolean;
}

export function StatusBadge({ status, label, className, size = "sm", dot = false }: StatusBadgeProps) {
  const normalized = status.toLowerCase().trim();
  const style = STATUS_STYLES[normalized] || "status-draft";
  
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        style,
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {label || status}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PageHeader — Standard page title, description, and actions
// ═══════════════════════════════════════════════════════════════════════════

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, badge, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-[11px] text-text-muted mb-1">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-text-disabled">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-text-secondary transition-colors">{crumb.label}</a>
                ) : (
                  <span className="text-text-secondary font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold text-text-primary leading-page-title tracking-tight truncate">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-body-sm text-text-secondary mt-0.5">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EmptyState — Explains what's empty and what user can do
// ═══════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-text-muted mb-3 opacity-40">{icon}</div>}
      <h3 className="text-body font-medium text-text-primary">{title}</h3>
      {description && <p className="text-body-sm text-text-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ErrorState — Descriptive error with retry
// ═══════════════════════════════════════════════════════════════════════════

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-body font-medium text-text-primary">{title}</h3>
      {message && <p className="text-body-sm text-text-muted mt-1 max-w-md">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm mt-4">
          Try Again
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LoadingState — Skeleton and spinner variants
// ═══════════════════════════════════════════════════════════════════════════

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "table";
  rows?: number;
  columns?: number;
  message?: string;
}

export function LoadingState({ variant = "spinner", rows = 5, columns = 4, message }: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        {message && <p className="text-body-sm text-text-muted mt-3">{message}</p>}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="w-full">
        <div className="flex gap-4 p-3 bg-bg-inset border-b border-border">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="skeleton h-3 flex-1 rounded" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-3 border-b border-border-light">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="skeleton h-3 flex-1 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // skeleton variant
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-4 rounded" style={{ width: `${50 + Math.random() * 50}%` }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Modal — Accessible dialog component
// ═══════════════════════════════════════════════════════════════════════════

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  if (!open) return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return (
    <div className="overlay-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={clsx("bg-surface rounded-xl shadow-overlay border border-border w-full flex flex-col max-h-[90vh] animate-scale-in", sizeClass)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-section-title font-semibold text-text-primary">{title}</h2>
            {description && <p className="text-body-sm text-text-secondary mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-2 p-4 border-t border-border bg-bg-inset rounded-b-lg"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const btn = target.closest("button[form]") as HTMLButtonElement | null;
              if (btn && btn.type === "submit") {
                const formId = btn.getAttribute("form");
                if (formId) {
                  const formEl = document.getElementById(formId) as HTMLFormElement | null;
                  if (formEl) {
                    e.preventDefault();
                    if (typeof formEl.requestSubmit === "function") {
                      formEl.requestSubmit();
                    } else {
                      formEl.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                    }
                  }
                }
              }
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ConfirmDialog — Confirmation with destructive variant
// ═══════════════════════════════════════════════════════════════════════════

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={clsx("btn", variant === "danger" ? "btn-danger" : "btn-primary")}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : null}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-body-sm text-text-secondary">{message}</p>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Drawer — Slide-over side panel for detail and editing views
// ═══════════════════════════════════════════════════════════════════════════

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const DRAWER_SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

export function Drawer({ open, onClose, title, description, children, footer, size = "md" }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className={clsx("w-screen bg-surface border-l border-border shadow-2xl flex flex-col animate-slide-in-right", DRAWER_SIZES[size])}>
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-title-sm font-semibold text-text-primary">{title}</h3>
              {description && <p className="text-caption text-text-muted mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-bg-inset">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tabs — Accessible tab component
// ═══════════════════════════════════════════════════════════════════════════

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx("flex items-center gap-5 border-b border-border", className)} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={activeTab === t.id}
          onClick={() => onChange(t.id)}
          className={clsx("tab", activeTab === t.id && "tab-active")}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={clsx(
              "ml-1.5 text-[10px] font-semibold rounded-full px-1.5 py-0.5",
              activeTab === t.id ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-500"
            )}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FormSection — Grouped form fields with section header
// ═══════════════════════════════════════════════════════════════════════════

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <fieldset className="space-y-3">
      <div>
        <legend className="text-body font-medium text-text-primary">{title}</legend>
        {description && <p className="text-body-sm text-text-muted mt-0.5">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FormField — Label + input wrapper with validation
// ═══════════════════════════════════════════════════════════════════════════

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-label font-medium text-text-secondary">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-caption text-text-muted">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-caption text-danger-600 mt-1">{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MetricCard — KPI display card
// ═══════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  label?: string;
  title?: string;
  value: string | number;
  change?: { value: string; positive?: boolean };
  icon?: React.ReactNode;
  subtext?: string;
  subtitle?: string;
}

export function MetricCard({ label, title, value, change, icon, subtext, subtitle }: MetricCardProps) {
  const displayLabel = title || label || "";
  const displaySubtext = subtitle || subtext;
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-2">
        <span className="text-label font-medium text-text-muted uppercase tracking-wide">{displayLabel}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <p className="text-[22px] font-semibold text-text-primary leading-tight">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {change && (
          <span className={clsx("text-caption font-medium", change.positive ? "text-success-600" : "text-danger-600")}>
            {change.positive ? "↑" : "↓"} {change.value}
          </span>
        )}
        {displaySubtext && <span className="text-caption text-text-muted">{displaySubtext}</span>}
      </div>
    </div>
  );
}
