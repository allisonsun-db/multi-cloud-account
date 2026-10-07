"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircleIcon, DashboardIcon, NotebookIcon, QueryIcon, TableIcon, TableMeasureIcon, WarningIcon } from "@/components/icons"
import { MOST_NEEDED_SOURCES } from "./data"

// Shared by the Overview tab and the /ontology/wireframe page.

// ─── Top snippet sources — who needs each source vs. who can read it ──────────
// Bar length = number of snippets the source contributes to. On the right, two icon
// counts: has access (green check), and missing access (warning; only users whose
// questions needed it — blank when none).

const ASSET_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Dashboard: DashboardIcon,
  Notebook: NotebookIcon,
  Query: QueryIcon,
  Table: TableIcon,
  "Metric view": TableMeasureIcon,
}

// Per-cell tooltip — each column explains only its own value.
function CellTip({ tip, children }: { tip: React.ReactNode; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top">
        <div className="flex max-w-[260px] flex-col gap-0.5">{tip}</div>
      </TooltipContent>
    </Tooltip>
  )
}

// PLACEHOLDER threshold — authority below this is flagged.
const AUTHORITY_OK = 85

export function SnippetSourcesChart({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const rows = [...MOST_NEEDED_SOURCES].sort((a, b) => b.snippets - a.snippets)
  const max = Math.max(...rows.map((r) => r.snippets), 1)

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[160px_1fr_104px_72px_96px] items-center gap-4 pb-2 text-xs text-muted-foreground">
        <span>Source</span>
        <span># of snippets</span>
        <span className="whitespace-nowrap text-right">Retrievals (30d)</span>
        <span>Authority</span>
        <span>Access</span>
      </div>
      {rows.map((r) => {
        const Icon = ASSET_ICON[r.type] ?? TableIcon
        return (
          <div key={r.name} className="grid grid-cols-[160px_1fr_104px_72px_96px] items-center gap-4 border-t border-dashed border-muted-foreground/30 py-2 text-sm">
            <CellTip tip={<><span className="font-semibold">{r.name}</span><span>{r.type} · Owner: {r.owner}</span></>}>
              <span className="flex min-w-0 items-center gap-2 text-foreground">
                <Icon size={16} className="shrink-0 text-muted-foreground" aria-label={r.type} />
                <span className="truncate">{r.name}</span>
              </span>
            </CellTip>
            {/* Full-height trigger so the hover target is bigger than the bar itself. */}
            <CellTip tip={`Contributes to ${r.snippets.toLocaleString()} snippets`}>
              <span className="flex h-5 items-center">
                <span className="h-[18px] rounded-[3px] bg-muted-foreground/25" style={{ width: `${Math.max((r.snippets / max) * 100, 2)}%` }} />
              </span>
            </CellTip>
            <CellTip tip={`Retrieved by Genie ${r.retrievals.toLocaleString()} times in the last 30 days`}>
              <span className="text-right tabular-nums text-foreground">{r.retrievals.toLocaleString()}</span>
            </CellTip>
            {/* Dot + number — the score carries the meaning; the dot only flags below-threshold. */}
            <CellTip tip={`Authority score ${r.authority}${r.authority < AUTHORITY_OK ? ` · below ${AUTHORITY_OK}` : ""}`}>
              <span className="flex items-center gap-1.5 tabular-nums font-semibold text-foreground">
                <span className={`size-2 shrink-0 rounded-full ${r.authority >= AUTHORITY_OK ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} aria-hidden="true" />
                {r.authority}
              </span>
            </CellTip>
            {/* Green check = has access · warning = missing (relevant users only — whose questions needed it). */}
            <span className="flex items-center gap-4 whitespace-nowrap text-sm tabular-nums text-foreground">
              {/* Fixed-width slots so icons line up in columns regardless of digit count. */}
              <CellTip tip={`${r.needed - r.missing} users have access`}>
                <span className="flex w-[40px] items-center gap-1" aria-label={`${r.needed - r.missing} have access`}>
                  <CheckCircleIcon size={14} className="shrink-0 text-[var(--success)]" />
                  {r.needed - r.missing}
                </span>
              </CellTip>
              <span className="flex w-[40px] items-center">
                {r.missing > 0 && (
                  <CellTip tip={<><span>{r.missing} users missing access</span><span className="opacity-70">Their Genie questions needed this source. Click to grant.</span></>}>
                    <button
                      type="button"
                      onClick={() => onNavigate?.("governance")}
                      aria-label={`${r.missing} missing access — grant`}
                      className="flex items-center gap-1 hover:underline"
                    >
                      <WarningIcon size={14} className="shrink-0 text-[var(--warning)]" />
                      {r.missing}
                    </button>
                  </CellTip>
                )}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
