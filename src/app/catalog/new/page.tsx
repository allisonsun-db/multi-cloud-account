"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronUp, ChevronDown, Info, ExternalLink, Search, AlertTriangle } from "lucide-react"
import { AppShell } from "@/components/shell"
import { PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  Dialog, DialogHeader, DialogBody, DialogFooter,
  DialogContent, DialogTitle,
} from "@/components/ui/dialog"
import {
  Table, TableHead, TableRow, TableCell, TableBody, TableHeader,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { CheckCircleIcon, MinusCircleIcon, LoadingIcon } from "@/components/icons"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

const REGIONS: Record<string, string[]> = {
  AWS: [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-west-1", "eu-west-2", "eu-central-1",
    "ap-southeast-1", "ap-southeast-2", "ap-northeast-1",
  ],
  Azure: [
    "eastus", "eastus2", "westus", "westus2",
    "westeurope", "northeurope",
    "southeastasia", "eastasia",
  ],
  GCP: [
    "us-central1", "us-east1", "us-west1",
    "europe-west1", "europe-west2",
    "asia-east1", "asia-southeast1",
  ],
}

// ─── Workspace mock data ──────────────────────────────────────────────────────

type WorkspaceRow = {
  id: string
  name: string
  status: "Running" | "Stopped" | "Provisioning"
  cloud: string
  region: string
  currentMetastore?: string
}

const WORKSPACES: WorkspaceRow[] = [
  { id: "w1",  name: "prod-analytics",       status: "Running",      cloud: "AWS",   region: "us-east-1",      currentMetastore: "prod-metastore" },
  { id: "w2",  name: "dev-sandbox",           status: "Running",      cloud: "AWS",   region: "us-east-1" },
  { id: "w3",  name: "ml-training",           status: "Running",      cloud: "AWS",   region: "us-east-1",      currentMetastore: "ml-metastore" },
  { id: "w4",  name: "data-ingestion",        status: "Running",      cloud: "AWS",   region: "us-east-1" },
  { id: "w5",  name: "staging-env",           status: "Running",      cloud: "AWS",   region: "us-west-2" },
  { id: "w6",  name: "azure-prod",            status: "Running",      cloud: "Azure", region: "eastus" },
  { id: "w7",  name: "azure-dev",             status: "Running", cloud: "Azure", region: "eastus" },
  { id: "w13", name: "westus2-prod",          status: "Running",      cloud: "Azure", region: "westus2",          currentMetastore: "legacy-metastore" },
  { id: "w14", name: "westus2-dev",           status: "Running",      cloud: "Azure", region: "westus2" },
  { id: "w15", name: "westus2-staging",       status: "Running",      cloud: "Azure", region: "westus2" },
  { id: "w16", name: "westus2-ml",            status: "Running",      cloud: "Azure", region: "westus2" },
  { id: "w17", name: "westus2-data-eng",      status: "Running", cloud: "Azure", region: "westus2" },
  { id: "w8",  name: "gcp-analytics",         status: "Running",      cloud: "GCP",   region: "us-central1" },
  { id: "w9",  name: "eu-compliance",         status: "Running",      cloud: "AWS",   region: "eu-west-1" },
  { id: "w10", name: "apac-reporting",        status: "Running",      cloud: "AWS",   region: "ap-southeast-1" },
  { id: "w11", name: "us-east-1-reporting",   status: "Running",      cloud: "AWS",   region: "us-east-1" },
  { id: "w12", name: "us-east-1-experiments", status: "Running",      cloud: "AWS",   region: "us-east-1" },
]

// ─── FormSection ──────────────────────────────────────────────────────────────

function FormSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const ref = React.useRef<HTMLDivElement>(null)

  function toggle() {
    const opening = !open
    setOpen(opening)
    if (opening) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50)
    }
  }

  return (
    <div ref={ref} className="rounded-md border border-border overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 bg-muted transition-colors",
          !open && "hover:bg-border/60"
        )}
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="flex items-center gap-2">
          {open
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

// ─── FormRow ─────────────────────────────────────────────────────────────────

function FormRow({
  label,
  required,
  info,
  hint,
  multiline,
  children,
}: {
  label: string
  required?: boolean
  info?: boolean
  hint?: React.ReactNode
  multiline?: boolean
  children: React.ReactNode
}) {
  const isTop = hint || multiline
  return (
    <div className={cn("flex flex-col sm:flex-row gap-1 sm:gap-4 px-4 py-2.5 sm:py-2", isTop ? "sm:items-start" : "sm:h-12 sm:items-center")}>
      <div className={cn("flex flex-col gap-0.5 sm:w-[280px] sm:shrink-0", isTop && "sm:pt-[6px]")}>
        <div className="flex items-center gap-1">
          <span className="text-sm text-foreground">{label}</span>
          {required && <span className="text-destructive text-sm">*</span>}
          {info && <Info className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {children}
        {hint && <p className="text-xs text-muted-foreground pt-1 px-2">{hint}</p>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewMetastorePage() {
  const router = useRouter()

  const [name, setName] = React.useState("")
  const [cloud, setCloud] = React.useState("")
  const [region, setRegion] = React.useState("")
  const [storageCredential, setStorageCredential] = React.useState("")
  const [storagePath, setStoragePath] = React.useState("")
  const [showAssignModal, setShowAssignModal] = React.useState(false)
  const [selectedWorkspaces, setSelectedWorkspaces] = React.useState<Set<string>>(new Set())
  const [autoAssign, setAutoAssign] = React.useState(false)
  const [wsFilter, setWsFilter] = React.useState("")

  const regions = cloud ? (REGIONS[cloud] ?? []) : []
  const canSubmit = name.trim() && cloud && region

  const filteredWorkspaces = WORKSPACES.filter((w) =>
    w.name.toLowerCase().includes(wsFilter.toLowerCase())
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

  function handleFinish() {
    setShowAssignModal(false)
  }

  return (
    <AppShell activeItem="catalog">
      <div className="max-w-[800px] mx-auto w-full">
        <div className="flex flex-col gap-6 p-4 sm:p-6 pb-0">

          <PageHeader
            breadcrumbs={
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/catalog">Metastore</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Create metastore</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            }
            title="Create metastore"
          />

          <div className="flex flex-col gap-4">

            {/* Basics */}
            <FormSection title="Basics">
              <FormRow label="Name">
                <Input
                  placeholder="my-metastore"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormRow>
              <FormRow label="Cloud and region">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={cloud || undefined} onValueChange={(v) => { setCloud(v); setRegion("") }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select cloud" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["AWS", "Azure", "GCP"] as const).map((c) => (
                        <SelectItem key={c} value={c}>
                          <span className="flex items-center gap-2">
                            <img
                              src={CLOUD_LOGO[c]}
                              alt={c}
                              width={14}
                              height={14}
                              className={cn("object-contain", c === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                            />
                            {c}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={region || undefined} onValueChange={setRegion} disabled={!cloud}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={cloud ? "Select region" : "Select a cloud first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormRow>
            </FormSection>

            {/* Storage */}
            <FormSection title="Storage">
              <FormRow
                label="S3 bucket path"
                labelHint="(optional)"
                info
                hint={
                  <>
                    Optional location for storing managed tables data across all catalogs in the metastore.{" "}
                    <a href="#" className="text-primary inline-flex items-center gap-0.5">Learn more <ExternalLink className="h-3 w-3" /></a>
                  </>
                }
              >
                <Input
                  placeholder="s3://<bucket>/<path>"
                  value={storagePath}
                  onChange={(e) => setStoragePath(e.target.value)}
                />
              </FormRow>
              <FormRow
                label="IAM role ARN"
                labelHint="(optional)"
                info
                hint={
                  <>
                    Enter the IAM role that Databricks will use to access the S3 bucket.{" "}
                    <a href="#" className="text-primary inline-flex items-center gap-0.5">Learn more <ExternalLink className="h-3 w-3" /></a>
                  </>
                }
              >
                <Input
                  placeholder="arn:aws:iam::account-id:role/role-name-with-path"
                  value={storageCredential}
                  onChange={(e) => setStorageCredential(e.target.value)}
                />
              </FormRow>
            </FormSection>


            {/* Assign to workspaces */}
            <FormSection title={<>Assign to workspaces <span className="font-normal text-foreground">(optional)</span></>}>
              <FormRow label="Workspaces" multiline>
                {!region ? (
                  <span className="text-sm text-muted-foreground">Select a cloud and region first</span>
                ) : selectedWorkspaces.size > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 pt-[6px]">
                    {WORKSPACES.filter((w) => selectedWorkspaces.has(w.id)).map((w) => (
                      <Badge key={w.id} variant="secondary">{w.name}</Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="h-auto py-0.5 px-1.5 text-primary hover:text-primary" onClick={() => setShowAssignModal(true)}>
                      Edit
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit shadow-xs"
                    onClick={() => setShowAssignModal(true)}
                  >
                    Assign workspaces
                  </Button>
                )}
              </FormRow>
            </FormSection>

          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-background flex items-center justify-end gap-2 px-4 sm:px-6 py-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/catalog")}>
            Cancel
          </Button>
          <Button size="sm" disabled={!canSubmit} onClick={() => router.push("/catalog")}>
            Create metastore
          </Button>
        </div>

      </div>

      {/* Workspace Assignment Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="w-[800px] max-w-[calc(100%-2rem)] sm:max-w-[800px] flex flex-col max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Assign {name || "metastore"} to workspaces</DialogTitle>
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
                        checked={
                          filteredWorkspaces.length > 0 &&
                          selectedWorkspaces.size === filteredWorkspaces.length
                        }
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
                        No workspaces found in {region || "this region"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWorkspaces.map((w) => (
                      <TableRow
                        key={w.id}
                        className="cursor-pointer"
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
                                  Workspace is already assigned to a metastore. If you assign a new metastore to this workspace, workloads in this workspace will lose access to data in the previous metastore.
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
              Automatically assign new workspaces in {region || "this region"} to this metastore
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
            <Button variant="outline" size="sm" className="shadow-xs" onClick={handleFinish}>
              Cancel
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={selectedWorkspaces.size === 0 ? "cursor-not-allowed" : undefined}>
                  <Button
                    size="sm"
                    disabled={selectedWorkspaces.size === 0}
                    className={selectedWorkspaces.size === 0 ? "pointer-events-none" : undefined}
                    onClick={handleFinish}
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
