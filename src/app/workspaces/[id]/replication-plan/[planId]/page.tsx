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
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CLOUD_ICONS } from "@/components/ui/location-picker"
import { CheckCircleIcon, XCircleIcon, RunningIcon, OverflowIcon, CopyIcon, CloseIcon, CatalogIcon, NewWindowIcon, WarningIcon } from "@/components/icons"
import { ChevronDown, Info } from "lucide-react"
import { toast } from "sonner"
import { PREREQS_DOCS_URL, PrereqsList } from "../prerequisites"

type ReplicationStatus = "succeeded" | "failed" | "running"
type ActivityType = "Replication" | "Failover" | "Validation"

interface ActivityRun {
  id: string
  startedAt: string
  duration: string
  status: ReplicationStatus
  activity: ActivityType
  rpo: string
  validation?: FailoverGroupValidation
  errorMessage?: string
}

// Mirrors the FailoverGroupValidation resource from the "[UCDR] Validation checks APIs" design doc.
type CheckKind = "DATA_REPLICATION" | "SSC_CONFIG" | "CSC_PL_CONFIG" | "LM_COVERAGE"
type CheckStatus = "RUNNING" | "PASSED" | "FAILED" | "ABORTED"
// The API only defines SYSTEM_SCHEDULED. USER_MANUAL is prototype-only, backing the "Validate" button.
type ValidationTrigger = "SYSTEM_SCHEDULED" | "USER_MANUAL"

interface FailoverGroupValidationCheckError {
  errorClass: string
  message: string
  parameters?: Record<string, string>
}

interface FailoverGroupValidationCheckResult {
  kind: CheckKind
  region: string
  isRegionPrimary: boolean
  status: CheckStatus
  errors?: FailoverGroupValidationCheckError[]
}

interface FailoverGroupValidation {
  name: string
  type: "STANDARD"
  trigger: ValidationTrigger
  results: FailoverGroupValidationCheckResult[]
}

const CHECK_LABELS: Record<CheckKind, string> = {
  DATA_REPLICATION: "Data replication",
  SSC_CONFIG: "Server-side copy config",
  CSC_PL_CONFIG: "Client-side copy (Private Link)",
  LM_COVERAGE: "Location mapping coverage",
}

const PRIMARY_REGION = "us-east-1"
const SECONDARY_REGION = "us-west-2"

// Order checks are listed (and simulated) in: by kind, primary region first.
const CHECK_PLAN: Pick<FailoverGroupValidationCheckResult, "kind" | "region" | "isRegionPrimary">[] = [
  { kind: "DATA_REPLICATION", region: SECONDARY_REGION, isRegionPrimary: false },
  { kind: "SSC_CONFIG",       region: PRIMARY_REGION,   isRegionPrimary: true  },
  { kind: "SSC_CONFIG",       region: SECONDARY_REGION, isRegionPrimary: false },
  { kind: "CSC_PL_CONFIG",    region: PRIMARY_REGION,   isRegionPrimary: true  },
  { kind: "CSC_PL_CONFIG",    region: SECONDARY_REGION, isRegionPrimary: false },
  { kind: "LM_COVERAGE",      region: SECONDARY_REGION, isRegionPrimary: false },
]

function results(overrides: Partial<Record<number, Partial<FailoverGroupValidationCheckResult>>> = {}, status: CheckStatus = "PASSED") {
  return CHECK_PLAN.map((c, i) => ({ ...c, status, ...overrides[i] }))
}

const PASSED_RESULTS: FailoverGroupValidationCheckResult[] = results()

type ValidationOutcome = "succeeded" | "aborted" | "failed" | "running"

// The API has no overall result field — it's derived from the check results.
function validationOutcome(results: FailoverGroupValidationCheckResult[]): ValidationOutcome {
  if (results.some((r) => r.status === "RUNNING")) return "running"
  if (results.some((r) => r.status === "FAILED")) return "failed"
  if (results.some((r) => r.status === "ABORTED")) return "aborted"
  return "succeeded"
}

const RUNS: ActivityRun[] = [
  { id: "run-18", startedAt: "Apr 9, 2026 at 9:45 AM", duration: "1m 12s", status: "running",   activity: "Replication", rpo: "5m"  },
  { id: "run-17", startedAt: "Apr 9, 2026 at 9:30 AM", duration: "1m 08s", status: "succeeded", activity: "Replication", rpo: "10m" },
  { id: "run-16", startedAt: "Apr 9, 2026 at 9:15 AM", duration: "1m 21s", status: "succeeded", activity: "Failover",    rpo: "5m"  },
  { id: "run-15", startedAt: "Apr 9, 2026 at 9:00 AM", duration: "0m 54s", status: "failed",    activity: "Replication", rpo: "15m", errorMessage: "Placeholder error message" },
  { id: "run-14b", startedAt: "Apr 9, 2026 at 8:52 AM", duration: "2m 36s", status: "succeeded", activity: "Validation", rpo: "—",
    validation: { name: "fgv-7c1e9a", type: "STANDARD", trigger: "USER_MANUAL", results: PASSED_RESULTS } },
  { id: "run-14", startedAt: "Apr 9, 2026 at 8:45 AM", duration: "1m 03s", status: "succeeded", activity: "Replication", rpo: "5m"  },
  { id: "run-13", startedAt: "Apr 9, 2026 at 8:30 AM", duration: "1m 17s", status: "succeeded", activity: "Replication", rpo: "10m" },
  { id: "run-12", startedAt: "Apr 9, 2026 at 8:15 AM", duration: "1m 09s", status: "succeeded", activity: "Replication", rpo: "5m"  },
  { id: "run-11", startedAt: "Apr 9, 2026 at 8:00 AM", duration: "1m 22s", status: "succeeded", activity: "Replication", rpo: "10m" },
  { id: "run-10", startedAt: "Apr 9, 2026 at 6:00 AM", duration: "2m 41s", status: "succeeded", activity: "Validation",  rpo: "—",
    validation: { name: "fgv-3b02d4", type: "STANDARD", trigger: "SYSTEM_SCHEDULED",
      results: results({
        4: { status: "ABORTED", errors: [{
          errorClass: "INTERNAL_ERROR",
          message: "The check couldn't finish because of an internal error. It will run again with the next scheduled validation.",
        }] },
      }),
    },
  },
  { id: "run-9",  startedAt: "Apr 9, 2026 at 12:00 AM", duration: "2m 58s", status: "failed",   activity: "Validation",  rpo: "—",
    validation: { name: "fgv-91f5aa", type: "STANDARD", trigger: "SYSTEM_SCHEDULED",
      results: results({
        0: { status: "FAILED", errors: [{
          errorClass: "CATALOG_NOT_REPLICATED",
          message: "Catalog ml_catalog has no matching catalog in the secondary metastore.",
          parameters: { catalog_name: "ml_catalog" },
        }] },
        5: { status: "FAILED", errors: [{
          errorClass: "STORAGE_LOCATION_NOT_MAPPED",
          message: "No external location in us-west-2 covers s3://primary-bucket/external.",
          parameters: { storage_location: "s3://primary-bucket/external", region: "us-west-2" },
        }] },
      }),
    },
  },
]

const REPLICATION_PROGRESS = 74

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

function StatusIcon({ status }: { status: ReplicationStatus | ValidationOutcome }) {
  if (status === "succeeded") return <CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />
  if (status === "failed") return <XCircleIcon className="h-4 w-4 text-destructive" />
  if (status === "aborted") return <WarningIcon className="h-4 w-4 text-[var(--warning)]" />
  return <RunningIcon className="h-4 w-4 text-primary animate-spin [animation-duration:2s]" />
}

const CHECK_STATUS_ICON: Record<CheckStatus, ValidationOutcome> = {
  PASSED: "succeeded",
  FAILED: "failed",
  ABORTED: "aborted",
  RUNNING: "running",
}

const CHECK_COUNT_TAG: Record<CheckStatus, { className: string; icon: React.ReactNode }> = {
  PASSED: { className: "bg-[var(--background-success)] text-[var(--success)]", icon: <CheckCircleIcon /> },
  ABORTED: { className: "bg-[var(--background-warning)] text-[var(--warning)]", icon: <WarningIcon /> },
  FAILED: { className: "bg-[var(--background-danger)] text-destructive", icon: <XCircleIcon /> },
  RUNNING: { className: "bg-primary/10 text-primary", icon: <RunningIcon className="animate-spin [animation-duration:2s]" /> },
}

const CHECK_TOOLTIP_STATUS: Record<CheckStatus, string> = {
  PASSED: "Passed",
  FAILED: "Failed",
  ABORTED: "Couldn't finish",
  RUNNING: "Running",
}

function CheckCounts({ results }: { results: FailoverGroupValidationCheckResult[] }) {
  const checks = groupByKind(results)
  const groups = (["PASSED", "ABORTED", "FAILED", "RUNNING"] as const)
    .map((status) => ({ status, kinds: checks.filter((c) => c.status === status).map((c) => c.kind) }))
    .filter(({ kinds }) => kinds.length > 0)
  return (
    <span className="flex items-center gap-1.5">
      {groups.map(({ status, kinds }) => (
        <Tooltip key={status}>
          <TooltipTrigger asChild>
            <Badge
              className={`h-5 gap-1 px-1.5 py-0 text-sm font-normal [&>svg]:size-3.5 ${CHECK_COUNT_TAG[status].className}`}
              aria-label={`${kinds.length} ${CHECK_TOOLTIP_STATUS[status].toLowerCase()}`}
            >
              {CHECK_COUNT_TAG[status].icon}
              {kinds.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="px-3 py-2">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{CHECK_TOOLTIP_STATUS[status]}</span>
              {kinds.map((kind) => <span key={kind}>{CHECK_LABELS[kind]}</span>)}
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </span>
  )
}

const STATUS_SEVERITY: CheckStatus[] = ["RUNNING", "FAILED", "ABORTED", "PASSED"]

// Groups results of the same kind, e.g. "Server-side copy config · us-east-1, us-west-2".
function groupByKind(results: FailoverGroupValidationCheckResult[]) {
  const kinds = (Object.keys(CHECK_LABELS) as CheckKind[]).filter((k) => results.some((r) => r.kind === k))
  return kinds.map((kind) => {
    const kindResults = results.filter((r) => r.kind === kind)
    const status = STATUS_SEVERITY.find((s) => kindResults.some((r) => r.status === s)) ?? "PASSED"
    return { kind, status, regions: kindResults.map((r) => r.region) }
  })
}

const OUTCOME_LABEL: Record<ValidationOutcome, string> = {
  succeeded: "Passed",
  failed: "Failed",
  aborted: "Incomplete",
  running: "Running",
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

function ValidationDetails({ run }: { run: ActivityRun }) {
  const validation = run.validation!
  const results = validation.results
  const outcome = validationOutcome(results)
  const issues = results.filter((r) => r.status === "FAILED" || r.status === "ABORTED")

  const meta: [string, React.ReactNode][] = [
    ["Status", <span key="s" className="flex items-center gap-1.5"><StatusIcon status={outcome} />{OUTCOME_LABEL[outcome]}</span>],
    ["Start time", run.startedAt],
    ["Trigger", validation.trigger === "SYSTEM_SCHEDULED" ? "Scheduled" : "Manual"],
    ["Duration", outcome === "running" ? "—" : run.duration],  ]

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
      <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-sm">
        {meta.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-foreground">{value}</dd>
          </React.Fragment>
        ))}
      </dl>

      <div className="border-t border-border" />

      <DetailSection title="Check results">
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="px-3">Check</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupByKind(results).map((g) => {
                const kindIssues = issues.filter((r) => r.kind === g.kind)
                return (
                <React.Fragment key={g.kind}>
                <TableRow className={`hover:bg-transparent dark:hover:bg-transparent ${kindIssues.length > 0 ? "border-b-0" : ""}`}>
                  <TableCell className="whitespace-normal px-3">
                    <span className="flex items-center gap-2">
                      <StatusIcon status={CHECK_STATUS_ICON[g.status]} />
                      {CHECK_LABELS[g.kind]}
                    </span>
                  </TableCell>
                </TableRow>
                {kindIssues.length > 0 && (
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                  <TableCell colSpan={2} className="whitespace-normal pt-0 pr-3 pl-9">
                    <div className="flex flex-col gap-3">
                    {kindIssues.flatMap((result) =>
                      (result.errors ?? [{ errorClass: "UNKNOWN", message: "No additional details are available." }]).map((error, i) => (
                        <div key={`${result.region}-${i}`} className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground">
                            {result.region}{result.status === "ABORTED" && " · Couldn't finish"}
                          </span>
                          <span className="text-accent-foreground">{error.message}</span>
                          <span className="flex items-center gap-1">
                            <code className="font-mono text-xs text-muted-foreground">{error.errorClass}</code>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label="Copy error class"
                              onClick={() => { navigator.clipboard?.writeText(error.errorClass); toast.success("Copied to clipboard") }}
                            >
                              <CopyIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </span>
                        </div>
                      )),
                    )}
                    </div>
                  </TableCell>
                </TableRow>
                )}
                </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </DetailSection>
    </div>
  )
}

export default function ReplicationPlanPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string
  const planId = params.planId as string

  const groupName = "my-replication-plan"
  const primaryWs = { label: "ws-prod-east", cloud: "AWS", region: "us-east-1" }
  const replicaWs  = { label: "ws-prod-dr-west", cloud: "AWS", region: "us-west-2" }
  const [runs, setRuns] = React.useState<ActivityRun[]>(RUNS)
  const validationRuns = runs.filter((run) => run.activity === "Validation" && run.validation)
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
  const [assetsUpdatedAt, setAssetsUpdatedAt] = React.useState("Apr 9, 2026 at 9:45 AM")
  const [refreshOpen, setRefreshOpen] = React.useState(false)
  const [refreshConfirm, setRefreshConfirm] = React.useState("")
  const [selectedRunId, setSelectedRunId] = React.useState<string | null>(null)
  const selectedRun = runs.find((r) => r.id === selectedRunId && r.validation)

  function startValidation() {
    const id = `run-${Date.now()}`
    const running = results({}, "RUNNING")
    const validation: FailoverGroupValidation = { name: `fgv-${id.slice(-6)}`, type: "STANDARD", trigger: "USER_MANUAL", results: running }
    setRuns((prev) => [{ id, startedAt: "Apr 9, 2026 at 9:50 AM", duration: "—", status: "running", activity: "Validation", rpo: "—", validation }, ...prev])
    setSelectedRunId(id)
    setValidating(true)
    toast.success("Validation started")
    // Check results resolve one at a time so the expanded row shows progress.
    CHECK_PLAN.forEach((_, step) => {
      setTimeout(() => {
        setRuns((prev) => prev.map((r) => {
          if (r.id !== id || !r.validation) return r
          const next = r.validation.results.map((c, i) => (i === step ? PASSED_RESULTS[i] : c))
          const done = step === CHECK_PLAN.length - 1
          return { ...r, validation: { ...r.validation, results: next }, ...(done ? { status: "succeeded" as const, duration: "2m 30s" } : {}) }
        }))
        if (step === CHECK_PLAN.length - 1) setValidating(false)
      }, (step + 1) * 700)
    })
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
                  <BreadcrumbPage>{groupName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          title={groupName}
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

            {/* Validations */}
            <div className="rounded-md border border-border shadow-[var(--shadow-db-sm)] flex flex-col">
              <div className="px-4 py-2.5 border-b border-border bg-secondary rounded-t-md">
                <p className="text-sm font-semibold">Validations</p>
              </div>
              <div className="px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start time</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationRuns.map((run) => {
                    const checks = run.validation!.results
                    const outcome = validationOutcome(checks)
                    return (
                    <TableRow
                      key={run.id}
                      className="cursor-pointer"
                      data-state={selectedRunId === run.id ? "selected" : undefined}
                      tabIndex={0}
                      aria-label={`View validation started ${run.startedAt}`}
                      onClick={() => setSelectedRunId(run.id)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedRunId(run.id) } }}
                    >
                      <TableCell>{run.startedAt}</TableCell>
                      <TableCell>
                        <CheckCounts results={checks} />
                      </TableCell>
                      <TableCell>{run.validation!.trigger === "SYSTEM_SCHEDULED" ? "Scheduled" : "Manual"}</TableCell>
                      <TableCell>{outcome === "running" ? <span className="text-muted-foreground">—</span> : run.duration}</TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              </div>
            </div>

            <Sheet open={Boolean(selectedRun)} onOpenChange={(open) => { if (!open) setSelectedRunId(null) }}>
              <SheetContent side="right" showCloseButton={false} className="w-full gap-0 sm:max-w-[480px]">
                {selectedRun && (
                  <>
                    <SheetHeader className="px-6 pt-6 pb-4">
                      <SheetDescription className="sr-only">Validation started {selectedRun.startedAt}</SheetDescription>
                      <span className="flex items-center gap-2">
                        <span className="order-last -mr-1 ml-auto flex items-center gap-2">
                          {!["running", "succeeded"].includes(validationOutcome(selectedRun.validation!.results)) && (
                            <Button variant="outline" size="xs" className="text-sm">
                              View in system table
                              <NewWindowIcon className="size-4" />
                            </Button>
                          )}
                          <SheetClose asChild>
                            <Button variant="ghost" size="icon-xs" aria-label="Close">
                              <CloseIcon className="size-4 text-muted-foreground" />
                            </Button>
                          </SheetClose>
                        </span>
                        <SheetTitle className="text-lg leading-6">Validation</SheetTitle>
                        <span className="flex items-center gap-1">
                        <code className="font-mono text-[14px] text-muted-foreground">{selectedRun.validation!.name}</code>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Copy validation ID"
                          onClick={() => { navigator.clipboard?.writeText(selectedRun.validation!.name); toast.success("Copied to clipboard") }}
                        >
                          <CopyIcon className="size-4 text-muted-foreground" />
                        </Button>
                        </span>
                      </span>
                    </SheetHeader>
                    <ValidationDetails run={selectedRun} />
                  </>
                )}
              </SheetContent>
            </Sheet>
          </div>

          <div className="w-full shrink-0 lg:w-[280px]">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-foreground">About this failover group</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-[110px] shrink-0">Created</span>
                <span className="text-sm text-foreground">Apr 1, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-[110px] shrink-0">Created by</span>
                <span className="text-sm text-foreground">Allison Sun</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex w-[110px] shrink-0 items-center gap-1 text-sm text-muted-foreground">
                  RPO
                  <Info className="h-3.5 w-3.5 shrink-0" />
                </span>
                <span className="text-sm text-foreground">Apr 9, 2026 at 9:45 AM ({currentRpo} ago)</span>
              </div>
            </div>
            <div className="my-4 border-t border-border" />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-foreground">Assets</p>
              <div className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground w-[110px] shrink-0">Last updated</span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm text-foreground">{assetsUpdatedAt}</span>
                  <Button
                    variant="outline"
                    size="xs"
                    className="w-fit text-sm"
                    onClick={() => setRefreshOpen(true)}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground w-[110px] shrink-0">Enabled assets</span>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-foreground">
                    Workspace assets
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-1 inline-block h-3.5 w-3.5 align-[-2px] text-muted-foreground" aria-label="About workspace assets" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64">
                        Notebooks, jobs, SQL warehouses, clusters, draft AI/BI dashboards, files, and folders, along with their ACLs.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="text-sm text-foreground">
                    Beta assets
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-1 inline-block h-3.5 w-3.5 align-[-2px] text-muted-foreground" aria-label="About beta assets" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64">
                        Placeholder description of beta assets.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <Dialog open={refreshOpen} onOpenChange={(open) => { setRefreshOpen(open); if (!open) setRefreshConfirm("") }}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Refresh assets in failover group</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-accent-foreground">
              This updates the assets replicated from{" "}
              <span className="font-semibold text-foreground">{failedOver ? replicaWs.label : primaryWs.label}</span> to{" "}
              <span className="font-semibold text-foreground">{failedOver ? primaryWs.label : replicaWs.label}</span>.
              While updating, the failover group will be in initial replication and failover will not be available.
            </p>
            <p className="mt-3 text-sm text-foreground">
              <span className="font-semibold text-accent-foreground">Enabled assets:</span> Workspace assets, beta assets
            </p>
            <div className="flex flex-col gap-1.5 mt-6">
              <Label htmlFor="refresh-confirm" className="font-normal text-accent-foreground">
                Type <span className="font-semibold text-foreground">{groupName}</span> to confirm
              </Label>
              <Input
                id="refresh-confirm"
                value={refreshConfirm}
                onChange={(e) => setRefreshConfirm(e.target.value)}
                placeholder={groupName}
                autoComplete="off"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setRefreshOpen(false); setRefreshConfirm("") }}>Cancel</Button>
            <Button
              size="sm"
              disabled={refreshConfirm !== groupName}
              onClick={() => {
                setAssetsUpdatedAt("Just now")
                setRefreshOpen(false)
                setRefreshConfirm("")
                toast.success("Asset refresh started")
              }}
            >
              Refresh assets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
