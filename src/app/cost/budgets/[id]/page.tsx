"use client"

import * as React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart } from "@/components/monitoring/charts"
import { getBudget, formatUSD, type BudgetStatus } from "@/lib/budgets"
import { CircleAlert, Mail, Info } from "lucide-react"
import { cn } from "@/lib/utils"

// Budget detail — drill-down from the Cost → Budgets table. A KPI row (MTD spend,
// remaining, threshold) over a cumulative-spend chart with dashed alert-threshold lines,
// plus a right-hand metadata rail (status, scope, tags, thresholds+recipients, permissions).
// Mock data via src/lib/budgets.ts.

const STATUS_TONE: Record<BudgetStatus, string> = {
  "On track":  "text-[var(--success)]",
  "At risk":   "text-[var(--warning)]",
  "Exhausted": "text-destructive",
}

// Short date ticks for an 18-day MTD series (Jan 1 → Jan 18).
const DATE_TICKS = [
  { at: 0, label: "Jan 1" },
  { at: 2, label: "Jan 3" },
  { at: 4, label: "Jan 5" },
  { at: 6, label: "Jan 7" },
  { at: 8, label: "Jan 9" },
  { at: 10, label: "Jan 11" },
  { at: 12, label: "Jan 13" },
  { at: 14, label: "Jan 15" },
  { at: 16, label: "Jan 17" },
]

function RailLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
      {children}
      <Info className="h-3.5 w-3.5 text-muted-foreground" />
    </p>
  )
}

function fmtK(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`
}

export default function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const budget = getBudget(id)
  if (!budget) notFound()

  const usedPct = Math.round((budget.used / budget.limit) * 100)
  const remaining = Math.max(0, budget.limit - budget.used)
  const remainingPct = Math.round((remaining / budget.limit) * 100)

  // Threshold lines from the alert thresholds (red = 100%, amber = 90%, green = 75%).
  const thresholdColors = ["var(--trend-positive)", "var(--warning)", "var(--trend-negative)"]
  const thresholds = budget.thresholds.map((t, i) => ({
    value: t.amount,
    color: thresholdColors[i] ?? "var(--muted-foreground)",
    label: `${fmtK(t.amount)} threshold`,
  }))

  return (
    <AppShell activeItem="cost">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 p-6">
        {/* Header — breadcrumb over the budget-name title, with status + actions. */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm">
              <Link href="/cost" className="text-primary hover:underline">Cost</Link>
              <span className="text-muted-foreground" aria-hidden="true">/</span>
              <span className="text-muted-foreground">Budgets</span>
            </div>
            <h1 className="flex min-w-0 items-center gap-3 text-[22px] leading-7 font-semibold text-foreground">
              <span className="truncate">{budget.name}</span>
              <span className={cn("flex shrink-0 items-center gap-1 text-sm font-normal", STATUS_TONE[budget.status])}>
                <CircleAlert className="h-4 w-4" />
                {budget.status}
              </span>
            </h1>
          </div>
          <Button variant="outline" size="sm" className="shrink-0">Edit budget</Button>
        </div>
        <div className="border-t border-border" />

        {/* Body: chart card (left) + metadata rail (right) */}
        <div className="flex gap-8">
          {/* Chart card */}
          <div className="min-w-0 flex-1 rounded-md border border-border p-5">
            <div className="mb-4 flex flex-wrap gap-8 border-b border-border pb-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">Cumulative spend (MTD)</span>
                <span className="text-[22px] leading-7 font-semibold text-foreground">{formatUSD(budget.used)}</span>
                <span className="text-sm text-muted-foreground">{usedPct}% of budget</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">Remaining to spend</span>
                <span className="text-[22px] leading-7 font-semibold text-foreground">{formatUSD(remaining)}</span>
                <span className="text-sm text-muted-foreground">{remainingPct}% of budget</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  Budget threshold
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <span className="text-[22px] leading-7 font-semibold text-foreground">{formatUSD(budget.limit)}</span>
                <span className="text-sm text-muted-foreground">{budget.period.toLowerCase()}</span>
              </div>
            </div>

            <BarChart
              data={budget.spendSeries}
              xLabels={DATE_TICKS}
              height={300}
              gap={6}
              thresholds={thresholds}
              seriesLabel="Spend"
              formatY={(v) => (v === 0 ? "$0" : `$${(v / 1000).toFixed(1)}K`)}
            />
          </div>

          {/* Metadata rail */}
          <div className="flex w-[300px] shrink-0 flex-col gap-5">
            <div className="flex flex-col gap-2">
              <RailLabel>Status</RailLabel>
              <span className={cn("flex items-center gap-1.5 text-sm", STATUS_TONE[budget.status])}>
                <CircleAlert className="h-4 w-4" />
                {budget.status}
              </span>
            </div>

            <div className="border-t border-border" />

            <div className="flex flex-col gap-2">
              <RailLabel>Workspaces</RailLabel>
              <div>
                <Badge variant="secondary" className="font-normal text-sm">{budget.workspaces}</Badge>
              </div>
            </div>

            <div className="border-t border-border" />

            <div className="flex flex-col gap-2">
              <RailLabel>Tags</RailLabel>
              <div className="flex flex-wrap gap-1.5">
                {budget.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="font-normal text-sm">{t}</Badge>
                ))}
              </div>
            </div>

            <div className="border-t border-border" />

            <div className="flex flex-col gap-2.5">
              <p className="text-sm text-muted-foreground">Monthly thresholds and alerts</p>
              {budget.thresholds.map((t, i) => (
                <div key={i} className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">{formatUSD(t.amount)}</span>
                  <div className="flex min-w-0 flex-col items-end gap-1">
                    {t.recipients.map((r) => (
                      <span key={r} className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{r}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border" />

            <div className="flex flex-col gap-2">
              <RailLabel>Permissions</RailLabel>
              <div>
                <Badge variant="secondary" className="font-normal text-sm">{budget.permissions}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
