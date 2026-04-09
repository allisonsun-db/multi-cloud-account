"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  MoreVertical, ExternalLink, Copy, Pencil,
  ChevronUp, ChevronDown, Info, CircleCheck,
} from "lucide-react"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Switch } from "@/components/ui/switch"
import { PlusIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { CLOUD_ICONS } from "@/components/ui/location-picker"

// ─── Shared workspace data (mirrors workspaces/page.tsx) ──────────────────────

type Workspace = {
  id: string
  name: string
  status: string
  cloud: "AWS" | "Azure" | "GCP"
  pricingTier: string
  region: string
  storage: string
  credentialName: string
  created: string
  metastore: string | null
}

const WORKSPACES: Workspace[] = [
  { id: "1",  name: "prod-us-west",           status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",    storage: "Default",             credentialName: "Serverless",             created: "yesterday at 7:58 AM",    metastore: "prod-metastore" },
  { id: "2",  name: "prod-us-east",           status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",    storage: "prod-storage-bucket", credentialName: "Serverless and classic", created: "yesterday at 7:58 AM",    metastore: "prod-metastore" },
  { id: "3",  name: "staging-us-west",        status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",    storage: "Default",             credentialName: "Serverless",             created: "yesterday at 7:58 AM",    metastore: "staging-metastore" },
  { id: "4",  name: "staging-us-east",        status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "eastus",       storage: "Default",             credentialName: "Serverless",             created: "last Tuesday at 9:00 AM", metastore: "staging-metastore" },
  { id: "5",  name: "data-eng-prod",          status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "eastus2",      storage: "Default",             credentialName: "Serverless and classic", created: "last Tuesday at 9:00 AM", metastore: "prod-metastore" },
  { id: "6",  name: "ml-platform-prod",       status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "us-central1",  storage: "Default",             credentialName: "Serverless",             created: "last Tuesday at 9:00 AM", metastore: "prod-metastore" },
  { id: "7",  name: "analytics-prod",         status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",    storage: "Default",             credentialName: "Serverless and classic", created: "last Monday at 2:00 PM",  metastore: null },
  { id: "8",  name: "analytics-staging",      status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "westeurope",   storage: "Default",             credentialName: "Serverless",             created: "last Monday at 2:00 PM",  metastore: "staging-metastore" },
  { id: "9",  name: "finance-reporting",      status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "europe-west1", storage: "custom-gcs-bucket",   credentialName: "Serverless and classic", created: "last Friday at 3:30 PM",  metastore: "prod-metastore" },
  { id: "10", name: "risk-modeling",          status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",    storage: "Default",             credentialName: "Serverless",             created: "last Friday at 3:30 PM",  metastore: "prod-metastore" },
  { id: "11", name: "marketing-analytics",    status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "eastus",       storage: "Default",             credentialName: "Serverless",             created: "03/19/2026",              metastore: "prod-metastore" },
  { id: "12", name: "customer-data-platform", status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",    storage: "Default",             credentialName: "Serverless and classic", created: "03/19/2026",              metastore: "prod-metastore" },
  { id: "13", name: "security-audit",         status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "us-west1",     storage: "Default",             credentialName: "Serverless",             created: "03/18/2026",              metastore: "prod-metastore" },
  { id: "14", name: "data-science-sandbox",   status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",    storage: "staging-s3-bucket",   credentialName: "Serverless and classic", created: "03/18/2026",              metastore: "dev-metastore" },
  { id: "15", name: "platform-dev",           status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "westus2",      storage: "Default",             credentialName: "Serverless",             created: "03/18/2026",              metastore: "dev-metastore" },
  { id: "16", name: "etl-orchestration",      status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "us-east1",     storage: "Default",             credentialName: "Serverless",             created: "03/18/2026",              metastore: "prod-metastore" },
  { id: "17", name: "realtime-streaming",     status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",    storage: "Default",             credentialName: "Serverless and classic", created: "03/17/2026",              metastore: "prod-metastore" },
  { id: "18", name: "supply-chain-analytics", status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "northeurope",  storage: "Default",             credentialName: "Serverless and classic", created: "03/17/2026",              metastore: "prod-metastore" },
  { id: "19", name: "feature-store-prod",     status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "asia-east1",   storage: "Default",             credentialName: "Serverless",             created: "03/16/2026",              metastore: "prod-metastore" },
  { id: "20", name: "model-serving-prod",     status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",    storage: "Default",             credentialName: "Serverless",             created: "03/15/2026",              metastore: "prod-metastore" },
]

// ─── Detail section card ───────────────────────────────────────────────────────

function DetailSection({
  title,
  children,
  defaultOpen = true,
  editable = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  editable?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="rounded-md border border-border overflow-hidden shadow-[var(--shadow-db-sm)]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-1">
          {open && editable && (
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${title}`}>
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen((v) => !v)} aria-label="Toggle">
            {open
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
            }
          </Button>
        </div>
      </div>
      {open && <div className="px-3 py-4 flex flex-col gap-4">{children}</div>}
    </div>
  )
}

// ─── Key-value row ─────────────────────────────────────────────────────────────

function KVRow({
  label,
  info,
  children,
}: {
  label: string
  info?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex items-center gap-1 w-[240px] shrink-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        {info && <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  )
}

// ─── Sub-section label ─────────────────────────────────────────────────────────

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-muted-foreground">{children}</p>
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function WorkspaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ws = WORKSPACES.find((w) => w.id === params.id) ?? WORKSPACES[0]
  const url = `https://e2-dogfood.staging.cloud.databricks.com/`
  const [missionCritical, setMissionCritical] = React.useState(false)

  return (
    <AppShell activeItem="workspaces">
      <div className="flex flex-col gap-4 p-6">

        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/workspaces">Workspaces</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{ws.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          title={ws.name}
          actions={
            <>
              <Button variant="ghost" size="icon-sm" aria-label="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
              <Button size="sm">
                <ExternalLink className="h-4 w-4" />
                Open workspace
              </Button>
            </>
          }
        />

        <Tabs defaultValue="overview" className="-mt-2">
          <TabsList variant="line" className="w-full justify-start border-b border-border">
            <TabsTrigger value="overview" className="flex-none">Overview</TabsTrigger>
            <TabsTrigger value="permissions" className="flex-none">Permissions</TabsTrigger>
            <TabsTrigger value="addons" className="flex-none">Add-ons</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="flex gap-6 mt-4">

              {/* ── Main content ── */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">

                {/* Status card */}
                <div className="rounded-md border border-border shadow-[var(--shadow-db-sm)] overflow-hidden flex items-stretch">
                  <div className="bg-green-100 flex flex-col justify-center px-3 py-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <CircleCheck className="h-4 w-4 text-[var(--success)]" />
                      <span className="text-sm font-semibold text-[var(--success)] whitespace-nowrap">Running</span>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center justify-between px-4 py-2 min-w-0">
                    <span className="text-sm text-foreground truncate">{url}</span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button variant="ghost" size="icon-sm" aria-label="Copy URL">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Open workspace">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Compute */}
                <DetailSection title="Compute">
                  <KVRow label="Serverless compute">
                    <span className="flex items-center gap-1.5">
                      <CircleCheck className="h-4 w-4 text-[var(--success)]" />
                      Enabled
                    </span>
                  </KVRow>
                  <div className="border-t border-border" />
                  <KVRow label="Classic compute">
                    {ws.credentialName === "Serverless and classic" ? (
                      <span className="flex items-center gap-1.5">
                        <CircleCheck className="h-4 w-4 text-[var(--success)]" />
                        Enabled
                      </span>
                    ) : (
                      <span className="text-foreground">Not enabled</span>
                    )}
                  </KVRow>
                  {ws.credentialName === "Serverless and classic" && <>
                  <KVRow label="Compute credentials">
                    <a href="#" className="text-primary hover:underline">compute-creds</a>
                  </KVRow>
                  <KVRow label="Network configuration">
                    <a href="#" className="text-primary hover:underline">network-config</a>
                  </KVRow>
                  <KVRow label="Automatic cluster update">
                    Not enabled
                  </KVRow>
                  </>}
                </DetailSection>

                {/* Storage */}
                <DetailSection title="Storage">
                  <KVRow label="Workspace storage">
                    <a href="#" className="text-primary hover:underline">cloud-storage</a>
                  </KVRow>
                  <KVRow label="Metastore">
                    {ws.metastore
                      ? <a href="#" className="text-primary hover:underline">{ws.metastore}</a>
                      : <span className="text-muted-foreground">None</span>
                    }
                  </KVRow>
                </DetailSection>

                {/* Networking */}
                <DetailSection title="Networking">
                  <SubLabel>Connectivity</SubLabel>
                  <KVRow label="Front-end private link">None</KVRow>
                  <KVRow label="Back-end private link">None</KVRow>
                  <KVRow label="Network connectivity configuration">None</KVRow>
                  <div className="border-t border-border" />
                  <SubLabel>Policies</SubLabel>
                  <KVRow label="Network policy: Serverless egress">None</KVRow>
                  <KVRow label="Network policy: Content-based ingress">None</KVRow>
                  <KVRow label="Private access settings">None</KVRow>
                </DetailSection>

                {/* Encryption */}
                <DetailSection title="Encryption">
                  <KVRow label="CMK for managed services" info>
                    <a href="#" className="text-primary hover:underline">encryption-key</a>
                  </KVRow>
                  <KVRow label="CMK for workspace storage" info>
                    <a href="#" className="text-primary hover:underline">encryption-key</a>
                  </KVRow>
                </DetailSection>

                {/* Enhanced security & compliance */}
                <DetailSection title="Enhanced security & compliance">
                  <KVRow label="Compliance and security profile" info>Not enabled</KVRow>
                  <KVRow label="Enhanced security monitoring" info>Not enabled</KVRow>
                  <div className="border-t border-border" />
                  <KVRow label="Enforce data processing geography" info>Not enabled</KVRow>
                </DetailSection>

                {/* Mission critical */}
                <DetailSection title="Mission critical" editable={false}>
                  <KVRow label="Mission critical" info>
                    <Switch checked={missionCritical} onCheckedChange={setMissionCritical} />
                  </KVRow>
                  {missionCritical && <KVRow label="Replication plan" info><Button variant="outline" size="sm" onClick={() => router.push(`/workspaces/${ws.id}/replication-plan/new`)}>Create plan</Button></KVRow>}
                </DetailSection>

              </div>

              {/* ── Sidebar ── */}
              <div className="w-[280px] shrink-0">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-foreground">About this workspace</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-[150px] shrink-0">Created</span>
                    <span className="text-sm text-foreground">{ws.created}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-[150px] shrink-0">Pricing tier</span>
                    <span className="text-sm text-foreground">{ws.pricingTier}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-[150px] shrink-0">Region</span>
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      {CLOUD_ICONS[ws.cloud]}
                      {ws.region}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <p className="text-sm text-muted-foreground mt-4">Permissions content.</p>
          </TabsContent>

          <TabsContent value="addons">
            <p className="text-sm text-muted-foreground mt-4">Add-ons content.</p>
          </TabsContent>
        </Tabs>

      </div>
    </AppShell>
  )
}
