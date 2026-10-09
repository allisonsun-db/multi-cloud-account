"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CLOUD_ICONS } from "@/components/ui/location-picker"
import { CheckCircleIcon, XCircleIcon, RunningIcon, OverflowIcon, CopyIcon, CatalogIcon, NewWindowIcon, DangerFillIcon, ChevronRightIcon } from "@/components/icons"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, ArrowRight, Info } from "lucide-react"
import { toast } from "sonner"
import { PREREQS_DOCS_URL, PrereqsList } from "../prerequisites"

type ReplicationStatus = "succeeded" | "failed" | "running"
type ActivityType = "Replication" | "Failover" | "Validation"
type ValidationTrigger = "scheduled" | "manual"

interface ActivityRun {
  id: string
  startedAt: string
  duration: string
  status: ReplicationStatus
  activity: ActivityType
  rpo: string
  trigger?: ValidationTrigger
  errors?: ValidationError[]
  errorMessage?: string
}

interface ValidationError {
  itemType: "Catalog" | "Storage location"
  item: string
  message: string
}

const RUNS: ActivityRun[] = [
  { id: "run-18", startedAt: "Apr 9, 2026 at 9:45 AM", duration: "1m 12s", status: "running",   activity: "Replication", rpo: "5m"  },
  { id: "run-17", startedAt: "Apr 9, 2026 at 9:30 AM", duration: "1m 08s", status: "succeeded", activity: "Replication", rpo: "10m" },
  { id: "run-16", startedAt: "Apr 9, 2026 at 9:15 AM", duration: "1m 21s", status: "succeeded", activity: "Failover",    rpo: "5m"  },
  { id: "run-15", startedAt: "Apr 9, 2026 at 9:00 AM", duration: "0m 54s", status: "failed",    activity: "Replication", rpo: "15m", errorMessage: "Placeholder error message" },
  { id: "run-14b", startedAt: "Apr 9, 2026 at 8:52 AM", duration: "2m 36s", status: "succeeded", activity: "Validation", rpo: "—", trigger: "manual" },
  { id: "run-14", startedAt: "Apr 9, 2026 at 8:45 AM", duration: "1m 03s", status: "succeeded", activity: "Replication", rpo: "5m"  },
  { id: "run-13", startedAt: "Apr 9, 2026 at 8:30 AM", duration: "1m 17s", status: "succeeded", activity: "Replication", rpo: "10m" },
  { id: "run-12", startedAt: "Apr 9, 2026 at 8:15 AM", duration: "1m 09s", status: "succeeded", activity: "Replication", rpo: "5m"  },
  { id: "run-11", startedAt: "Apr 9, 2026 at 8:00 AM", duration: "1m 22s", status: "succeeded", activity: "Replication", rpo: "10m" },
  { id: "run-10", startedAt: "Apr 9, 2026 at 6:00 AM", duration: "2m 41s", status: "succeeded", activity: "Validation",  rpo: "—", trigger: "scheduled" },
  { id: "run-9",  startedAt: "Apr 9, 2026 at 12:00 AM", duration: "2m 58s", status: "failed",   activity: "Validation",  rpo: "—", trigger: "scheduled",
    errors: [
      { itemType: "Catalog", item: "ml_catalog", message: "No matching catalog exists in the secondary metastore." },
      { itemType: "Storage location", item: "s3://primary-bucket/external", message: "No external location in the secondary region covers s3://dr-bucket/external." },
    ],
  },
]

const REPLICATION_PROGRESS = 74

// Compute from/to by replaying runs chronologically, swapping on each failover
function computeWorkspaces(runs: ActivityRun[], initialPrimary: string, initialReplica: string) {
  let primary = initialPrimary
  let replica = initialReplica
  const result: Record<string, { from: string; to: string }> = {}
  ;[...runs].reverse().forEach((run) => {
    result[run.id] = { from: primary, to: replica }
    if (run.activity === "Failover") [primary, replica] = [replica, primary]
  })
  return result
}

function DottedFlowArrow({
  reversed = false,
  className = "text-muted-foreground",
  animate = true,
  solid = false,
}: {
  reversed?: boolean
  className?: string
  animate?: boolean
  solid?: boolean
}) {
  return (
    <svg
      width="84"
      height="12"
      viewBox="0 0 84 12"
      fill="none"
      className={className}
      style={reversed ? { transform: "scaleX(-1)" } : undefined}
    >
      <line
        x1="0" y1="6" x2="76" y2="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray={solid ? undefined : "6 4"}
        style={animate && !solid ? { animation: "dash-flow 0.6s linear infinite" } : undefined}
      />
      <polygon points="76,2 84,6 76,10" fill="currentColor" />
    </svg>
  )
}

const CATALOGS = ["main", "prod_catalog", "analytics", "ml_catalog"]
const STORAGE_MAPPINGS = [
  { source: "s3://primary-bucket/metastore", destination: "s3://dr-bucket/metastore" },
  { source: "s3://primary-bucket/external",  destination: "s3://dr-bucket/external" },
]

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-label="Replication progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div className="relative h-full overflow-hidden rounded-full bg-primary transition-[width] duration-500" style={{ width: `${progress}%` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[progress-shimmer_1.5s_ease-in-out_infinite] motion-reduce:animate-none" />
      </div>
    </div>
  )
}

function getReplicationItemStatus(index: number) {
  if (index === 0) return "Completed"
  if (index === 1) return "In progress"
  return "Not started"
}

function ReplicationFlowIndicator({
  reversed = false,
  loading = false,
  animate = true,
  headerY,
  rowYs,
}: {
  reversed?: boolean
  loading?: boolean
  animate?: boolean
  headerY: number
  rowYs: number[]
}) {
  const className = loading ? "text-border" : "text-muted-foreground"
  const rowStatuses = rowYs.map((_, index) => getReplicationItemStatus(index))

  return (
    <div className="flex shrink-0 justify-center md:self-stretch">
        <div className="relative hidden w-[84px] self-stretch md:block">
          <div className="absolute left-0" style={{ top: headerY - 6 }}>
            <DottedFlowArrow reversed={reversed} className={className} animate={animate} />
          </div>
          {rowYs.map((y, index) => (
            <div key={index} className="absolute left-0" style={{ top: y - 6 }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="relative block cursor-default">
                    <DottedFlowArrow
                      reversed={reversed}
                      className={
                        rowStatuses[index] === "In progress"
                          ? "text-muted-foreground"
                          : rowStatuses[index] === "Completed"
                            ? "text-muted-foreground opacity-60"
                            : "text-muted-foreground opacity-30"
                      }
                      animate={rowStatuses[index] === "In progress"}
                      solid={rowStatuses[index] === "Completed"}
                    />
                    {rowStatuses[index] === "Completed" && (
                      <CheckCircleIcon className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background text-[var(--success)]" />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">{rowStatuses[index]}</TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      <svg
        width="19"
        height="48"
        viewBox="0 0 19 48"
        fill="none"
        className={`md:hidden ${className}`}
        style={reversed ? { transform: "scaleY(-1)" } : undefined}
      >
        <line
          x1="10" y1="0" x2="10" y2="40"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          style={animate ? { animation: "dash-flow 0.6s linear infinite" } : undefined}
        />
        <polygon points="6,40 10,48 14,40" fill="currentColor" />
      </svg>
    </div>
  )
}

function StatusIcon({ status }: { status: ReplicationStatus }) {
  if (status === "succeeded") return <CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />
  if (status === "failed") return <XCircleIcon className="h-4 w-4 text-destructive" />
  return <RunningIcon className="h-4 w-4 text-primary animate-spin [animation-duration:2s]" />
}

export default function ReplicationPlanPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string
  const planId = params.planId as string

  const primaryWs = { label: "ws-prod-east", cloud: "AWS", region: "us-east-1" }
  const replicaWs  = { label: "ws-prod-dr-west", cloud: "AWS", region: "us-west-2" }
  const [runs, setRuns] = React.useState<ActivityRun[]>(RUNS)
  const workspaceMap = computeWorkspaces(runs, primaryWs.label, replicaWs.label)
  const [activityFilter, setActivityFilter] = React.useState<ActivityType | "all">("all")
  const filteredRuns = runs.filter(
    (run) => run.activity !== "Replication" && (activityFilter === "all" || run.activity === activityFilter),
  )
  const catalogs = CATALOGS
  const storageMappings = STORAGE_MAPPINGS
  const runningReplication = runs.find((run) => run.activity === "Replication" && run.status === "running")
  const [expanded, setExpanded] = React.useState(false)
  const primaryColumnRef = React.useRef<HTMLDivElement>(null)
  const primaryHeaderRef = React.useRef<HTMLDivElement>(null)
  const primaryRowRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [arrowLayout, setArrowLayout] = React.useState<{ headerY: number; rowYs: number[] }>({ headerY: 0, rowYs: [] })

  React.useLayoutEffect(() => {
    const column = primaryColumnRef.current
    if (!column) return
    const measure = () => {
      const top = column.getBoundingClientRect().top
      const centerOf = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect()
        return rect.top - top + rect.height / 2
      }
      const headerY = primaryHeaderRef.current ? centerOf(primaryHeaderRef.current) : 0
      const rowYs = expanded
        ? primaryRowRefs.current
            .slice(0, CATALOGS.length + STORAGE_MAPPINGS.length)
            .filter((el): el is HTMLDivElement => el !== null)
            .map(centerOf)
        : []
      setArrowLayout({ headerY, rowYs })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(column)
    return () => observer.disconnect()
  }, [expanded])
  const [hoveredCatalog, setHoveredCatalog] = React.useState<string | null>(null)
  const [hoveredStorage, setHoveredStorage] = React.useState<string | null>(null)
  const [failoverOpen, setFailoverOpen] = React.useState(false)
  const [failoverConfirm, setFailoverConfirm] = React.useState("")
  const [failedOver, setFailedOver] = React.useState(false)
  const [failoverLoading, setFailoverLoading] = React.useState(false)
  const [pendingRunId, setPendingRunId] = React.useState<string | null>(null)
  const [validating, setValidating] = React.useState(false)
  const [prereqOpen, setPrereqOpen] = React.useState(false)
  const [expandedRunIds, setExpandedRunIds] = React.useState<Set<string>>(new Set())

  function toggleRunExpanded(id: string) {
    setExpandedRunIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function startValidation() {
    const id = `run-${Date.now()}`
    setRuns((prev) => [{ id, startedAt: "Apr 9, 2026 at 9:50 AM", duration: "—", status: "running", activity: "Validation", rpo: "—", trigger: "manual" }, ...prev])
    setValidating(true)
    toast.success("Validation started")
    setTimeout(() => {
      setRuns((prev) => prev.map((r) => r.id === id ? { ...r, status: "succeeded", duration: "2m 30s" } : r))
      setValidating(false)
    }, 3000)
  }
  function onRowEnter(key: string, type: "catalog" | "storage") {
    if (type === "catalog") setHoveredCatalog(key)
    else setHoveredStorage(key)
  }

  function onRowLeave(type: "catalog" | "storage") {
    if (type === "catalog") setHoveredCatalog(null)
    else setHoveredStorage(null)
  }

  const currentRpo = RUNS.find((r) => r.status === "succeeded" && r.activity === "Replication")?.rpo ?? "—"

  function renderWorkspaceCard(side: "primary" | "secondary") {
    const isPrimary = side === "primary"
    const ws = isPrimary ? primaryWs : replicaWs
    const href = isPrimary ? `/workspaces/${workspaceId}` : "/workspaces/ws-prod-dr-west"
    const roleLabel = isPrimary !== failedOver ? "Primary workspace" : "Secondary workspace"

    return (
      <div ref={isPrimary ? primaryColumnRef : undefined} className="flex min-w-0 flex-col gap-1.5 md:w-[300px]">
        <p className="text-sm font-semibold">{roleLabel}</p>
        <div className="w-full rounded-md border border-border shadow-[var(--shadow-db-sm)]">
          <div
            ref={isPrimary ? primaryHeaderRef : undefined}
            className="flex items-center gap-2 text-sm px-3 py-2.5 cursor-pointer select-none"
            onClick={() => setExpanded((v) => !v)}
          >
            {CLOUD_ICONS[ws.cloud]}
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate">{ws.label}</span>
              <span className="whitespace-nowrap text-muted-foreground">({ws.region})</span>
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0"
              aria-label="Open workspace"
              onClick={(e) => { e.stopPropagation(); window.open(href, "_blank") }}
            >
              <NewWindowIcon className="h-4 w-4" />
            </Button>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
          {expanded && (
            <div className="border-t border-border divide-y divide-border">
              <div className="px-3 py-2">
                <p className="text-xs font-normal text-muted-foreground mb-1.5 py-px">Catalogs</p>
                <div className="flex flex-col gap-0.5">
                  {catalogs.map((c, index) => (
                    <Tooltip key={c}>
                      <TooltipTrigger asChild>
                        <div
                          ref={isPrimary ? (el) => { primaryRowRefs.current[index] = el } : undefined}
                          className={`flex items-center gap-2 py-1 text-sm rounded px-1 -mx-1 transition-colors ${hoveredCatalog === c ? "bg-primary/10 text-primary" : ""}`}
                          onMouseEnter={() => onRowEnter(c, "catalog")}
                          onMouseLeave={() => onRowLeave("catalog")}
                        >
                          <CatalogIcon className={`h-4 w-4 shrink-0 ${hoveredCatalog === c ? "text-primary" : "text-muted-foreground"}`} />
                          <span>{c}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">{getReplicationItemStatus(index)}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
              <div className="px-3 py-2">
                <p className="text-xs font-normal text-muted-foreground mb-1.5 py-px">Storage locations</p>
                <div className="flex flex-col gap-0.5">
                  {storageMappings.map((m, index) => (
                    <Tooltip key={m.source}>
                      <TooltipTrigger asChild>
                        <div
                          ref={isPrimary ? (el) => { primaryRowRefs.current[catalogs.length + index] = el } : undefined}
                          className={`text-sm font-mono truncate rounded px-1 -mx-1 py-[3px] transition-colors ${hoveredStorage === m.source ? "bg-primary/10 text-primary" : "text-accent-foreground"}`}
                          onMouseEnter={() => onRowEnter(m.source, "storage")}
                          onMouseLeave={() => onRowLeave("storage")}
                        >
                          {isPrimary ? m.source : m.destination}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">{getReplicationItemStatus(catalogs.length + index)}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <AppShell activeItem="resilience">
      <div className="flex flex-col gap-6 p-6">

        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/resilience">Resilience</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>my-replication-plan</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          title="my-replication-plan"
          actions={
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <OverflowIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => {
                      router.push(`/workspaces/${workspaceId}/replication-plan/${planId}/edit`)
                    }}
                  >
                    Edit failover group
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center -space-x-px">
                <Button variant="outline" size="sm" className="rounded-r-none" disabled={validating || failoverLoading} onClick={startValidation}>Validate</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-l-none px-2" aria-label="More validation options">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setPrereqOpen(true)}>View requirements</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button size="sm" disabled={failoverLoading} onClick={() => setFailoverOpen(true)}>Start failover</Button>
            </>
          }
        />

        <Dialog open={prereqOpen} onOpenChange={setPrereqOpen}>
          <DialogContent className="max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Requirements for a failover group</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-accent-foreground mb-4">
                Both workspaces need these settings and resources for replication and failover to work.{" "}
                <a href={PREREQS_DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Learn more</a>
              </p>
              <PrereqsList />
            </DialogBody>
            <DialogFooter>
              <Button size="sm" onClick={() => setPrereqOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="-mt-3 border-b border-border" />

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {/* Stable URL */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Stable URL</span>
              <div className="rounded-md border border-border shadow-[var(--shadow-db-sm)] overflow-hidden flex items-stretch">
                <div className={`flex flex-col justify-center px-3 py-2 shrink-0 ${failoverLoading ? "bg-muted" : "bg-green-100 dark:bg-green-950"}`}>
                  <div className="flex items-center gap-1.5">
                    {failoverLoading
                      ? <RunningIcon className="h-4 w-4 text-muted-foreground animate-spin [animation-duration:2s]" />
                      : <CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />
                    }
                    <span className={`text-sm font-semibold whitespace-nowrap ${failoverLoading ? "text-muted-foreground" : "text-[var(--success)]"}`}>
                      {failoverLoading ? "Pending" : "Active"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-between px-4 py-2 min-w-0">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <a href="https://omnimart.databricks.com/?c=204bd90f-ebe0-49e6-ad49-994df412c126" target="_blank" rel="noopener noreferrer" className="text-sm text-primary truncate hover:underline">https://omnimart.databricks.com/?c=204bd90f-ebe0-49e6-ad49-994df412c126</a>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button variant="ghost" size="icon-sm" aria-label="Copy URL">
                      <CopyIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Open">
                      <NewWindowIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Workspaces */}
            <div className="rounded-md border border-border shadow-[var(--shadow-db-sm)] flex flex-col">
              <div className="px-4 py-2.5 border-b border-border bg-secondary rounded-t-md">
                <p className="text-sm font-semibold">Replication status</p>
              </div>
              {runningReplication && (
                <div className="mx-4 flex flex-col gap-2 border-b border-border py-4">
                  <ProgressBar progress={REPLICATION_PROGRESS} />
                  <p className="text-sm text-muted-foreground">
                    <span className="text-foreground">{REPLICATION_PROGRESS}%</span> · Replicating tables, catalogs, and workspace assets.
                  </p>
                </div>
              )}
              <div className="relative flex flex-col items-stretch gap-4 px-4 py-4 shadow-xs md:flex-row md:items-start md:justify-center md:gap-0.5 md:py-6">
            {renderWorkspaceCard("primary")}

            <ReplicationFlowIndicator
              reversed={failedOver}
              loading={failoverLoading}
              animate={Boolean(runningReplication) || failoverLoading}
              headerY={arrowLayout.headerY}
              rowYs={arrowLayout.rowYs}
            />

            {renderWorkspaceCard("secondary")}
              </div>
            </div>

            {/* Replication runs */}
            <div className="rounded-md border border-border shadow-[var(--shadow-db-sm)] flex flex-col">
              <div className="px-4 py-2.5 border-b border-border bg-secondary rounded-t-md">
                <p className="text-sm font-semibold">Activity</p>
              </div>
              <div className="px-4 py-3">
                <Select value={activityFilter} onValueChange={(value) => setActivityFilter(value as ActivityType | "all")}>
                  <SelectTrigger className="w-[160px]" aria-label="Filter by activity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All activities</SelectItem>
                    <SelectItem value="Failover">Failover</SelectItem>
                    <SelectItem value="Validation">Validation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-6 px-0"></TableHead>
                    <TableHead className="pl-2 w-10"></TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Workspaces</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        RPO
                        <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRuns.map((run) => {
                    const expandable = run.status === "failed"
                    const errors = run.errors ?? []
                    const isExpanded = expandedRunIds.has(run.id)
                    return (
                    <React.Fragment key={run.id}>
                    <TableRow
                      className={`${expandable ? "cursor-pointer" : ""} ${isExpanded ? "border-b-0" : ""}`}
                      onClick={expandable ? () => toggleRunExpanded(run.id) : undefined}
                    >
                      <TableCell className="px-0">
                        {expandable && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={isExpanded ? "Hide errors" : "Show errors"}
                            aria-expanded={isExpanded}
                            onClick={(e) => { e.stopPropagation(); toggleRunExpanded(run.id) }}
                          >
                            <ChevronRightIcon className={`size-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="pl-2"><StatusIcon status={run.status} /></TableCell>
                      <TableCell>
                        {run.activity}
                        {run.trigger && (
                          <span className="text-muted-foreground"> ({run.trigger === "manual" ? "Manual" : "Scheduled"})</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm">
                          <span>{workspaceMap[run.id].from}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>{workspaceMap[run.id].to}</span>
                        </span>
                      </TableCell>
                      <TableCell>{run.startedAt}</TableCell>
                      <TableCell>{run.status === "failed" || run.activity === "Validation" ? <span className="text-muted-foreground">—</span> : run.rpo}</TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                        <TableCell colSpan={2} className="p-0" />
                        <TableCell colSpan={4} className="whitespace-normal pt-2 pb-3">
                          <Alert variant="destructive">
                            <DangerFillIcon />
                            <AlertTitle>
                              {errors.length > 0
                                ? `${errors.length} ${errors.length === 1 ? "issue" : "issues"} found`
                                : `${run.activity} failed`}
                            </AlertTitle>
                            <AlertDescription>
                              {errors.length === 0 && <p>{run.errorMessage ?? "No additional error details are available for this run."}</p>}                              <ul className="flex flex-col gap-2 mt-1 empty:hidden">
                                {errors.map((error) => (
                                  <li key={`${error.itemType}-${error.item}`} className="flex flex-col">
                                    <span className="text-foreground">
                                      <span className="font-semibold">{error.item}</span>{" "}
                                      <span className="text-muted-foreground">({error.itemType})</span>
                                    </span>
                                    <span>{error.message}</span>
                                  </li>
                                ))}
                              </ul>
                              <Button
                                variant="outline"
                                size="xs"
                                className="mt-2 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View errors in system table
                              </Button>
                            </AlertDescription>
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-[280px]">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-foreground">About this failover group</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-[150px] shrink-0">Created</span>
                <span className="text-sm text-foreground">Apr 1, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-[150px] shrink-0">Created by</span>
                <span className="text-sm text-foreground">Allison Sun</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex w-[150px] shrink-0 items-center gap-1 text-sm text-muted-foreground">
                  RPO
                  <Info className="h-3.5 w-3.5 shrink-0" />
                </span>
                <span className="text-sm text-foreground">Apr 9, 2026 at 9:45 AM ({currentRpo} ago)</span>
              </div>
            </div>
            <div className="my-4 border-t border-border" />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-foreground">Assets</p>
              <div className="flex items-center gap-2">
                <span className="flex w-[150px] shrink-0 items-center gap-1 text-sm text-muted-foreground">
                  Workspace assets
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 shrink-0" aria-label="About workspace assets" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-64">
                      Notebooks, jobs, SQL warehouses, clusters, draft AI/BI dashboards, files, and folders, along with their ACLs.
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span className="text-sm text-foreground">Enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex w-[150px] shrink-0 items-center gap-1 text-sm text-muted-foreground">
                  Beta assets
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 shrink-0" aria-label="About beta assets" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-64">
                      Placeholder description of beta assets.
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span className="text-sm text-foreground">Enabled</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <Dialog open={failoverOpen} onOpenChange={(open) => { setFailoverOpen(open); if (!open) setFailoverConfirm("") }}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Start failover</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-accent-foreground">
              This will promote <span className="font-semibold text-foreground">{replicaWs.label}</span> as the new primary workspace and redirect traffic away from <span className="font-semibold text-foreground">{primaryWs.label}</span>.
            </p>
            <div className="mt-3 rounded-md border border-border text-sm">
              <div className="grid grid-cols-[auto_1fr] gap-x-8 px-4">
                <span className="text-muted-foreground py-2">Current RPO</span>
                <span className="text-foreground py-2">{currentRpo}</span>
                <div className="col-span-2 h-px bg-border" />
                <span className="text-muted-foreground py-2">New primary workspace</span>
                <span className="text-foreground py-2">{replicaWs.label}</span>
                <div className="col-span-2 h-px bg-border" />
                <span className="text-muted-foreground py-2">New secondary workspace</span>
                <span className="text-foreground py-2">{primaryWs.label}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-6">
              <Label htmlFor="failover-confirm" className="font-normal text-accent-foreground">
                Type <span className="font-semibold text-foreground">{primaryWs.label}</span> to confirm failover
              </Label>
              <Input
                id="failover-confirm"
                value={failoverConfirm}
                onChange={(e) => setFailoverConfirm(e.target.value)}
                placeholder={primaryWs.label}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setFailoverOpen(false); setFailoverConfirm("") }}>Cancel</Button>
            <Button size="sm" disabled={failoverConfirm !== primaryWs.label} onClick={() => {
              const isNowFailedOver = !failedOver
              const newId = `run-${Date.now()}`
              setRuns((prev) => [{ id: newId, startedAt: "Apr 10, 2026 at 11:00 AM", duration: "—", status: "running", activity: "Failover", rpo: currentRpo }, ...prev])
              setFailedOver(isNowFailedOver)
              setFailoverOpen(false)
              setFailoverConfirm("")
              setFailoverLoading(true)
              setPendingRunId(newId)
              toast.success("Failover started")
              setTimeout(() => {
                setRuns((prev) => prev.map((r) => r.id === newId ? { ...r, status: "succeeded", duration: "1m 05s" } : r))
                setFailoverLoading(false)
                setPendingRunId(null)
              }, 3000)
            }}>Start failover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
