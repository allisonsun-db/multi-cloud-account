"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { NewWindowIcon, SpeechBubbleIcon } from "@/components/icons"
// ─── Data ─────────────────────────────────────────────────────────────────────

type Phase = "GA" | "Beta" | "Public Preview" | "General Availability Soon" | "Private Preview"

type Preview = {
  id: string
  name: string
  phase: Phase
  description: string
  enabled: boolean
  hideDocs?: boolean
}

const INITIAL_PREVIEWS: Preview[] = [
  {
    id: "mdr",
    name: "Managed disaster recovery",
    phase: "GA",
    description: "A managed disaster recovery solution for Unity Catalog data and metadata assets.",
    enabled: true,
    hideDocs: true,
  },
  {
    id: "mdr-beta",
    name: "Managed disaster recovery: Beta Assets",
    phase: "Beta",
    description: "Turn on the ability to toggle Beta assets in your failover group page.",
    enabled: false,
  },
  {
    id: "1",
    name: "Test gasoon preview with account scope and DSL metadata",
    phase: "General Availability Soon",
    description: "Test gasoon preview with metadata in DSL and enablement control being account scoped.",
    enabled: false,
  },
  {
    id: "2",
    name: "Attribute Based Access Control",
    phase: "Public Preview",
    description: "Attribute Based Access Control (ABAC) in Unity Catalog lets admins define tag-based policies once and apply fine-grained access controls, row filters, and column masks across catalogs, schemas, and tables.",
    enabled: true,
  },
  {
    id: "3",
    name: "Attribute Based Access Control in Delta Sharing",
    phase: "Public Preview",
    description: "This feature allows privileged users on the provider side to share ABAC-enabled assets.",
    enabled: true,
  },
  {
    id: "4",
    name: "Budget Policy",
    phase: "Public Preview",
    description: "Allow billing admins to enforce tagging requirements across serverless workloads such as workflows, notebooks, DLT pipelines, model-serving, and Databrick Apps.",
    enabled: true,
  },
  {
    id: "5",
    name: "CMK-encrypted Managed Catalogs",
    phase: "Public Preview",
    description: "Customer-managed keys (CMK) for Unity Catalog let you protect data managed by Databricks with your own encryption keys. You can configure encryption at the catalog level, using a separate key for each catalog based on data sensitivity or compliance requirements.",
    enabled: true,
  },
  {
    id: "6",
    name: "Enhanced Cluster Security Policy",
    phase: "Public Preview",
    description: "Enforce security policies on all cluster types, including job clusters and SQL warehouses, with fine-grained controls over configuration options available to users.",
    enabled: false,
  },
  {
    id: "7",
    name: "Serverless Compute for Notebooks",
    phase: "General Availability Soon",
    description: "Run notebook workloads on serverless compute without managing cluster lifecycle. Serverless compute starts instantly and scales automatically based on workload demand.",
    enabled: true,
  },
  {
    id: "8",
    name: "AI/BI Genie Spaces",
    phase: "Public Preview",
    description: "Create conversational data experiences that allow business users to get answers from your data using natural language. Genie Spaces are powered by Databricks SQL and Foundation Models.",
    enabled: true,
  },
  {
    id: "9",
    name: "Lakehouse Monitoring",
    phase: "Public Preview",
    description: "Monitor the quality and drift of your data and ML models directly in Unity Catalog. Automatically generate quality metrics, drift analysis, and anomaly detection for tables and model endpoints.",
    enabled: false,
  },
  {
    id: "10",
    name: "Predictive Optimization",
    phase: "General Availability Soon",
    description: "Automatically optimize Delta tables in Unity Catalog by running OPTIMIZE and VACUUM operations based on table usage patterns, eliminating the need for manual maintenance jobs.",
    enabled: true,
  },
]

const PHASE_OPTIONS: Phase[] = ["GA", "Beta", "Public Preview", "General Availability Soon", "Private Preview"]

const phaseBadgeClass: Record<Phase, string> = {
  "GA":                        "border border-border text-foreground",
  "Beta":                      "border border-border text-foreground",
  "Public Preview":           "border border-border text-foreground",
  "General Availability Soon": "border border-border text-foreground",
  "Private Preview":          "border border-border text-foreground",
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PreviewsPage() {
  const [previews, setPreviews] = React.useState(INITIAL_PREVIEWS)
  const [filter, setFilter] = React.useState("")
  const [phase, setPhase] = React.useState<string>("all")

  const filtered = previews.filter((p) => {
    const matchesFilter = p.name.toLowerCase().includes(filter.toLowerCase())
    const matchesPhase = phase === "all" || p.phase === phase
    return matchesFilter && matchesPhase
  })

  function toggle(id: string) {
    setPreviews((prev) =>
      prev.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p)
    )
  }

  return (
    <AppShell activeItem="previews">
      <div className="flex flex-col p-6 max-w-[1000px] mx-auto w-full">

        {/* Header */}
        <h1 className="text-xl font-semibold text-foreground mb-1">Previews</h1>
        <p className="text-sm text-muted-foreground mb-4">
        Try out previews as new capabilities are rolled out. Changes apply within a few minutes. {" "}
          <a href="#" className="text-primary inline-flex items-center gap-0.5 hover:underline">
            Learn more <NewWindowIcon className="size-3" />
          </a>
          .
        </p>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter previews"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={phase} onValueChange={setPhase}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select a phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All phases</SelectItem>
              {PHASE_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preview list */}
        <div className="flex flex-col">
          {filtered.map((preview) => (
            <div key={preview.id} className="flex items-start justify-between gap-8 py-5 border-t border-border">
              <div className="flex flex-col gap-1.5 min-w-0">
                {/* Name + phase badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{preview.name}</span>
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${phaseBadgeClass[preview.phase]}`}>
                    {preview.phase}
                  </span>
                </div>
                {/* Description */}
                <p className="max-w-[720px] text-sm text-muted-foreground">{preview.description}</p>
                {/* Links */}
                <div className="flex items-center gap-4 mt-0.5">
                  {!preview.hideDocs && (
                    <a href="#" className="text-primary text-sm inline-flex items-center gap-1 hover:underline">
                      Documentation <NewWindowIcon className="size-4" />
                    </a>
                  )}
                  <a href="#" className="text-primary text-sm inline-flex items-center gap-1 hover:underline">
                    <SpeechBubbleIcon className="size-4" /> Send feedback
                  </a>
                </div>
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                <span className="text-sm text-muted-foreground">{preview.enabled ? "On" : "Off"}</span>
                <Switch checked={preview.enabled} onCheckedChange={() => toggle(preview.id)} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </AppShell>
  )
}
