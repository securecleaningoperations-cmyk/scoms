"use client";

import React, { useState, useMemo, useCallback } from "react";
import clsx from "clsx";
import { LoadingState, EmptyState, StatusBadge } from "@/components/ui";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, Search, Download,
  Columns3, Filter, X
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string;
  label?: string;
  header?: string;
  sortable?: boolean;
  visible?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  pageSize?: number;
  pageSizes?: number[];
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  bulkActions?: React.ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  idKey?: string;
  toolbar?: React.ReactNode;
  exportable?: boolean;
  onExport?: () => void;
  className?: string;
  stickyHeader?: boolean;
  compact?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────

export function DataTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  loading = false,
  error,
  emptyTitle = "No records found",
  emptyDescription,
  emptyAction,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys,
  pageSize: initialPageSize = 20,
  pageSizes = [10, 20, 50, 100],
  onRowClick,
  rowActions,
  bulkActions,
  selectable = false,
  selectedIds = new Set<string>(),
  onSelectionChange,
  idKey = "id",
  toolbar,
  exportable = false,
  onExport,
  className,
  stickyHeader = false,
  compact = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const vis: Record<string, boolean> = {};
    initialColumns.forEach((c) => {
      vis[c.key] = c.visible !== false;
    });
    return vis;
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  const visibleColumns = useMemo(
    () => initialColumns.filter((c) => columnVisibility[c.key] !== false),
    [initialColumns, columnVisibility]
  );

  // ── Search ────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    const keys = searchKeys || initialColumns.map((c) => c.key);
    return data.filter((row) =>
      keys.some((key) => {
        const val = row[key];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, search, searchKeys, initialColumns]);

  // ── Sort ──────────────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  // ── Pagination ────────────────────────────────────────────────────
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(
    () => sortedData.slice(page * pageSize, (page + 1) * pageSize),
    [sortedData, page, pageSize]
  );

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }, [sortKey]);

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    const pageIds = paginatedData.map((r) => r[idKey]);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    const newIds = new Set(selectedIds);
    pageIds.forEach((id) => {
      if (allSelected) newIds.delete(id);
      else newIds.add(id);
    });
    onSelectionChange(newIds);
  }, [paginatedData, selectedIds, onSelectionChange, idKey]);

  const handleSelectRow = useCallback((id: string) => {
    if (!onSelectionChange) return;
    const newIds = new Set(selectedIds);
    if (newIds.has(id)) newIds.delete(id);
    else newIds.add(id);
    onSelectionChange(newIds);
  }, [selectedIds, onSelectionChange]);

  const allPageSelected = paginatedData.length > 0 && paginatedData.every((r) => selectedIds.has(r[idKey]));

  // ── Render ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={clsx("scoms-panel-flush", className)}>
        <LoadingState variant="table" rows={5} columns={visibleColumns.length} />
      </div>
    );
  }

  return (
    <div className={clsx("scoms-panel-flush flex flex-col", className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border-b border-border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {searchable && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="input pl-8 !py-1.5 !text-body-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          {selectedIds.size > 0 && (
            <span className="text-caption text-primary-600 font-medium whitespace-nowrap">
              {selectedIds.size} selected
            </span>
          )}
          {selectedIds.size > 0 && bulkActions}
          {toolbar}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Column Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="btn btn-ghost btn-sm"
              title="Toggle columns"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>
            {showColumnPicker && (
              <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-30 w-48 py-1">
                {initialColumns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 px-3 py-1.5 text-body-sm hover:bg-surface-hover cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={columnVisibility[col.key] !== false}
                      onChange={() =>
                        setColumnVisibility((prev) => ({
                          ...prev,
                          [col.key]: !prev[col.key],
                        }))
                      }
                      className="rounded"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {exportable && (
            <button onClick={onExport} className="btn btn-ghost btn-sm" title="Export">
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="scoms-table">
          <thead className={stickyHeader ? "sticky top-0 z-10" : ""}>
            <tr>
              {selectable && (
                <th className="w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    col.sortable && "sortable",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className={clsx("flex items-center gap-1", col.align === "right" && "justify-end")}>
                    {col.header ?? col.label}
                    {col.sortable && (
                      <span className="inline-flex">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {rowActions && <th className="w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}>
                  <EmptyState
                    title={search ? `No results for "${search}"` : emptyTitle}
                    description={search ? "Try adjusting your search terms" : emptyDescription}
                    action={!search ? emptyAction : undefined}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => {
                const rowId = row[idKey];
                return (
                  <tr
                    key={rowId || i}
                    className={clsx(
                      onRowClick && "cursor-pointer",
                      selectedIds.has(rowId) && "bg-primary-50"
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(rowId)}
                          onChange={() => handleSelectRow(rowId)}
                          className="rounded"
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className={clsx(
                          compact && "!py-2",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center"
                        )}
                      >
                        {col.render
                          ? col.render(row[col.key], row, i)
                          : col.key === "status"
                          ? <StatusBadge status={String(row[col.key] || "—")} />
                          : (row[col.key] ?? "—")}
                      </td>
                    ))}
                    {rowActions && (
                      <td onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedData.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2.5 border-t border-border text-body-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="text-caption text-text-muted">
              {sortedData.length === data.length
                ? `${sortedData.length} records`
                : `${sortedData.length} of ${data.length} records`}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="input !w-auto !py-0.5 !px-1.5 !text-caption"
            >
              {pageSizes.map((s) => (
                <option key={s} value={s}>{s} / page</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-caption text-text-muted mr-2">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn-ghost btn-sm !px-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn btn-ghost btn-sm !px-1.5"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
