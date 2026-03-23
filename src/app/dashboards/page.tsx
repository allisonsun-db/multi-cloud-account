"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DataIcon, SchemaIcon, ErdIcon, StarIcon, OverflowIcon,
  UserGroupIcon, PencilIcon, FilterIcon, ChevronRightIcon,
} from "@/components/icons"
import {
  Hash, AlignJustify, Clock, Plus, X, RefreshCw, Settings2,
  BarChart2, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldType = "measure" | "dimension" | "date"
type GridTab   = "data" | "measures" | "fields"
type Panel     = "datasets" | "filters" | "viz"

// ─── Data ─────────────────────────────────────────────────────────────────────

const DATASETS = [
  { id: "order_analysis",         name: "order_analysis" },
  { id: "line_item_stats",        name: "line_item_stats" },
  { id: "regional_sales_summary", name: "regional_sales_summary" },
]

const MEASURES = [
  "Total Orders", "Total Revenue", "Average Order Value",
  "7 Day Trailing Revenue", "MTD Orders", "YTD Revenue",
]

const FIELDS: { name: string; type: FieldType }[] = [
  { name: "Order Key",      type: "measure" },
  { name: "Customer Key",   type: "measure" },
  { name: "Order Status",   type: "dimension" },
  { name: "Total Price",    type: "measure" },
  { name: "Order Date",     type: "date" },
  { name: "Order Priority", type: "dimension" },
  { name: "Clerk",          type: "dimension" },
  { name: "Ship Priority",  type: "measure" },
  { name: "Comment",        type: "dimension" },
  { name: "Ship Date",      type: "date" },
  { name: "Commit Date",    type: "date" },
  { name: "Receipt Date",   type: "date" },
  { name: "Ship Mode",      type: "dimension" },
  { name: "Quantity",       type: "measure" },
  { name: "Extended Price", type: "measure" },
  { name: "Discount",       type: "measure" },
  { name: "Tax",            type: "measure" },
  { name: "Return Flag",    type: "dimension" },
  { name: "Line Status",    type: "dimension" },
  { name: "Part Key",       type: "measure" },
  { name: "Supplier Key",   type: "measure" },
  { name: "Line Number",    type: "measure" },
  { name: "Part Name",      type: "dimension" },
  { name: "Supplier Name",  type: "dimension" },
]

const GRID_ROWS = [
  { idx:  1, ok:  1, ck:  1, status: "O", price: 172132.34, date: "2025-03-04", priority: "2-HIGH",          clerk: "Flynn F.", sp: 0, comment: "Standard shipping re…" },
  { idx:  2, ok:  2, ck:  2, status: "O", price: 105853.75, date: "2025-03-04", priority: "2-HIGH",          clerk: "Alex A.",  sp: 0, comment: "Economy shipping re…" },
  { idx:  3, ok:  3, ck:  3, status: "P", price:  49701.77, date: "2025-03-04", priority: "3-MEDIUM",        clerk: "Flynn F.", sp: 0, comment: "Economy shipping re…" },
  { idx:  4, ok:  4, ck:  4, status: "P", price: 153644.95, date: "2025-03-04", priority: "3-MEDIUM",        clerk: "Alex A.",  sp: 0, comment: "Standard shipping re…" },
  { idx:  5, ok:  5, ck:  5, status: "P", price: 168587.24, date: "2025-03-04", priority: "5-LOW",           clerk: "Drew D.",  sp: 0, comment: "Express shipping re…" },
  { idx:  6, ok:  6, ck:  6, status: "F", price:  37212.54, date: "2025-03-05", priority: "3-MEDIUM",        clerk: "Blake B.", sp: 0, comment: "Standard shipping re…" },
  { idx:  7, ok:  7, ck:  7, status: "O", price:  57205.86, date: "2025-03-05", priority: "2-HIGH",          clerk: "Alex A.",  sp: 0, comment: "Economy shipping re…" },
  { idx:  8, ok:  8, ck:  8, status: "O", price: 164576.21, date: "2025-03-05", priority: "3-MEDIUM",        clerk: "Casey C.", sp: 0, comment: "Economy shipping re…" },
  { idx:  9, ok:  9, ck:  9, status: "F", price:  63021.14, date: "2025-03-05", priority: "5-LOW",           clerk: "Jamie J.", sp: 0, comment: "Express shipping re…" },
  { idx: 10, ok: 10, ck: 10, status: "O", price: 153977.83, date: "2025-03-05", priority: "4-NOT SPECIFIED", clerk: "Jamie J.", sp: 0, comment: "Economy shipping re…" },
  { idx: 11, ok: 11, ck: 11, status: "F", price: 178287.63, date: "2025-03-06", priority: "5-LOW",           clerk: "Flynn F.", sp: 0, comment: "Standard shipping re…" },
  { idx: 12, ok: 12, ck: 12, status: "P", price: 111172.60, date: "2025-03-06", priority: "2-HIGH",          clerk: "Casey C.", sp: 0, comment: "Economy shipping re…" },
  { idx: 13, ok: 13, ck: 13, status: "P", price:  96144.40, date: "2025-03-06", priority: "4-NOT SPECIFIED", clerk: "Gray G.",  sp: 0, comment: "Express shipping re…" },
  { idx: 14, ok: 14, ck: 14, status: "P", price:  44344.56, date: "2025-03-06", priority: "4-NOT SPECIFIED", clerk: "Jamie J.", sp: 0, comment: "Express shipping re…" },
  { idx: 15, ok: 15, ck: 15, status: "O", price:  89234.10, date: "2025-03-06", priority: "1-URGENT",        clerk: "Alex A.",  sp: 0, comment: "Priority shipping re…" },
  { idx: 16, ok: 16, ck: 16, status: "F", price: 201456.78, date: "2025-03-07", priority: "2-HIGH",          clerk: "Drew D.",  sp: 0, comment: "Standard shipping re…" },
  { idx: 17, ok: 17, ck: 17, status: "O", price:  33891.22, date: "2025-03-07", priority: "5-LOW",           clerk: "Blake B.", sp: 0, comment: "Economy shipping re…" },
  { idx: 18, ok: 18, ck: 18, status: "P", price: 145023.66, date: "2025-03-07", priority: "3-MEDIUM",        clerk: "Casey C.", sp: 0, comment: "Standard shipping re…" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function FieldTypeIcon({ type, size = 10 }: { type: FieldType; size?: number }) {
  const cls = `text-muted-foreground shrink-0`
  if (type === "measure")   return <Hash       size={size} className={cls} />
  if (type === "date")      return <Clock      size={size} className={cls} />
  return <AlignJustify size={size} className={cls} />
}

// ─── Left icon nav ─────────────────────────────────────────────────────────────

const LEFT_NAV: { id: Panel; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "datasets", label: "Datasets",       icon: DataIcon },
  { id: "filters",  label: "Filters",        icon: FilterIcon },
  { id: "viz",      label: "Visualizations", icon: BarChart2 },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardsPage() {
  const [activeNav, setActiveNav] = React.useState("dashboards")
  const [activePanel, setActivePanel]   = React.useState<Panel | null>("datasets")
  const [selectedDataset, setSelectedDataset] = React.useState("order_analysis")
  const [gridTab, setGridTab]           = React.useState<GridTab>("data")
  const [filterText, setFilterText]     = React.useState("")

  const filteredRows = filterText
    ? GRID_ROWS.filter((r) =>
        Object.values(r).some((v) =>
          String(v).toLowerCase().includes(filterText.toLowerCase())
        )
      )
    : GRID_ROWS

  return (
    <AppShell
      activeItem={activeNav}
      onNavigate={setActiveNav}
      workspace="Production"
      mainClassName="overflow-hidden"
    >
      <div className="flex h-full flex-col overflow-hidden">

        {/* ── Dashboard title row ───────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground">Order Analysis Dashboard</h1>
            <button className="text-muted-foreground hover:text-yellow-400 transition-colors" aria-label="Favorite">
              <StarIcon size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon-xs" aria-label="More options">
              <OverflowIcon size={14} className="text-muted-foreground" />
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--success)] shrink-0" />
              Serverless
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
            <Button size="sm">Publish</Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <UserGroupIcon size={14} className="text-muted-foreground" />
              Share
            </Button>
          </div>
        </div>

        {/* ── Tab bar ───────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center border-b border-border px-2 h-9">
          {/* Data tab (active) */}
          <button className="relative flex h-full items-center gap-1.5 px-3 text-xs font-semibold text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary">
            <BarChart2 className="h-3.5 w-3.5" />
            Data
          </button>

          <div className="mx-2 h-4 w-px bg-border" />

          <Button variant="ghost" size="icon-xs" aria-label="Filter canvas">
            <FilterIcon size={14} className="text-muted-foreground" />
          </Button>
          <span className="ml-1 text-xs text-muted-foreground">Order and Lineitem Overview</span>
          <Button variant="ghost" size="icon-xs" className="ml-1" aria-label="Add canvas">
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left icon nav ────────────────────────────────────────── */}
          <div className="flex w-10 shrink-0 flex-col items-center border-r border-border py-1.5 gap-0.5">
            {LEFT_NAV.map((item) => {
              const isActive = activePanel === item.id
              return (
                <button
                  key={item.id}
                  title={item.label}
                  onClick={() => setActivePanel(isActive ? null : item.id)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted-foreground/10"
                  )}
                >
                  <item.icon size={16} />
                </button>
              )
            })}
            <div className="flex-1" />
            <button
              title="Add panel"
              className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-muted-foreground/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* ── Datasets panel ───────────────────────────────────────── */}
          {activePanel === "datasets" && (
            <div className="flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-border">

              {/* Panel header */}
              <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-semibold text-foreground">Datasets</span>
                <button
                  onClick={() => setActivePanel(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close panel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex flex-1 flex-col overflow-y-auto">

                {/* Dataset list */}
                <div className="flex flex-col py-1">
                  {DATASETS.map((ds) => {
                    const isSelected = selectedDataset === ds.id
                    return (
                      <button
                        key={ds.id}
                        onClick={() => setSelectedDataset(ds.id)}
                        className={cn(
                          "group flex h-8 w-full items-center gap-2 px-3 text-left text-xs transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted-foreground/10"
                        )}
                      >
                        <SchemaIcon size={14} className={cn("shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                        <span className="flex-1 truncate">{ds.name}</span>
                        <OverflowIcon
                          size={12}
                          className={cn(
                            "shrink-0 transition-opacity",
                            isSelected ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100 text-muted-foreground"
                          )}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* New Dataset button */}
                <div className="px-3 pb-3 pt-1">
                  <Button variant="outline" size="xs" className="gap-1 w-full justify-start">
                    <Plus className="h-3 w-3" />
                    New Dataset
                  </Button>
                </div>

                <div className="border-t border-border" />

                {/* Dataset schema detail */}
                <div className="flex flex-col py-2">

                  {/* SOURCE section */}
                  <div className="px-3 py-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source</span>
                  </div>

                  {/* Source table row */}
                  <div className="group flex flex-col px-3 py-1">
                    <div className="flex items-center gap-1.5">
                      <ErdIcon size={14} className="shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-xs font-semibold text-foreground">orders</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-muted-foreground hover:text-foreground">
                          <PencilIcon size={12} />
                        </button>
                        <button className="text-muted-foreground hover:text-foreground">
                          <FilterIcon size={12} />
                        </button>
                      </div>
                    </div>
                    <span className="ml-[22px] text-[11px] text-muted-foreground">samples.tpch</span>
                  </div>

                  {/* Joins */}
                  <button className="flex items-center gap-1.5 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors">
                    <span className="ml-[22px] flex-1">3 joins</span>
                    <ChevronRightIcon size={12} />
                  </button>

                  {/* MEASURES section */}
                  <div className="mt-2 flex items-center justify-between px-3 py-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Measures ({MEASURES.length})
                    </span>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  {MEASURES.map((m) => (
                    <button
                      key={m}
                      className="flex h-7 w-full items-center gap-1.5 px-3 text-left text-xs text-foreground hover:bg-muted-foreground/10 transition-colors"
                    >
                      <Hash size={11} className="shrink-0 text-muted-foreground" />
                      {m}
                    </button>
                  ))}

                  {/* FIELDS section */}
                  <div className="mt-2 flex items-center justify-between px-3 py-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Fields ({FIELDS.length})
                    </span>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  {FIELDS.map((f) => (
                    <button
                      key={f.name}
                      className="flex h-7 w-full items-center gap-1.5 px-3 text-left text-xs text-foreground hover:bg-muted-foreground/10 transition-colors"
                    >
                      <FieldTypeIcon type={f.type} size={11} />
                      {f.name}
                    </button>
                  ))}

                </div>
              </div>
            </div>
          )}

          {/* ── Data grid ────────────────────────────────────────────── */}
          <div className="flex flex-1 flex-col overflow-hidden">

            {/* Grid sub-tab bar + toolbar */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-3">
              {/* Sub-tabs */}
              <div className="flex items-center">
                {(["data", "measures", "fields"] as const).map((tab) => {
                  const labels: Record<GridTab, string> = {
                    data:     "order_analysis",
                    measures: `Measures (${MEASURES.length})`,
                    fields:   `Fields (${FIELDS.length})`,
                  }
                  const isActive = gridTab === tab
                  return (
                    <button
                      key={tab}
                      onClick={() => setGridTab(tab)}
                      className={cn(
                        "relative flex h-9 items-center gap-1.5 px-3 text-xs transition-colors",
                        isActive
                          ? "font-semibold text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab === "data" && (
                        <SchemaIcon size={12} className={isActive ? "text-primary" : "text-muted-foreground"} />
                      )}
                      {labels[tab]}
                    </button>
                  )
                })}
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-xs" aria-label="Refresh">
                  <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <div className="relative">
                  <FilterIcon size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-7 w-36 pl-6 text-xs"
                    placeholder="Filter..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="icon-xs" aria-label="Settings">
                  <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Table */}
            {gridTab === "data" && (
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center text-[10px] uppercase tracking-wider">Index</TableHead>
                      {[
                        { label: "Order Key",      type: "measure" as FieldType },
                        { label: "Customer Key",   type: "measure" as FieldType },
                        { label: "Order Status",   type: "dimension" as FieldType },
                        { label: "Total Price",    type: "measure" as FieldType },
                        { label: "Order Date",     type: "date" as FieldType },
                        { label: "Order Priority", type: "dimension" as FieldType },
                        { label: "Clerk",          type: "dimension" as FieldType },
                        { label: "Ship Priority",  type: "measure" as FieldType },
                        { label: "Comment",        type: "dimension" as FieldType },
                      ].map((col) => (
                        <TableHead key={col.label} className="text-[10px] uppercase tracking-wider whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <FieldTypeIcon type={col.type} size={10} />
                            {col.label}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row) => (
                      <TableRow key={row.idx} className="cursor-pointer text-xs">
                        <TableCell className="text-center text-muted-foreground">{row.idx}</TableCell>
                        <TableCell>{row.ok}</TableCell>
                        <TableCell>{row.ck}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell className="tabular-nums">{fmt(row.price)}</TableCell>
                        <TableCell className="tabular-nums">{row.date}</TableCell>
                        <TableCell>{row.priority}</TableCell>
                        <TableCell>{row.clerk}</TableCell>
                        <TableCell>{row.sp}</TableCell>
                        <TableCell className="max-w-[180px] truncate text-muted-foreground">{row.comment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {gridTab === "measures" && (
              <div className="flex-1 overflow-auto p-4">
                <div className="overflow-hidden rounded border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] uppercase tracking-wider">Measure</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider">Expression</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MEASURES.map((m) => (
                        <TableRow key={m} className="text-xs">
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Hash size={11} className="text-muted-foreground" />
                              {m}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {"COUNT(*)"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {gridTab === "fields" && (
              <div className="flex-1 overflow-auto p-4">
                <div className="overflow-hidden rounded border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] uppercase tracking-wider">Field</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider">Type</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider">Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {FIELDS.map((f) => (
                        <TableRow key={f.name} className="text-xs">
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <FieldTypeIcon type={f.type} size={11} />
                              {f.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground capitalize">{f.type}</TableCell>
                          <TableCell className="font-mono text-muted-foreground text-[11px]">orders</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppShell>
  )
}
