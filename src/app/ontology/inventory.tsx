"use client"

import * as React from "react"
import { CheckCircleIcon, SyncIcon, WarningIcon, XCircleIcon } from "@/components/icons"
import {
  ACCOUNT_SOURCE_ASSETS, DOMAIN_INVENTORY, INITIAL_SOURCES, ONTOLOGY_OBJECTS,
  type Coverage, type DomainInventory, type ObjectKind, type OntologyObject, type SourceChannel,
} from "./data"

// Overview data helpers: ontology assets scoped to a domain, connection status by type
// (derived from INITIAL_SOURCES so it matches the Sources tab), and coverage status.

// ─── Scoping ───────────────────────────────────────────────────────────────────

const KIND_FIELD: Record<ObjectKind, keyof Pick<DomainInventory, "snippets" | "pages" | "assets">> = {
  snippets: "snippets",
  pages: "pages",
  assets: "assets",
}

/** Totals + trends for the scope. A single domain is its share of the account totals. */
export function scopedObjects(domain: string): (OntologyObject & { sourceAssets?: number })[] {
  const row = DOMAIN_INVENTORY.find((d) => d.domain === domain)
  return ONTOLOGY_OBJECTS.map((o) => {
    if (!row) return { ...o, sourceAssets: o.kind === "snippets" ? ACCOUNT_SOURCE_ASSETS : undefined }
    const field = KIND_FIELD[o.kind]
    const share = row[field] / o.total
    return {
      ...o,
      total: row[field],
      certified: o.certified === undefined ? undefined : Math.round(o.certified * share),
      trend: o.trend.map((v) => Math.round(v * share)),
      sourceAssets: o.kind === "snippets" ? Math.round(ACCOUNT_SOURCE_ASSETS * share) : undefined,
    }
  })
}

// ─── Tiles ─────────────────────────────────────────────────────────────────────

// Connections — what feeds the ontology. Status, not trend: an admin needs to know
// whether each pipe is healthy. Status always carries an icon + label.
export const CONNECTION_TYPES: { channel: SourceChannel; label: string }[] = [
  { channel: "Enterprise connector", label: "Connectors" },
]

// One line per tile — the most important state wins (attention > syncing > healthy);
// the full breakdown is in the hover title.
export function connectionSummary(channel: SourceChannel) {
  const items = INITIAL_SOURCES.filter((s) => s.channel === channel && s.status !== "Not connected")
  const healthy = items.filter((s) => s.status === "Healthy").length
  const syncing = items.filter((s) => s.status === "Syncing").length
  const attention = items.filter((s) => s.status === "Needs attention").length
  const title = [`${healthy} healthy`, syncing && `${syncing} syncing`, attention && `${attention} need attention`].filter(Boolean).join(" · ")
  return { connected: items.length, healthy, syncing, attention, title }
}

export function ConnectionStatus({ channel }: { channel: SourceChannel }) {
  const { syncing, attention } = connectionSummary(channel)
  if (attention > 0) {
    return (
      <span className="flex items-center gap-1 whitespace-nowrap text-xs text-foreground">
        <WarningIcon size={12} className="shrink-0 text-[var(--warning)]" />{attention} need{attention === 1 ? "s" : ""} attention
      </span>
    )
  }
  if (syncing > 0) {
    return (
      <span className="flex items-center gap-1 whitespace-nowrap text-xs">
        <SyncIcon size={12} className="shrink-0 text-primary" />{syncing} syncing
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 whitespace-nowrap text-xs">
      <CheckCircleIcon size={12} className="shrink-0 text-[var(--success)]" />All healthy
    </span>
  )
}

// ─── Coverage status ─────────────────────────────────────────────────────────────
// Icon + label for each domain's coverage state (never color alone).

export const COVERAGE: Record<Coverage, { label: string; icon: React.ReactNode }> = {
  "good":       { label: "Healthy",    icon: <CheckCircleIcon size={14} className="shrink-0 text-[var(--success)]" /> },
  "gap":        { label: "Gap",        icon: <WarningIcon size={14} className="shrink-0 text-[var(--warning)]" /> },
  "no-curator": { label: "No curator", icon: <XCircleIcon size={14} className="shrink-0 text-destructive" /> },
}
