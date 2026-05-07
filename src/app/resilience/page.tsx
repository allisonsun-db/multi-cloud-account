"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircleIcon, XCircleIcon } from "@/components/icons"
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
import { CLOUD_ICONS } from "@/components/ui/location-picker"

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
  url: string
  failoverGroup: string
  primaryWorkspace: string
  primaryCloud: "AWS" | "Azure" | "GCP"
  created: string
}

const INITIAL_STABLE_URLS: StableUrl[] = [
  { id: "url-1", url: "prod-analytics.cloud.databricks.com",  failoverGroup: "my-replication-plan",  primaryWorkspace: "ws-prod-east",    primaryCloud: "AWS",   created: "Apr 1, 2026" },
  { id: "url-2", url: "ml-platform.cloud.databricks.com",     failoverGroup: "ml-platform-dr",       primaryWorkspace: "ml-platform-prod", primaryCloud: "GCP",   created: "Mar 15, 2026" },
  { id: "url-3", url: "data-eng-prod.cloud.databricks.com",   failoverGroup: "analytics-backup-plan",primaryWorkspace: "analytics-prod",   primaryCloud: "AWS",   created: "Mar 10, 2026" },
]

const FAILOVER_GROUP_NAMES = REPLICATION_PLANS.map((p) => p.name)

// ─── Create Stable URL dialog ──────────────────────────────────────────────────

function CreateStableUrlDialog({ onCreated }: { onCreated: (url: StableUrl) => void }) {
  const [open, setOpen] = React.useState(false)
  const [subdomain, setSubdomain] = React.useState("")
  const [failoverGroup, setFailoverGroup] = React.useState("")

  const selectedPlan = REPLICATION_PLANS.find((p) => p.name === failoverGroup)
  const primaryWorkspace = selectedPlan?.primaryWorkspace ?? ""
  const primaryCloud = selectedPlan?.primaryCloud

  function reset() { setSubdomain(""); setFailoverGroup("") }

  function handleCreate() {
    onCreated({
      id: `url-${Date.now()}`,
      url: `${subdomain}.cloud.databricks.com`,
      failoverGroup,
      primaryWorkspace,
      primaryCloud: primaryCloud ?? "AWS",
      created: "just now",
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <Button size="sm" onClick={() => setOpen(true)}>Create stable URL</Button>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="px-6 pt-4 pb-0">
          <DialogTitle className="text-[22px] font-semibold leading-7">Create stable URL</DialogTitle>
        </DialogHeader>
        <DialogBody className="px-6 pt-4 pb-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex items-center">
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="my-workspace"
                className="rounded-r-none border-r-0 flex-1"
              />
              <span className="flex h-8 items-center rounded-r border border-border bg-muted px-3 text-sm text-accent-foreground whitespace-nowrap">
                .cloud.databricks.com
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="failover-group">Failover group</Label>
            <Select value={failoverGroup} onValueChange={setFailoverGroup}>
              <SelectTrigger id="failover-group" className="w-full">
                <SelectValue placeholder="Select failover group" />
              </SelectTrigger>
              <SelectContent>
                {FAILOVER_GROUP_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {primaryWorkspace && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Primary workspace</span>
              <span className="text-sm text-foreground">{primaryWorkspace}</span>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="px-6 pt-4 pb-6">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" onClick={handleCreate} disabled={!subdomain.trim() || !failoverGroup}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ResiliencePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("failover-groups")
  const [stableUrls, setStableUrls] = React.useState<StableUrl[]>(INITIAL_STABLE_URLS)

  return (
    <AppShell activeItem="resilience">
      <div className="flex flex-col gap-4 p-6">
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
                <CreateStableUrlDialog onCreated={(url) => setStableUrls((prev) => [url, ...prev])} />
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
                  <TableHead>URL</TableHead>
                  <TableHead>Failover group</TableHead>
                  <TableHead>Primary workspace</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stableUrls.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <span className="font-mono text-xs">{entry.url}</span>
                    </TableCell>
                    <TableCell>{entry.failoverGroup}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {CLOUD_ICONS[entry.primaryCloud]}
                        {entry.primaryWorkspace}
                      </span>
                    </TableCell>
                    <TableCell>{entry.created}</TableCell>
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
