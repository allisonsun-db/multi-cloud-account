"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { CheckCircleIcon, ColumnsIcon, NewWindowIcon } from "@/components/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, ChevronRight } from "lucide-react"
import { LocationPicker, buildCloudRegions, CLOUD_ICONS, CLOUD_LOGO } from "@/components/ui/location-picker"
import { cn } from "@/lib/utils"
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ─── Data ─────────────────────────────────────────────────────────────────────

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
  { id: "1",  name: "prod-us-west",           status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",         storage: "Default",            credentialName: "Serverless",              created: "yesterday at ...",  metastore: "prod-metastore" },
  { id: "2",  name: "prod-us-east",           status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",         storage: "prod-storage-bucket", credentialName: "Serverless and classic",  created: "yesterday at ...",  metastore: "prod-metastore" },
  { id: "3",  name: "staging-us-west",        status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",         storage: "Default",            credentialName: "Serverless",              created: "yesterday at ...",  metastore: "staging-metast..." },
  { id: "4",  name: "staging-us-east",        status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "eastus",            storage: "Default",            credentialName: "Serverless",              created: "last Tuesday ...",  metastore: "staging-metast..." },
  { id: "5",  name: "data-eng-prod",          status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "eastus2",           storage: "Default",            credentialName: "Serverless and classic",  created: "last Tuesday ...",  metastore: "prod-metastore" },
  { id: "6",  name: "ml-platform-prod",       status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "us-central1",       storage: "Default",            credentialName: "Serverless",              created: "last Tuesday ...",  metastore: "prod-metastore" },
  { id: "7",  name: "analytics-prod",         status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",         storage: "Default",            credentialName: "Serverless",              created: "last Monday ...",   metastore: null },
  { id: "8",  name: "analytics-staging",      status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "westeurope",        storage: "Default",            credentialName: "Serverless",              created: "last Monday ...",   metastore: "staging-metast..." },
  { id: "9",  name: "finance-reporting",      status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "europe-west1",      storage: "custom-gcs-bucket",  credentialName: "Serverless and classic",  created: "last Friday at...", metastore: "prod-metastore" },
  { id: "10", name: "risk-modeling",          status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",         storage: "Default",            credentialName: "Serverless",              created: "last Friday at...", metastore: "prod-metastore" },
  { id: "11", name: "marketing-analytics",    status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "eastus",            storage: "Default",            credentialName: "Serverless",              created: "03/19/2026",        metastore: "prod-metastore" },
  { id: "12", name: "customer-data-platform", status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",         storage: "Default",            credentialName: "Serverless",              created: "03/19/2026",        metastore: "prod-metastore" },
  { id: "13", name: "security-audit",         status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "us-west1",          storage: "Default",            credentialName: "Serverless",              created: "03/18/2026",        metastore: "prod-metastore" },
  { id: "14", name: "data-science-sandbox",   status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",         storage: "staging-s3-bucket",  credentialName: "Serverless and classic",  created: "03/18/2026",        metastore: "dev-metastore" },
  { id: "15", name: "platform-dev",           status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "westus2",           storage: "Default",            credentialName: "Serverless",              created: "03/18/2026",        metastore: "dev-metastore" },
  { id: "16", name: "etl-orchestration",      status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "us-east1",          storage: "Default",            credentialName: "Serverless",              created: "03/18/2026",        metastore: "prod-metastore" },
  { id: "17", name: "realtime-streaming",     status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",         storage: "Default",            credentialName: "Serverless",              created: "03/17/2026",        metastore: "prod-metastore" },
  { id: "18", name: "supply-chain-analytics", status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "northeurope",       storage: "Default",            credentialName: "Serverless and classic",  created: "03/17/2026",        metastore: "prod-metastore" },
  { id: "19", name: "feature-store-prod",     status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "asia-east1",        storage: "Default",            credentialName: "Serverless",              created: "03/16/2026",        metastore: "prod-metastore" },
  { id: "20", name: "model-serving-prod",     status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",         storage: "Default",            credentialName: "Serverless",              created: "03/15/2026",        metastore: "prod-metastore" },
]

const MOST_VISITED_WORKSPACES = [
  { id: "1", name: "prod-us-west", cloud: "AWS", region: "us-west-2", users: "428 users" },
  { id: "6", name: "ml-platform-prod", cloud: "GCP", region: "us-central1", users: "312 users" },
  { id: "5", name: "data-eng-prod", cloud: "Azure", region: "eastus2", users: "256 users" },
  { id: "11", name: "marketing-analytics", cloud: "Azure", region: "eastus", users: "184 users" },
] satisfies Array<{
  id: string
  name: string
  cloud: Workspace["cloud"]
  region: string
  users: string
}>

const OPTIONAL_WORKSPACE_COLUMNS = [
  { id: "storage", label: "Storage" },
  { id: "compute", label: "Compute" },
  { id: "pricingTier", label: "Pricing tier" },
  { id: "metastore", label: "Metastore" },
  { id: "created", label: "Created" },
] as const

type OptionalWorkspaceColumn = typeof OPTIONAL_WORKSPACE_COLUMNS[number]["id"]

// ─── Create Workspace Modal ────────────────────────────────────────────────────

type DeploymentOption = {
  value: string
  label: string
  description: string
}

const DEPLOYMENT_OPTIONS: DeploymentOption[] = [
  {
    value: "serverless",
    label: "Use serverless compute with default storage",
    description: "No setup required. Databricks will manage compute and storage.",
  },
  {
    value: "existing",
    label: "Use existing cloud account",
    description: "Connect to your cloud account to use your own storage and resources.",
  },
]

function RadioTile({
  option,
  selected,
  onSelect,
}: {
  option: DeploymentOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-1 p-4 rounded-md text-left w-full cursor-pointer transition-colors",
        selected
          ? "border border-primary bg-background"
          : "border border-border bg-background hover:border-muted-foreground/40"
      )}
    >
      <div className="flex items-start gap-2 w-full">
        <span className="flex-1 text-sm text-foreground leading-5">{option.label}</span>
        {/* Radio circle */}
        <span className={cn(
          "mt-0.5 shrink-0 size-4 rounded-full border transition-colors",
          selected
            ? "bg-primary border-primary flex items-center justify-center"
            : "border-border bg-background"
        )}>
          {selected && <span className="block size-1.5 rounded-sm bg-background" />}
        </span>
      </div>
      <p className="text-sm text-accent-foreground">{option.description}</p>
    </button>
  )
}

const ALL_CLOUD_REGIONS = buildCloudRegions(WORKSPACES)

function CreateWorkspaceModal({ onCreated }: { onCreated: (ws: Workspace) => void }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [deployment, setDeployment] = React.useState("serverless")
  const [moreOpen, setMoreOpen] = React.useState(false)
  const [cloud, setCloud] = React.useState("")
  const [region, setRegion] = React.useState("")

  const regions = cloud ? (ALL_CLOUD_REGIONS[cloud] ?? []) : []

  function resetForm() {
    setName("")
    setDeployment("serverless")
    setMoreOpen(false)
    setCloud("")
    setRegion("")
  }

  function handleContinue() {
    if (deployment === "existing") {
      setOpen(false)
      resetForm()
      router.push(`/workspaces/new?name=${encodeURIComponent(name)}`)
      return
    }
    const newWs: Workspace = {
      id: String(Date.now()),
      name,
      status: "Running",
      cloud: (cloud || "AWS") as Workspace["cloud"],
      pricingTier: "Enterprise",
      region: region || "—",
      storage: "Serverless",
      credentialName: "Serverless",
      created: "just now",
      metastore: null,
    }
    onCreated(newWs)
    setOpen(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
      <DialogTrigger asChild>
        <Button size="sm">Create workspace</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader className="px-6 pt-4 pb-0">
          <DialogTitle className="text-[22px] font-semibold leading-7">Create workspace</DialogTitle>
        </DialogHeader>
        <DialogBody className="px-6 pt-4 pb-4 flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ws-name">Name</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Deployment */}
          <div className="flex flex-col gap-2">
            <Label>Compute and storage</Label>
            <div className="flex gap-2">
              {DEPLOYMENT_OPTIONS.map((option) => (
                <RadioTile
                  key={option.value}
                  option={option}
                  selected={deployment === option.value}
                  onSelect={() => setDeployment(option.value)}
                />
              ))}
            </div>
          </div>

          {/* More — only shown for serverless */}
          {deployment === "serverless" && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary w-fit"
              >
                <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", moreOpen && "rotate-90")} />
                More
              </button>
              {moreOpen && (
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label>Cloud</Label>
                    <Select value={cloud} onValueChange={(v) => { setCloud(v); setRegion("") }}>
                      <SelectTrigger className="w-full">
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
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label>Region</Label>
                    <Select value={region} onValueChange={setRegion} disabled={!cloud}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter className="px-6 pt-4 pb-6">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" onClick={handleContinue} disabled={!name.trim()}>
            {deployment === "serverless" ? "Create" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function WorkspacesContent() {
  const router = useRouter()
  const [filter, setFilter] = React.useState("")
  const [locations, setLocations] = React.useState<string[]>([])
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>(WORKSPACES)
  const [visibleColumns, setVisibleColumns] = React.useState<Record<OptionalWorkspaceColumn, boolean>>({
    storage: true,
    compute: true,
    pricingTier: false,
    metastore: true,
    created: false,
  })

  const cloudRegions = React.useMemo(() => buildCloudRegions(workspaces), [workspaces])

  const filtered = workspaces.filter((w) => {
    if (filter && !w.name.toLowerCase().includes(filter.toLowerCase())) return false
    if (locations.length === 0) return true
    return locations.some(loc => {
      if (loc.includes(":")) {
        const [c, r] = loc.split(":")
        return w.cloud === c && w.region === r
      }
      return w.cloud === loc
    })
  })

  function setColumnVisibility(column: OptionalWorkspaceColumn, visible: boolean) {
    setVisibleColumns((current) => ({ ...current, [column]: visible }))
  }

  return (
    <div className="flex flex-col gap-4 p-6">

        <h1 className="text-xl font-semibold text-foreground">Workspaces</h1>

        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-[1_1_240px] max-w-[280px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter workspaces"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <LocationPicker className="min-w-0 flex-[1_1_200px] max-w-[240px]" value={locations} onChange={setLocations} cloudRegions={cloudRegions} />
          <div className="ml-auto shrink-0">
            <CreateWorkspaceModal onCreated={(ws) => setWorkspaces((prev) => [ws, ...prev])} />
          </div>
        </div>

        {locations.length === 0 && !filter.trim() && (
          <section className="mt-2 mb-2 flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold text-foreground">Most visited</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3 pb-1">
              {MOST_VISITED_WORKSPACES.map((workspace) => (
                <Card
                  key={workspace.id}
                  className="cursor-pointer overflow-hidden py-0 transition-shadow hover:shadow-[var(--shadow-db-lg)]"
                  onClick={() => router.push(`/workspaces/${workspace.id}`)}
                >
                  <CardContent className="flex flex-col gap-0 px-0">
                    <div className="flex flex-col gap-0.5 px-4 py-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="truncate text-sm font-semibold text-foreground">{workspace.name}</div>
                        <div className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                          <img
                            src={CLOUD_LOGO[workspace.cloud]}
                            alt=""
                            width={12}
                            height={12}
                            className={cn("h-3 w-3 object-contain", workspace.cloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                          />
                          <span className="truncate">{workspace.region} · {workspace.users}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex h-24 items-center justify-center border-t border-border bg-muted">
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <NewWindowIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold text-foreground">All workspaces</h2>

          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="font-semibold text-foreground">Name</TableHead>
              <TableHead className="font-semibold text-foreground"><div className="flex justify-center">Cloud</div></TableHead>
              <TableHead className="font-semibold text-foreground">Region</TableHead>
              {visibleColumns.storage && <TableHead className="font-semibold text-foreground">Storage</TableHead>}
              {visibleColumns.compute && <TableHead className="font-semibold text-foreground">Compute</TableHead>}
              {visibleColumns.created && <TableHead className="font-semibold text-foreground">Created</TableHead>}
              {visibleColumns.pricingTier && <TableHead className="font-semibold text-foreground">Pricing tier</TableHead>}
              {visibleColumns.metastore && <TableHead className="font-semibold text-foreground">Metastore</TableHead>}
              <TableHead>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" aria-label="Choose columns">
                        <ColumnsIcon size={16} className="size-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
                        Columns
                      </DropdownMenuLabel>
                      {OPTIONAL_WORKSPACE_COLUMNS.map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={visibleColumns[column.id]}
                          onCheckedChange={(checked) => setColumnVisibility(column.id, checked === true)}
                          onSelect={(event) => event.preventDefault()}
                        >
                          {column.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ws) => (
              <TableRow key={ws.id}>
                <TableCell className="w-8">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center">
                      <CheckCircleIcon size={14} className="text-[var(--success)]" />
                    </TooltipTrigger>
                    <TooltipContent>Running</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <a href={`/workspaces/${ws.id}`} className="text-primary hover:underline truncate block max-w-[120px]">
                    {ws.name}
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{CLOUD_ICONS[ws.cloud]}</span>
                      </TooltipTrigger>
                      <TooltipContent>{ws.cloud}</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>{ws.region}</TableCell>
                {visibleColumns.storage && (
                  <TableCell>
                    <span className={cn(ws.storage === "Default" && "italic")}>{ws.storage}</span>
                  </TableCell>
                )}
                {visibleColumns.compute && <TableCell>{ws.credentialName}</TableCell>}
                {visibleColumns.created && <TableCell>{ws.created}</TableCell>}
                {visibleColumns.pricingTier && <TableCell>{ws.pricingTier}</TableCell>}
                {visibleColumns.metastore && (
                  <TableCell>
                    {ws.metastore ? (
                      <a href="#" className="text-primary hover:underline truncate block max-w-[100px]">
                        {ws.metastore}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="xs" className="text-sm">
                    <a href="#">Open</a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </section>

      </div>
  )
}

export default function WorkspacesPage() {
  return (
    <AppShell activeItem="workspaces">
      <WorkspacesContent />
    </AppShell>
  )
}
