"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircleIcon, XCircleIcon, LoadingIcon, CopyIcon, OverflowIcon } from "@/components/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CLOUD_ICONS } from "@/components/ui/location-picker"
import { toast } from "sonner"

// ─── Failover groups data ──────────────────────────────────────────────────────

type ReplicationPlan = {
  id: string
  name: string
  primaryWorkspace: string
  primaryCloud: "AWS" | "Azure" | "GCP"
  replicaWorkspace: string
  replicaCloud: "AWS" | "Azure" | "GCP"
  status: "Active" | "Failed"
  lastRun: string
}

const REPLICATION_PLANS: ReplicationPlan[] = [
  { id: "plan-1", name: "my-replication-plan",  primaryWorkspace: "ws-prod-east",    primaryCloud: "AWS",   replicaWorkspace: "ws-prod-dr-west",    replicaCloud: "AWS",   status: "Active", lastRun: "Apr 9, 2026 at 9:45 AM" },
  { id: "plan-2", name: "staging-dr-plan",       primaryWorkspace: "ws-staging-east", primaryCloud: "Azure", replicaWorkspace: "ws-staging-dr-west",  replicaCloud: "Azure", status: "Active", lastRun: "Apr 9, 2026 at 9:30 AM" },
  { id: "plan-3", name: "analytics-backup-plan", primaryWorkspace: "analytics-prod",  primaryCloud: "AWS",   replicaWorkspace: "analytics-dr",        replicaCloud: "AWS",   status: "Active", lastRun: "Apr 8, 2026 at 4:00 PM" },
  { id: "plan-4", name: "ml-platform-dr",        primaryWorkspace: "ml-platform-prod",primaryCloud: "GCP",   replicaWorkspace: "ml-platform-dr-east", replicaCloud: "GCP",   status: "Failed", lastRun: "Apr 8, 2026 at 2:15 PM" },
]

// ─── Stable URLs data ──────────────────────────────────────────────────────────

type StableUrl = {
  id: string
  name: string
  url: string
  failoverGroup: string
  primaryWorkspace: string
  primaryCloud: "AWS" | "Azure" | "GCP"
  created: string
}

const INITIAL_STABLE_URLS: StableUrl[] = [
  { id: "url-1", name: "Prod Analytics",  url: "https://omnimart.databricks.com/?c=204bd90f-ebe0-49e6-ad49-994df412c126",  failoverGroup: "my-replication-plan",  primaryWorkspace: "ws-prod-east",    primaryCloud: "AWS",   created: "Apr 1, 2026" },
  { id: "url-2", name: "ML Platform",     url: "https://omnimart.databricks.com/?c=a1b2c3d4-e5f6-4789-abcd-ef0123456789",  failoverGroup: "ml-platform-dr",       primaryWorkspace: "ml-platform-prod", primaryCloud: "GCP",   created: "Mar 15, 2026" },
  { id: "url-3", name: "Data Eng Prod",   url: "https://omnimart.databricks.com/?c=f7e6d5c4-b3a2-4190-8765-43210fedcba9",  failoverGroup: "analytics-backup-plan",primaryWorkspace: "analytics-prod",   primaryCloud: "AWS",   created: "Mar 10, 2026" },
]

const WORKSPACE_OPTIONS: { name: string; cloud: "AWS" | "Azure" | "GCP" }[] = [
  { name: "prod-us-west",           cloud: "AWS"   },
  { name: "prod-us-east",           cloud: "AWS"   },
  { name: "staging-us-west",        cloud: "AWS"   },
  { name: "staging-us-east",        cloud: "Azure" },
  { name: "data-eng-prod",          cloud: "Azure" },
  { name: "ml-platform-prod",       cloud: "GCP"   },
  { name: "analytics-prod",         cloud: "AWS"   },
  { name: "analytics-staging",      cloud: "Azure" },
  { name: "finance-reporting",      cloud: "GCP"   },
  { name: "risk-modeling",          cloud: "AWS"   },
  { name: "marketing-analytics",    cloud: "Azure" },
  { name: "customer-data-platform", cloud: "AWS"   },
  { name: "security-audit",         cloud: "GCP"   },
  { name: "data-science-sandbox",   cloud: "AWS"   },
  { name: "platform-dev",           cloud: "Azure" },
  { name: "etl-orchestration",      cloud: "GCP"   },
  { name: "realtime-streaming",     cloud: "AWS"   },
  { name: "supply-chain-analytics", cloud: "Azure" },
  { name: "feature-store-prod",     cloud: "GCP"   },
  { name: "model-serving-prod",     cloud: "AWS"   },
]

// ─── Stable URL dialog (create + edit) ─────────────────────────────────────────

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function workspaceOptionsIncluding(entry: StableUrl | null): { name: string; cloud: "AWS" | "Azure" | "GCP" }[] {
  if (!entry || WORKSPACE_OPTIONS.some((w) => w.name === entry.primaryWorkspace)) return WORKSPACE_OPTIONS
  return [{ name: entry.primaryWorkspace, cloud: entry.primaryCloud }, ...WORKSPACE_OPTIONS]
}

function StableUrlDialog({
  open,
  onOpenChange,
  mode,
  editEntry,
  onCreated,
  onUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  editEntry: StableUrl | null
  onCreated: (url: StableUrl) => void
  onUpdated: (url: StableUrl) => void
}) {
  const [step, setStep] = React.useState<"form" | "loading" | "success">("form")
  const [name, setName] = React.useState("")
  const [primaryWorkspace, setPrimaryWorkspace] = React.useState("")
  const [generatedUrl, setGeneratedUrl] = React.useState("")

  const selectOptions = React.useMemo(
    () => workspaceOptionsIncluding(mode === "edit" ? editEntry : null),
    [mode, editEntry],
  )

  const selectedWs = selectOptions.find((w) => w.name === primaryWorkspace)

  function resetFields() {
    setName("")
    setPrimaryWorkspace("")
    setGeneratedUrl("")
    setStep("form")
  }

  React.useEffect(() => {
    if (!open) return
    if (mode === "edit" && editEntry) {
      setName(editEntry.name)
      setPrimaryWorkspace(editEntry.primaryWorkspace)
      setGeneratedUrl(editEntry.url)
    } else {
      setName("")
      setPrimaryWorkspace("")
      setGeneratedUrl("")
    }
    setStep("form")
  }, [open, mode, editEntry])

  function handleClose(next: boolean) {
    onOpenChange(next)
    if (!next) resetFields()
  }

  function handleSubmit() {
    if (mode === "create") {
      const newUrl = `https://omnimart.databricks.com/?c=${uuid()}`
      setGeneratedUrl(newUrl)
      setStep("loading")
      window.setTimeout(() => {
        onCreated({
          id: `url-${Date.now()}`,
          name,
          url: newUrl,
          failoverGroup: "—",
          primaryWorkspace,
          primaryCloud: selectedWs?.cloud ?? "AWS",
          created: "just now",
        })
        setStep("success")
      }, 1200)
      return
    }

    if (!editEntry) return
    onUpdated({
      ...editEntry,
      name,
      primaryWorkspace,
      primaryCloud: selectedWs?.cloud ?? editEntry.primaryCloud,
    })
    toast.success("Stable URL saved")
    handleClose(false)
    return
  }

  const isCreate = mode === "create"
  const title = isCreate ? "Create stable URL" : "Edit stable URL"
  const submitLabel = isCreate ? "Create" : "Save"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">

        {step === "form" && (<>
          <DialogHeader className="px-6 pt-4 pb-0">
            <DialogTitle className="text-[22px] font-semibold leading-7">{title}</DialogTitle>
          </DialogHeader>
          <DialogBody className="px-6 pt-4 pb-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="stable-url-name">Name</Label>
              <Input
                id="stable-url-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prod Analytics"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="primary-workspace">Primary workspace</Label>
              <Select value={primaryWorkspace} onValueChange={setPrimaryWorkspace}>
                <SelectTrigger id="primary-workspace" className="w-full">
                  <SelectValue placeholder="Select primary workspace" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.map((ws) => (
                    <SelectItem key={ws.name} value={ws.name}>
                      <span className="flex items-center gap-2">
                        {CLOUD_ICONS[ws.cloud]}
                        {ws.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter className="px-6 pt-4 pb-6">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              className="h-8 shrink-0 whitespace-nowrap"
              onClick={handleSubmit}
              disabled={!name.trim() || !primaryWorkspace}
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </>)}

        {step === "loading" && (
          <DialogBody className="px-6 py-16 flex flex-col items-center justify-center gap-3">
            <LoadingIcon size={24} className="animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Generating stable URL…</span>
          </DialogBody>
        )}

        {step === "success" && (<>
          <DialogHeader className="px-6 pt-4 pb-0">
            <DialogTitle className="flex items-center gap-2 text-[22px] font-semibold leading-7">
              <CheckCircleIcon size={22} className="text-[var(--success)] shrink-0" />
              Stable URL created
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="px-6 pt-4 pb-4 flex flex-col gap-3 min-w-0 overflow-hidden">
            <p className="text-sm text-muted-foreground">
              Your stable URL for <span className="font-semibold text-foreground">{name}</span> is ready.
            </p>
            <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-2 overflow-hidden">
              <span className="flex-1 truncate text-sm text-foreground min-w-0">{generatedUrl}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(generatedUrl)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Copy URL"
              >
                <CopyIcon size={14} />
              </button>
            </div>
          </DialogBody>
          <DialogFooter className="px-6 pt-4 pb-6">
            <DialogClose asChild>
              <Button size="sm">Done</Button>
            </DialogClose>
          </DialogFooter>
        </>)}

      </DialogContent>
    </Dialog>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ResiliencePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("failover-groups")
  const [stableUrls, setStableUrls] = React.useState<StableUrl[]>(INITIAL_STABLE_URLS)
  const [stableUrlDialogOpen, setStableUrlDialogOpen] = React.useState(false)
  const [stableUrlDialogMode, setStableUrlDialogMode] = React.useState<"create" | "edit">("create")
  const [stableUrlDialogEditEntry, setStableUrlDialogEditEntry] = React.useState<StableUrl | null>(null)

  function openStableUrlCreate() {
    setStableUrlDialogMode("create")
    setStableUrlDialogEditEntry(null)
    setStableUrlDialogOpen(true)
  }

  function openStableUrlEdit(entry: StableUrl) {
    setStableUrlDialogMode("edit")
    setStableUrlDialogEditEntry(entry)
    setStableUrlDialogOpen(true)
  }

  return (
    <AppShell activeItem="resilience">
      <div className="flex flex-col gap-4 p-6">
        <StableUrlDialog
          open={stableUrlDialogOpen}
          onOpenChange={setStableUrlDialogOpen}
          mode={stableUrlDialogMode}
          editEntry={stableUrlDialogEditEntry}
          onCreated={(url) => setStableUrls((prev) => [url, ...prev])}
          onUpdated={(url) => setStableUrls((prev) => prev.map((u) => (u.id === url.id ? url : u)))}
        />
        <h1 className="text-xl font-semibold text-foreground">Resilience</h1>

        <Tabs defaultValue="failover-groups" onValueChange={setActiveTab}>
          <div className="flex flex-wrap items-center gap-2">
            <TabsList>
              <TabsTrigger value="failover-groups">Failover groups</TabsTrigger>
              <TabsTrigger value="stable-urls">Stable URLs</TabsTrigger>
            </TabsList>
            <div className="ml-auto pb-1">
              {activeTab === "failover-groups" && (
                <Button size="sm" onClick={() => router.push(`/workspaces/1/replication-plan/new`)}>
                  Create failover group
                </Button>
              )}
              {activeTab === "stable-urls" && (
                <Button size="sm" onClick={openStableUrlCreate}>Create stable URL</Button>
              )}
            </div>
          </div>

          <TabsContent value="failover-groups" className="mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Name</TableHead>
                  <TableHead>Primary workspace</TableHead>
                  <TableHead>Secondary workspace</TableHead>
                  <TableHead>Last run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REPLICATION_PLANS.map((plan) => (
                  <TableRow
                    key={plan.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/workspaces/1/replication-plan/${plan.id}`)}
                  >
                    <TableCell className="w-8">
                      <Tooltip>
                        <TooltipTrigger className="flex items-center">
                          {plan.status === "Active" && <CheckCircleIcon size={14} className="text-[var(--success)]" />}
                          {plan.status === "Failed" && <XCircleIcon size={14} className="text-destructive" />}
                        </TooltipTrigger>
                        <TooltipContent>{plan.status}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {CLOUD_ICONS[plan.primaryCloud]}
                        {plan.primaryWorkspace}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {CLOUD_ICONS[plan.replicaCloud]}
                        {plan.replicaWorkspace}
                      </span>
                    </TableCell>
                    <TableCell>{plan.lastRun}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="stable-urls" className="mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[400px]">URL</TableHead>
                  <TableHead>Primary workspace</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10 max-w-10 px-3 py-0 text-right align-middle">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stableUrls.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell className="w-[400px] max-w-[400px]">
                      <span className="block truncate">{entry.url}</span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {CLOUD_ICONS[entry.primaryCloud]}
                        {entry.primaryWorkspace}
                      </span>
                    </TableCell>
                    <TableCell>{entry.created}</TableCell>
                    <TableCell className="w-10 max-w-10 p-0 align-middle text-right">
                      <div className="flex h-9 max-h-9 items-center justify-end px-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-8 w-8 shrink-0 text-muted-foreground"
                              aria-label={`Actions for ${entry.name}`}
                            >
                              <OverflowIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                window.setTimeout(() => openStableUrlEdit(entry), 0)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setStableUrls((prev) => prev.filter((u) => u.id !== entry.id))}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
