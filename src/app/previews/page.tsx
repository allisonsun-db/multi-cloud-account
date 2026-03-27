"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ExternalLink, Search, MessageCircle } from "lucide-react"
import { AwsBadge, AzureBadge, GcpBadge } from "@/components/ui/cloud-badge"

// ─── Data ─────────────────────────────────────────────────────────────────────

type Phase = "Public Preview" | "General Availability Soon" | "Private Preview"

type Cloud = "AWS" | "Azure" | "GCP"

type Preview = {
  id: string
  name: string
  phase: Phase
  description: string
  enabled: boolean
  clouds: Cloud[]
}

const INITIAL_PREVIEWS: Preview[] = [
  {
    id: "1",
    name: "Test gasoon preview with account scope and DSL metadata",
    phase: "General Availability Soon",
    description: "Test gasoon preview with metadata in DSL and enablement control being account scoped.",
    enabled: false,
    clouds: ["AWS"],
  },
  {
    id: "2",
    name: "Attribute Based Access Control",
    phase: "Public Preview",
    description: "Attribute Based Access Control (ABAC) in Unity Catalog enables scalable, fine-grained data governance by dynamically enforcing access control policies based on tags and user principals. Administrators can define policies once at the catalog, schema, or table level, using tags to selectively apply row filters or column masks without manually configuring individual securables, streamlining governance across the Lakehouse.",
    enabled: true,
    clouds: ["AWS", "Azure", "GCP"],
  },
  {
    id: "3",
    name: "Attribute Based Access Control in Delta Sharing",
    phase: "Public Preview",
    description: "This feature allows privileged users on the provider side to share ABAC-enabled assets.",
    enabled: true,
    clouds: ["AWS", "Azure", "GCP"],
  },
  {
    id: "4",
    name: "Budget Policy",
    phase: "Public Preview",
    description: "Allow billing admins to enforce tagging requirements across serverless workloads such as workflows, notebooks, DLT pipelines, model-serving, and Databrick Apps.",
    enabled: true,
    clouds: ["AWS", "Azure"],
  },
  {
    id: "5",
    name: "CMK-encrypted Managed Catalogs",
    phase: "Public Preview",
    description: "Customer-managed keys (CMK) for Unity Catalog let you protect data managed by Databricks with your own encryption keys. You can configure encryption at the catalog level, using a separate key for each catalog based on data sensitivity or compliance requirements.",
    enabled: true,
    clouds: ["AWS", "Azure"],
  },
  {
    id: "6",
    name: "Enhanced Cluster Security Policy",
    phase: "Public Preview",
    description: "Enforce security policies on all cluster types, including job clusters and SQL warehouses, with fine-grained controls over configuration options available to users.",
    enabled: false,
    clouds: ["AWS", "Azure", "GCP"],
  },
  {
    id: "7",
    name: "Serverless Compute for Notebooks",
    phase: "General Availability Soon",
    description: "Run notebook workloads on serverless compute without managing cluster lifecycle. Serverless compute starts instantly and scales automatically based on workload demand.",
    enabled: true,
    clouds: ["AWS", "Azure", "GCP"],
  },
  {
    id: "8",
    name: "AI/BI Genie Spaces",
    phase: "Public Preview",
    description: "Create conversational data experiences that allow business users to get answers from your data using natural language. Genie Spaces are powered by Databricks SQL and Foundation Models.",
    enabled: true,
    clouds: ["AWS", "Azure", "GCP"],
  },
  {
    id: "9",
    name: "Lakehouse Monitoring",
    phase: "Public Preview",
    description: "Monitor the quality and drift of your data and ML models directly in Unity Catalog. Automatically generate quality metrics, drift analysis, and anomaly detection for tables and model endpoints.",
    enabled: false,
    clouds: ["AWS", "GCP"],
  },
  {
    id: "10",
    name: "Predictive Optimization",
    phase: "General Availability Soon",
    description: "Automatically optimize Delta tables in Unity Catalog by running OPTIMIZE and VACUUM operations based on table usage patterns, eliminating the need for manual maintenance jobs.",
    enabled: true,
    clouds: ["AWS", "Azure", "GCP"],
  },
]

const PHASE_OPTIONS: Phase[] = ["Public Preview", "General Availability Soon", "Private Preview"]

const phaseBadgeClass: Record<Phase, string> = {
  "Public Preview":           "border border-border text-foreground",
  "General Availability Soon": "border border-border text-foreground",
  "Private Preview":          "border border-border text-foreground",
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PreviewsPage() {
  const [previews, setPreviews] = React.useState(INITIAL_PREVIEWS)
  const [filter, setFilter] = React.useState("")
  const [phase, setPhase] = React.useState<string>("all")
  const [cloud, setCloud] = React.useState<string>("all")

  const filtered = previews.filter((p) => {
    const matchesFilter = p.name.toLowerCase().includes(filter.toLowerCase())
    const matchesPhase = phase === "all" || p.phase === phase
    const matchesCloud = cloud === "all" || p.clouds?.includes(cloud as Cloud)
    return matchesFilter && matchesPhase && matchesCloud
  })

  function toggle(id: string) {
    setPreviews((prev) =>
      prev.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p)
    )
  }

  return (
    <AppShell activeItem="previews">
      <div className="flex flex-col p-6 max-w-[800px] mx-auto w-full">

        {/* Header */}
        <h1 className="text-xl font-semibold text-foreground mb-1">Previews</h1>
        <p className="text-sm text-muted-foreground mb-4">
        Try out previews as new capabilities are rolled out. Changes apply within a few minutes. {" "}
          <a href="#" className="text-primary inline-flex items-center gap-0.5 hover:underline">
            Learn more <ExternalLink className="h-3 w-3" />
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
          <Select value={cloud} onValueChange={setCloud}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select a cloud" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clouds</SelectItem>
              <SelectItem value="AWS">
                <span className="flex items-center gap-1.5">
                  <img src="/aws.png" alt="" width={14} height={14} className="object-contain" />
                  AWS
                </span>
              </SelectItem>
              <SelectItem value="Azure">
                <span className="flex items-center gap-1.5">
                  <img src="/azure.svg" alt="" width={14} height={14} className="object-contain" />
                  Azure
                </span>
              </SelectItem>
              <SelectItem value="GCP">
                <span className="flex items-center gap-1.5">
                  <img src="/gcp.svg" alt="" width={14} height={14} className="object-contain" />
                  GCP
                </span>
              </SelectItem>
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
                <p className="text-sm text-muted-foreground">{preview.description}</p>
                {/* Cloud availability */}
                <div className="flex items-center gap-2 py-2">
                  {(["AWS", "Azure", "GCP"] as Cloud[])
                    .filter((c) => preview.clouds?.includes(c))
                    .map((c, i, arr) => (
                      <React.Fragment key={c}>
                        {c === "AWS" && <AwsBadge />}
                        {c === "Azure" && <AzureBadge />}
                        {c === "GCP" && <GcpBadge />}
                        {i < arr.length - 1 && (
                          <span className="text-border select-none">|</span>
                        )}
                      </React.Fragment>
                    ))}
                </div>
                {/* Links */}
                <div className="flex items-center gap-4 mt-0.5">
                  <a href="#" className="text-primary text-sm inline-flex items-center gap-1 hover:underline">
                    Documentation <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="#" className="text-primary text-sm inline-flex items-center gap-1 hover:underline">
                    <MessageCircle className="h-3.5 w-3.5" /> Send feedback
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
