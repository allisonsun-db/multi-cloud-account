"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { CLOUD_ICONS } from "@/components/ui/location-picker"
import { CheckCircleIcon, XCircleIcon, RunningIcon, OverflowIcon, CopyIcon, CatalogIcon } from "@/components/icons"
import { ExternalLink, ChevronDown, ArrowRight, Info } from "lucide-react"

type ReplicationStatus = "succeeded" | "failed" | "running"
type ActivityType = "Replication" | "Failover"

interface ActivityRun {
  id: string
  startedAt: string
  duration: string
  status: ReplicationStatus
  activity: ActivityType
  rpo: string
}

const RUNS: ActivityRun[] = [
  { id: "run-18", startedAt: "Apr 9, 2026 at 9:45 AM", duration: "1m 12s", status: "running",   activity: "Replication", rpo: "5m"  },
  { id: "run-17", startedAt: "Apr 9, 2026 at 9:30 AM", duration: "1m 08s", status: "succeeded", activity: "Replication", rpo: "10m" },
  { id: "run-16", startedAt: "Apr 9, 2026 at 9:15 AM", duration: "1m 21s", status: "succeeded", activity: "Failover",    rpo: "5m"  },
  { id: "run-15", startedAt: "Apr 9, 2026 at 9:00 AM", duration: "0m 54s", status: "failed",    activity: "Replication", rpo: "15m" },
  { id: "run-14", startedAt: "Apr 9, 2026 at 8:45 AM", duration: "1m 03s", status: "succeeded", activity: "Replication", rpo: "5m"  },
  { id: "run-13", startedAt: "Apr 9, 2026 at 8:30 AM", duration: "1m 17s", status: "succeeded", activity: "Replication", rpo: "10m" },
  { id: "run-12", startedAt: "Apr 9, 2026 at 8:15 AM", duration: "1m 09s", status: "succeeded", activity: "Replication", rpo: "5m"  },
  { id: "run-11", startedAt: "Apr 9, 2026 at 8:00 AM", duration: "1m 22s", status: "succeeded", activity: "Replication", rpo: "10m" },
]

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

function ReplicationFlowIndicator() {
  // Exact Figma dimensions (node 5010-1877): 80×19 frame, line at y=10, arrowhead 8×8 at x=76 y=6
  // Dashes animated left→right via stroke-dashoffset
  return (
    <div className="mt-[38px] shrink-0" style={{ width: 84, height: 19 }}>
      <svg
        width="84"
        height="19"
        viewBox="0 0 84 19"
        fill="none"
        className="text-muted-foreground"
      >
        <line
          x1="0" y1="10" x2="76" y2="10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          style={{ animation: "dash-flow 0.6s linear infinite" }}
        />
        {/* 8×8 filled triangle arrowhead at x=76, centered at y=10 */}
        <polygon points="76,6 84,10 76,14" fill="currentColor" />
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
  const workspaceId = params.id as string
  const planId = params.planId as string

  const primaryWs = { label: "ws-prod-east", cloud: "AWS", region: "us-east-1" }
  const replicaWs  = { label: "ws-prod-dr-west", cloud: "AWS", region: "us-west-2" }
  const workspaceMap = computeWorkspaces(RUNS, primaryWs.label, replicaWs.label)
  const catalogs = ["main", "prod_catalog", "analytics", "ml_catalog"]
  const storageMappings = [
    { source: "s3://primary-bucket/metastore", destination: "s3://dr-bucket/metastore" },
    { source: "s3://primary-bucket/external",  destination: "s3://dr-bucket/external" },
  ]
  const [expanded, setExpanded] = React.useState(false)
  const [hoveredCatalog, setHoveredCatalog] = React.useState<string | null>(null)
  const [hoveredStorage, setHoveredStorage] = React.useState<string | null>(null)
  const [failoverOpen, setFailoverOpen] = React.useState(false)
  const [arrowY, setArrowY] = React.useState<number | null>(null)
  const cardsRef = React.useRef<HTMLDivElement>(null)

  function onRowEnter(key: string, type: "catalog" | "storage", e: React.MouseEvent<HTMLDivElement>) {
    if (type === "catalog") setHoveredCatalog(key)
    else setHoveredStorage(key)
    if (cardsRef.current) {
      const rowRect = e.currentTarget.getBoundingClientRect()
      const containerRect = cardsRef.current.getBoundingClientRect()
      setArrowY(rowRect.top - containerRect.top + rowRect.height / 2)
    }
  }

  function onRowLeave(type: "catalog" | "storage") {
    if (type === "catalog") setHoveredCatalog(null)
    else setHoveredStorage(null)
    setArrowY(null)
  }

  return (
    <AppShell activeItem="workspaces">
      <div className="flex flex-col gap-6 p-6">

        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/workspaces">Workspaces</BreadcrumbLink>
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
                  <DropdownMenuItem>Edit replication plan</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={() => setFailoverOpen(true)}>Start failover</Button>
            </>
          }
        />

        {/* Stable URL */}
        <div className="rounded-md border border-border shadow-[var(--shadow-db-sm)] overflow-hidden flex items-stretch">
          <div className="bg-green-100 dark:bg-green-950 flex flex-col justify-center px-3 py-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />
              <span className="text-sm font-semibold text-[var(--success)] whitespace-nowrap">Active</span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-between px-4 py-2 min-w-0">
            <span className="text-sm text-foreground truncate">https://accounts.cloud.databricks.com/replication-plans/{planId}</span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Button variant="ghost" size="icon-sm" aria-label="Copy URL">
                <CopyIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Open">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Workspaces */}
        <div className="rounded-md border border-border shadow-[var(--shadow-db-sm)] flex flex-col">
          <div ref={cardsRef} className="relative flex items-start justify-center gap-0.5 px-4 py-6 shadow-xs">
            {arrowY !== null && (
              <div
                className="absolute pointer-events-none z-10"
                style={{ top: arrowY - 6, left: "50%", transform: "translateX(-42px)" }}
              >
                <svg width="84" height="12" viewBox="0 0 84 12" fill="none" className="text-primary">
                  <line x1="0" y1="6" x2="76" y2="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4"
                    style={{ animation: "dash-flow 0.6s linear infinite" }} />
                  <polygon points="76,2 84,6 76,10" fill="currentColor" />
                </svg>
              </div>
            )}
            {/* Primary workspace */}
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold">Primary workspace</p>
              <div className="rounded-md border border-border shadow-[var(--shadow-db-sm)] w-[300px]">
                <div
                  className="flex items-center gap-2 text-sm px-3 py-2.5 cursor-pointer select-none"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {CLOUD_ICONS[primaryWs.cloud]}
                  <a
                    href={`/workspaces/${workspaceId}`}
                    className="flex items-center gap-2 flex-1 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{primaryWs.label}</span>
                    <span className="text-muted-foreground">({primaryWs.region})</span>
                  </a>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
                {expanded && (
                  <div className="border-t border-border divide-y divide-border">
                    <div className="px-3 py-2">
                      <p className="text-xs font-normal text-muted-foreground mb-1.5 py-px">Selected catalogs</p>
                      <div className="flex flex-col gap-0.5">
                        {catalogs.map((c) => (
                          <div
                            key={c}
                            className={`flex items-center gap-2 py-1 text-sm rounded px-1 -mx-1 transition-colors ${hoveredCatalog === c ? "bg-primary/10 text-primary" : ""}`}
                            onMouseEnter={(e) => onRowEnter(c, "catalog", e)}
                            onMouseLeave={() => onRowLeave("catalog")}
                          >
                            <CatalogIcon className={`h-4 w-4 shrink-0 ${hoveredCatalog === c ? "text-primary" : "text-muted-foreground"}`} />
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-normal text-muted-foreground mb-1.5 py-px">Storage locations</p>
                      <div className="flex flex-col gap-0.5">
                        {storageMappings.map((m) => (
                          <div
                            key={m.source}
                            className={`text-sm font-mono truncate rounded px-1 -mx-1 py-[3px] transition-colors ${hoveredStorage === m.source ? "bg-primary/10 text-primary" : "text-accent-foreground"}`}
                            onMouseEnter={(e) => onRowEnter(m.source, "storage", e)}
                            onMouseLeave={() => onRowLeave("storage")}
                          >
                            {m.source}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ReplicationFlowIndicator />

            {/* Secondary workspace */}
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold">Secondary workspace</p>
              <div className="rounded-md border border-border shadow-[var(--shadow-db-sm)] w-[300px]">
                <div
                  className="flex items-center gap-2 text-sm px-3 py-2.5 cursor-pointer select-none"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {CLOUD_ICONS[replicaWs.cloud]}
                  <a
                    href="/workspaces/ws-prod-dr-west"
                    className="flex items-center gap-2 flex-1 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{replicaWs.label}</span>
                    <span className="text-muted-foreground">({replicaWs.region})</span>
                  </a>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
                {expanded && (
                  <div className="border-t border-border divide-y divide-border">
                    <div className="px-3 py-2">
                      <p className="text-xs font-normal text-muted-foreground mb-1.5 py-px">Secondary catalogs</p>
                      <div className="flex flex-col gap-0.5">
                        {catalogs.map((c) => (
                          <div
                            key={c}
                            className={`flex items-center gap-2 py-1 text-sm rounded px-1 -mx-1 transition-colors ${hoveredCatalog === c ? "bg-primary/10 text-primary" : ""}`}
                            onMouseEnter={(e) => onRowEnter(c, "catalog", e)}
                            onMouseLeave={() => onRowLeave("catalog")}
                          >
                            <CatalogIcon className={`h-4 w-4 shrink-0 ${hoveredCatalog === c ? "text-primary" : "text-muted-foreground"}`} />
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-normal text-muted-foreground mb-1.5 py-px">Storage locations</p>
                      <div className="flex flex-col gap-0.5">
                        {storageMappings.map((m) => (
                          <div
                            key={m.destination}
                            className={`text-sm font-mono truncate rounded px-1 -mx-1 py-[3px] transition-colors ${hoveredStorage === m.source ? "bg-primary/10 text-primary" : "text-accent-foreground"}`}
                            onMouseEnter={(e) => onRowEnter(m.source, "storage", e)}
                            onMouseLeave={() => onRowLeave("storage")}
                          >
                            {m.destination}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Replication runs */}
        <div className="rounded-md border border-border shadow-[var(--shadow-db-sm)] flex flex-col">
          <div className="px-4 py-2.5 border-b border-border bg-secondary rounded-t-md">
            <p className="text-sm font-semibold">Activity</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4 w-8"></TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>
                  <span className="flex items-center gap-1">
                    Recovery point objective (RPO)
                    <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RUNS.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="pl-4"><StatusIcon status={run.status} /></TableCell>
                  <TableCell>{run.activity}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <span>{workspaceMap[run.id].from}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>{workspaceMap[run.id].to}</span>
                    </span>
                  </TableCell>
                  <TableCell>{run.startedAt}</TableCell>
                  <TableCell>{run.status === "failed" ? <span className="text-muted-foreground">—</span> : run.rpo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>

      <Dialog open={failoverOpen} onOpenChange={setFailoverOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Start failover</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-accent-foreground">
              This will promote <span className="font-semibold text-foreground">{replicaWs.label}</span> as the new primary workspace and redirect traffic away from <span className="font-semibold text-foreground">{primaryWs.label}</span>.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setFailoverOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setFailoverOpen(false)}>Start failover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
