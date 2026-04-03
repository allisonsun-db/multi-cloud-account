"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { MoreVertical, Info, ChevronUp, ChevronDown, ExternalLink, UserRound, Search, AlertTriangle } from "lucide-react"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { CLOUD_ICONS } from "@/components/ui/location-picker"
import { CheckCircleIcon, MinusCircleIcon, LoadingIcon } from "@/components/icons"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogBody, DialogFooter,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PencilIcon } from "@/components/icons"

// ─── Metastore data (mirrors catalog/page.tsx) ─────────────────────────────────

type Metastore = {
  id: string
  name: string
  cloud: "AWS" | "Azure" | "GCP"
  region: string
  storagePath: string
  iamRoleArn: string
  metastoreId: string
  createdAt: string
  updatedAt: string
  owner: string
}

const METASTORES: Metastore[] = [
  { id: "1",  name: "prod-metastore",                       cloud: "AWS",   region: "us-east-1",    storagePath: "s3://prod-uc-metastore/",        iamRoleArn: "arn:aws:iam::123456789012:role/prod-uc-role",    metastoreId: "a1b2c3d4-0001", createdAt: "03/19/2026", updatedAt: "03/19/2026", owner: "admins" },
  { id: "2",  name: "prod-metastore-west",                  cloud: "AWS",   region: "us-west-2",    storagePath: "s3://prod-uc-west/",             iamRoleArn: "arn:aws:iam::123456789012:role/prod-uc-west-role", metastoreId: "a1b2c3d4-0002", createdAt: "03/08/2026", updatedAt: "03/08/2026", owner: "admins" },
  { id: "3",  name: "staging-metastore",                    cloud: "Azure", region: "eastus",       storagePath: "abfss://staging@uc.dfs.core.windows.net/", iamRoleArn: "",                                         metastoreId: "a1b2c3d4-0003", createdAt: "03/07/2026", updatedAt: "03/07/2026", owner: "staging-team" },
  { id: "4",  name: "staging-metastore-west",               cloud: "Azure", region: "westus2",      storagePath: "",                               iamRoleArn: "",                                                metastoreId: "a1b2c3d4-0004", createdAt: "03/03/2026", updatedAt: "03/04/2026", owner: "staging-team" },
  { id: "5",  name: "dev-metastore",                        cloud: "GCP",   region: "us-west1",     storagePath: "gs://dev-uc-metastore/",         iamRoleArn: "",                                                metastoreId: "a1b2c3d4-0005", createdAt: "03/02/2026", updatedAt: "03/05/2026", owner: "dev-team" },
  { id: "6",  name: "analytics-metastore",                  cloud: "AWS",   region: "us-west-2",    storagePath: "s3://analytics-uc/",             iamRoleArn: "arn:aws:iam::123456789012:role/analytics-uc-role", metastoreId: "a1b2c3d4-0006", createdAt: "03/01/2026", updatedAt: "03/01/2026", owner: "analytics-team" },
  { id: "7",  name: "ml-platform-metastore",                cloud: "GCP",   region: "us-central1",  storagePath: "gs://ml-uc-metastore/",          iamRoleArn: "",                                                metastoreId: "a1b2c3d4-0007", createdAt: "02/27/2026", updatedAt: "02/27/2026", owner: "ml-team" },
  { id: "8",  name: "data-eng-metastore",                   cloud: "AWS",   region: "us-west-2",    storagePath: "s3://data-eng-uc/",              iamRoleArn: "arn:aws:iam::123456789012:role/data-eng-uc-role",  metastoreId: "a1b2c3d4-0008", createdAt: "02/25/2026", updatedAt: "02/25/2026", owner: "data-eng-team" },
  { id: "9",  name: "finance-metastore",                    cloud: "Azure", region: "westeurope",   storagePath: "abfss://finance@uc.dfs.core.windows.net/", iamRoleArn: "",                                        metastoreId: "a1b2c3d4-0009", createdAt: "02/25/2026", updatedAt: "02/25/2026", owner: "finance-team" },
  { id: "10", name: "az-global-uc-test-unstable-staging-2", cloud: "Azure", region: "eastus",       storagePath: "",                               iamRoleArn: "",                                                metastoreId: "a1b2c3d4-0010", createdAt: "02/23/2026", updatedAt: "02/23/2026", owner: "platform-team" },
  { id: "11", name: "risk-metastore",                       cloud: "AWS",   region: "us-east-1",    storagePath: "s3://risk-uc/",                  iamRoleArn: "arn:aws:iam::123456789012:role/risk-uc-role",      metastoreId: "a1b2c3d4-0011", createdAt: "02/20/2026", updatedAt: "02/21/2026", owner: "risk-team" },
  { id: "12", name: "customer-data-metastore",              cloud: "GCP",   region: "europe-west1", storagePath: "gs://customer-data-uc/",         iamRoleArn: "",                                                metastoreId: "a1b2c3d4-0012", createdAt: "02/18/2026", updatedAt: "02/18/2026", owner: "cx-team" },
  { id: "13", name: "marketing-metastore",                  cloud: "AWS",   region: "us-east-1",    storagePath: "s3://marketing-uc/",             iamRoleArn: "arn:aws:iam::123456789012:role/marketing-uc-role", metastoreId: "a1b2c3d4-0013", createdAt: "02/15/2026", updatedAt: "02/16/2026", owner: "marketing-team" },
  { id: "14", name: "security-audit-metastore",             cloud: "GCP",   region: "us-west1",     storagePath: "gs://security-audit-uc/",        iamRoleArn: "",                                                metastoreId: "a1b2c3d4-0014", createdAt: "02/10/2026", updatedAt: "02/10/2026", owner: "security-team" },
]

// ─── Workspaces assigned to this metastore ────────────────────────────────────

type Workspace = {
  id: string
  name: string
  status: string
  cloud: "AWS" | "Azure" | "GCP"
  region: string
  metastore: string | null
  currentMetastore?: string
}

const WORKSPACES: Workspace[] = [
  { id: "1",  name: "prod-us-west",           status: "Running", cloud: "AWS",   region: "us-west-2",    metastore: "prod-metastore" },
  { id: "2",  name: "prod-us-east",           status: "Running", cloud: "AWS",   region: "us-east-1",    metastore: "prod-metastore" },
  { id: "3",  name: "staging-us-west",        status: "Running", cloud: "AWS",   region: "us-west-2",    metastore: "staging-metastore" },
  { id: "4",  name: "staging-us-east",        status: "Running", cloud: "Azure", region: "eastus",       metastore: "staging-metastore" },
  { id: "5",  name: "data-eng-prod",          status: "Running", cloud: "Azure", region: "eastus2",      metastore: "prod-metastore" },
  { id: "6",  name: "ml-platform-prod",       status: "Running", cloud: "GCP",   region: "us-central1",  metastore: "prod-metastore" },
  { id: "7",  name: "analytics-prod",         status: "Running", cloud: "AWS",   region: "us-east-1",    metastore: null },
  { id: "8",  name: "analytics-staging",      status: "Running", cloud: "Azure", region: "westeurope",   metastore: "staging-metastore" },
  { id: "9",  name: "finance-reporting",      status: "Running", cloud: "GCP",   region: "europe-west1", metastore: "prod-metastore" },
  { id: "10", name: "risk-modeling",          status: "Running", cloud: "AWS",   region: "us-east-1",    metastore: "prod-metastore" },
  { id: "11", name: "marketing-analytics",    status: "Running", cloud: "Azure", region: "eastus",       metastore: "prod-metastore" },
  { id: "12", name: "customer-data-platform", status: "Running", cloud: "AWS",   region: "us-east-1",    metastore: "prod-metastore" },
  { id: "13", name: "security-audit",         status: "Running", cloud: "GCP",   region: "us-west1",     metastore: "prod-metastore" },
  { id: "14", name: "data-science-sandbox",   status: "Running", cloud: "AWS",   region: "us-west-2",    metastore: "dev-metastore" },
  { id: "15", name: "platform-dev",           status: "Running", cloud: "Azure", region: "westus2",      metastore: "dev-metastore" },
  { id: "16", name: "etl-orchestration",      status: "Running", cloud: "GCP",   region: "us-east1",     metastore: "prod-metastore" },
  { id: "17", name: "realtime-streaming",     status: "Running", cloud: "AWS",   region: "us-west-2",    metastore: "prod-metastore" },
  { id: "18", name: "supply-chain-analytics", status: "Running", cloud: "Azure", region: "northeurope",  metastore: "prod-metastore" },
  { id: "19", name: "feature-store-prod",     status: "Running", cloud: "GCP",   region: "asia-east1",   metastore: "prod-metastore" },
  { id: "20", name: "model-serving-prod",          status: "Running", cloud: "AWS",   region: "us-east-1",    metastore: "prod-metastore" },
  { id: "21", name: "west-reporting",              status: "Running", cloud: "AWS",   region: "us-west-2",    metastore: "prod-metastore-west" },
  { id: "22", name: "west-data-eng",               status: "Running", cloud: "AWS",   region: "us-west-2",    metastore: "prod-metastore-west" },
  { id: "23", name: "westus2-analytics",           status: "Running", cloud: "Azure", region: "westus2",      metastore: "staging-metastore-west" },
  { id: "24", name: "analytics-platform",          status: "Running", cloud: "AWS",   region: "us-west-2",    metastore: "analytics-metastore" },
  { id: "25", name: "ml-training-prod",            status: "Running", cloud: "GCP",   region: "us-central1",  metastore: "ml-platform-metastore" },
  { id: "26", name: "ml-inference",                status: "Running", cloud: "GCP",   region: "us-central1",  metastore: "ml-platform-metastore" },
  { id: "27", name: "data-eng-pipeline",           status: "Running", cloud: "AWS",   region: "us-west-2",    metastore: "data-eng-metastore" },
  { id: "28", name: "finance-prod",                status: "Running", cloud: "Azure", region: "westeurope",   metastore: "finance-metastore" },
  { id: "29", name: "az-global-uc-workspace",      status: "Running", cloud: "Azure", region: "eastus",       metastore: "az-global-uc-test-unstable-staging-2" },
  { id: "30", name: "risk-analytics",              status: "Running", cloud: "AWS",   region: "us-east-1",    metastore: "risk-metastore" },
  { id: "31", name: "customer-insights",           status: "Running", cloud: "GCP",   region: "europe-west1", metastore: "customer-data-metastore" },
  { id: "32", name: "marketing-platform",          status: "Running", cloud: "AWS",   region: "us-east-1",    metastore: "marketing-metastore" },
  { id: "33", name: "security-compliance",         status: "Running", cloud: "GCP",   region: "us-west1",     metastore: "security-audit-metastore" },
]

// ─── Detail section card ───────────────────────────────────────────────────────

function DetailSection({
  title,
  children,
  defaultOpen = true,
  editable = true,
  onEdit,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  editable?: boolean
  onEdit?: () => void
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="rounded-md border border-border overflow-hidden shadow-[var(--shadow-db-sm)]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-1">
          {editable && open && (
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${title}`} onClick={onEdit}>
              <PencilIcon size={16} className="text-muted-foreground" />
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
  multiline,
  children,
}: {
  label: string
  info?: boolean
  multiline?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex gap-2", multiline ? "items-start" : "items-center")}>
      <div className={cn("flex items-center gap-1 w-[240px] shrink-0", multiline && "pt-[3px]")}>
        <span className="text-sm text-muted-foreground">{label}</span>
        {info && <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      </div>
      <div className="text-sm text-foreground flex items-center">{children}</div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MetastoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ms = METASTORES.find((m) => m.id === params.id) ?? METASTORES[0]
  const assignedWorkspaces = WORKSPACES.filter((w) => w.metastore === ms.name)
  const [deltaSharing, setDeltaSharing] = React.useState(false)
  const [showAssignModal, setShowAssignModal] = React.useState(false)
  const [selectedWorkspaces, setSelectedWorkspaces] = React.useState<Set<string>>(
    new Set(assignedWorkspaces.map((w) => w.id))
  )
  const [wsFilter, setWsFilter] = React.useState("")
  const [autoAssign, setAutoAssign] = React.useState(false)

  const filteredWorkspaces = WORKSPACES.filter((w) =>
    w.cloud === ms.cloud &&
    w.region === ms.region &&
    (!wsFilter || w.name.toLowerCase().includes(wsFilter.toLowerCase()))
  )

  function toggleWorkspace(id: string) {
    setSelectedWorkspaces((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedWorkspaces.size === filteredWorkspaces.length && filteredWorkspaces.length > 0) {
      setSelectedWorkspaces(new Set())
    } else {
      setSelectedWorkspaces(new Set(filteredWorkspaces.map((w) => w.id)))
    }
  }

  return (
    <AppShell activeItem="catalog">
      <div className="flex flex-col gap-4 p-6">

        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/catalog">Metastore</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{ms.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          title={ms.name}
          actions={
            <>
              <Button variant="ghost" size="icon-sm" aria-label="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </>
          }
        />

        <div className="-mt-2">
          <div className="border-b border-border" />
          <div className="flex gap-6 mt-4">

              {/* Main content */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">

                {/* Storage */}
                <DetailSection title="Storage">
                  <KVRow label="Storage root path" info>
                    {ms.storagePath
                      ? <span className="font-mono text-[12px]">{ms.storagePath}</span>
                      : <span className="text-muted-foreground">—</span>
                    }
                  </KVRow>
                  {ms.cloud === "AWS" && (
                    <KVRow label="IAM role ARN" info>
                      {ms.iamRoleArn
                        ? <span className="font-mono text-[12px]">{ms.iamRoleArn}</span>
                        : <span className="text-muted-foreground">—</span>
                      }
                    </KVRow>
                  )}
                </DetailSection>

                {/* Workspaces */}
                <DetailSection title="Workspaces" onEdit={() => setShowAssignModal(true)}>
                  <KVRow label="Workspaces" multiline>
                    {assignedWorkspaces.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {assignedWorkspaces.slice(0, 5).map((w) => (
                          <Badge key={w.id} variant="secondary" className="font-normal text-sm">{w.name}</Badge>
                        ))}
                        {assignedWorkspaces.length > 5 && (
                          <Badge variant="secondary" className="font-normal text-sm">+{assignedWorkspaces.length - 5} more</Badge>
                        )}
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="w-fit shadow-xs">
                        Assign workspaces
                      </Button>
                    )}
                  </KVRow>
                </DetailSection>

                {/* Admin & Sharing */}
                <DetailSection title="Admin &amp; Sharing" editable={false}>
                  <KVRow label="Metastore Admin" info>
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">Allison Sun</span>
                      <Button variant="ghost" size="icon-sm" className="size-7 text-muted-foreground">
                        <PencilIcon size={16} className="text-muted-foreground" />
                      </Button>
                    </div>
                  </KVRow>
                  <div className="border-t border-border" />
                  <KVRow label="Delta Sharing">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="delta-sharing"
                        checked={deltaSharing}
                        onCheckedChange={(v) => setDeltaSharing(!!v)}
                        className="mt-[2px]"
                      />
                      <Label htmlFor="delta-sharing" className="font-normal cursor-pointer leading-5">
                        Allow Delta Sharing with parties outside your organization
                      </Label>
                    </div>
                  </KVRow>
                </DetailSection>

              </div>

              {/* Sidebar */}
              <div className="w-[280px] shrink-0">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-foreground">About this metastore</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-[150px] shrink-0">Created</span>
                    <span className="text-sm text-foreground">{ms.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-[150px] shrink-0">Region</span>
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      {CLOUD_ICONS[ms.cloud]}
                      {ms.region}
                    </span>
                  </div>
                </div>
              </div>

            </div>
        </div>

      </div>
      {/* Workspace Assignment Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="w-[800px] max-w-[calc(100%-2rem)] sm:max-w-[800px] flex flex-col max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Assign {ms.name} to workspaces</DialogTitle>
          </DialogHeader>

          <DialogBody className="flex flex-col gap-3 overflow-hidden">
            <p className="text-sm text-muted-foreground">Select from workspaces in the same cloud and region.</p>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Filter workspaces"
                className="pl-8"
                value={wsFilter}
                onChange={(e) => setWsFilter(e.target.value)}
              />
            </div>

            <div className="overflow-y-auto rounded border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filteredWorkspaces.length > 0 && selectedWorkspaces.size === filteredWorkspaces.length}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Metastore</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkspaces.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No workspaces found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWorkspaces.map((w) => (
                      <TableRow
                        key={w.id}
                        className="cursor-pointer data-[state=selected]:bg-transparent"
                        onClick={() => toggleWorkspace(w.id)}
                        data-state={selectedWorkspaces.has(w.id) ? "selected" : undefined}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedWorkspaces.has(w.id)}
                            onCheckedChange={() => toggleWorkspace(w.id)}
                            aria-label={`Select ${w.name}`}
                          />
                        </TableCell>
                        <TableCell className="w-8">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center">
                                {w.status === "Running" && <CheckCircleIcon size={14} className="text-[var(--success)]" />}
                                {w.status === "Stopped" && <MinusCircleIcon size={14} className="text-muted-foreground" />}
                                {w.status === "Provisioning" && <LoadingIcon size={14} className="text-[var(--warning)]" />}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{w.status}</TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{w.name}</TableCell>
                        <TableCell>{w.region}</TableCell>
                        <TableCell>
                          {w.currentMetastore ? (
                            <span className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)] shrink-0 cursor-default" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-64">
                                  Workspace is already assigned to a metastore. If you assign a new metastore, workloads will lose access to data in the previous metastore.
                                </TooltipContent>
                              </Tooltip>
                              {w.currentMetastore}
                            </span>
                          ) : (
                            <span>—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogBody>

          <div className="flex items-center gap-2 px-6 pt-4">
            <Checkbox
              id="auto-assign"
              checked={autoAssign}
              onCheckedChange={(v) => setAutoAssign(!!v)}
            />
            <label htmlFor="auto-assign" className="text-sm font-normal flex items-center gap-1 cursor-pointer select-none">
              Automatically assign new workspaces in {ms.region} to this metastore
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </label>
          </div>

          <DialogFooter>
            <div className="flex items-center mr-auto">
              {selectedWorkspaces.size > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedWorkspaces.size} workspace{selectedWorkspaces.size !== 1 ? "s" : ""} selected
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" className="shadow-xs" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={selectedWorkspaces.size === 0 ? "cursor-not-allowed" : undefined}>
                  <Button
                    size="sm"
                    disabled={selectedWorkspaces.size === 0}
                    className={selectedWorkspaces.size === 0 ? "pointer-events-none" : undefined}
                    onClick={() => setShowAssignModal(false)}
                  >
                    Assign
                  </Button>
                </span>
              </TooltipTrigger>
              {selectedWorkspaces.size === 0 && (
                <TooltipContent>Select at least one workspace</TooltipContent>
              )}
            </Tooltip>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppShell>
  )
}
