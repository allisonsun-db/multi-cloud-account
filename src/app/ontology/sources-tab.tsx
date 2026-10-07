"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from "@/components/ui/dialog"
import {
  LoadingIcon, McpIcon, PlugIcon, SearchDataIcon, WarningIcon,
  DatabaseImportIcon,
} from "@/components/icons"
import { ExternalLink, Search } from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CardTitle, CardValue, MonitorCard, RankedBarList, SectionHeader } from "./shared"
import {
  GENIE_USERS, INITIAL_SOURCES, KNOWLEDGE_ORIGINS, METASTORE_COVERAGE, type CoverageStatus,
  type Source, type SourceChannel,
} from "./data"

const CHANNEL_ICON: Record<SourceChannel, React.ComponentType<{ className?: string }>> = {
  "Search index": SearchDataIcon,
  "MCP server": McpIcon,
  "Metadata mirroring": DatabaseImportIcon,
  "Enterprise connector": PlugIcon,
}

// Brand favicons for the prototype; falls back to the connection-type icon offline.
const SOURCE_DOMAIN: Record<string, string> = {
  "Google Drive": "drive.google.com",
  Slack: "slack.com",
  Jira: "jira.com",
  Confluence: "confluence.atlassian.com",
  GitHub: "github.com",
  SharePoint: "sharepoint.com",
  Glean: "glean.com",
}

function SourceLogo({ source }: { source: Source }) {
  const [failed, setFailed] = React.useState(false)
  const domain = SOURCE_DOMAIN[source.name]
  const Icon = CHANNEL_ICON[source.channel]
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded border border-border bg-background">
      {domain && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
          className="size-4"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon className="h-4 w-4 text-muted-foreground" />
      )}
    </span>
  )
}

function AuthBar({ source, total }: { source: Source; total: number }) {
  if (source.authenticated === undefined) {
    return <span className="text-muted-foreground">{source.status === "Not connected" ? "—" : "Not required"}</span>
  }
  const pct = Math.round((source.authenticated / total) * 100)
  // Percent inline; the raw count is in the tooltip.
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex cursor-default items-center gap-3">
          <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className={`block h-full rounded-full ${pct >= 50 ? "bg-primary" : "bg-[var(--warning)]"}`}
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="w-10 shrink-0 text-right tabular-nums text-foreground">{pct}%</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{source.authenticated} of {total} Genie users authenticated</TooltipContent>
    </Tooltip>
  )
}

// ─── Connect / reconnect dialog ───────────────────────────────────────────────

function ConnectDialog({
  source,
  onOpenChange,
  onConnected,
}: {
  source: Source | null
  onOpenChange: (open: boolean) => void
  onConnected: (id: string) => void
}) {
  const [step, setStep] = React.useState<"auth" | "loading">("auth")
  React.useEffect(() => {
    if (source) setStep("auth")
  }, [source])

  const reconnect = source?.status === "Needs attention"

  function handleAuthorize() {
    if (!source) return
    setStep("loading")
    window.setTimeout(() => {
      onConnected(source.id)
      toast.success(`${source.name} ${reconnect ? "reconnected" : "connected"} — first sync started`)
      onOpenChange(false)
    }, 1400)
  }

  return (
    <Dialog open={!!source} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        {source && step === "auth" && (<>
          <DialogHeader className="px-6 pt-4 pb-0">
            <DialogTitle className="text-[22px] font-semibold leading-7">
              {reconnect ? `Reconnect ${source.name}` : `Connect ${source.name}`}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3 px-6 pt-4 pb-4">
            <p className="text-sm text-muted-foreground">
              You&apos;ll be redirected to {source.name} to authorize Databricks. Genie will index{" "}
              {source.contributes.toLowerCase()} using the permissions of each end user, so people only see content they can already access.
            </p>
            {source.detail && (
              <div className="flex items-start gap-2 rounded border border-border bg-muted px-3 py-2 text-sm">
                <WarningIcon size={14} className="mt-0.5 shrink-0 text-[var(--warning)]" />
                {source.detail}
              </div>
            )}
          </DialogBody>
          <DialogFooter className="px-6 pt-4 pb-6">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" onClick={handleAuthorize}>
              Authorize with {source.name}
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </>)}
        {source && step === "loading" && (
          <DialogBody className="flex flex-col items-center justify-center gap-3 px-6 py-16">
            <LoadingIcon size={24} className="animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Waiting for {source.name}…</span>
          </DialogBody>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Where knowledge comes from (P1) ──────────────────────────────────────────

function KnowledgeOriginsCard() {
  const firstParty = KNOWLEDGE_ORIGINS.filter((k) => k.group === "Databricks").reduce((s, k) => s + k.value, 0)
  const rows = KNOWLEDGE_ORIGINS.map((k) => ({ id: k.name, name: k.name, value: k.value, label: `${k.value}%` }))

  return (
    <MonitorCard>
      <div className="flex flex-col gap-0.5">
        <CardTitle>Where knowledge comes from</CardTitle>
        <CardValue>{firstParty}% from Databricks</CardValue>
        <span className="text-sm text-muted-foreground">{100 - firstParty}% from third-party apps</span>
      </div>
      <RankedBarList columns={["Source", "Share of indexed knowledge"]} rows={rows} />
    </MonitorCard>
  )
}

// Connected-sources column: how many metastores the connector is set up in, with a
// segment per metastore. Per-metastore status (and the issue detail) is in the tooltip.
function MetastoresCovered({ source }: { source: Source }) {
  const per = METASTORE_COVERAGE.map((m) => ({ metastore: m.metastore, status: m.status[source.name] ?? ("Not set up" as CoverageStatus) }))
  const covered = per.filter((p) => p.status !== "Not set up").length
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex cursor-default items-center gap-3">
          <span className="flex gap-0.5" aria-hidden="true">
            {per.map((p) => (
              <span key={p.metastore} className={`h-2 w-6 rounded-[2px] ${p.status === "Not set up" ? "bg-muted" : "bg-primary"}`} />
            ))}
          </span>
          <span className="tabular-nums text-foreground">{covered} of {per.length}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-0.5">
          {per.map((p) => <span key={p.metastore}>{p.metastore}: {p.status}</span>)}
          {source.detail && <span className="opacity-70">{source.detail}</span>}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

// ─── Sources tab ───────────────────────────────────────────────────────────────

export function SourcesTab() {
  const [sources, setSources] = React.useState<Source[]>(INITIAL_SOURCES)
  const [filter, setFilter] = React.useState("")
  const [connecting, setConnecting] = React.useState<Source | null>(null)

  const rows = sources.filter(
    (s) =>
      `${s.name} ${s.contributes} ${s.scope}`.toLowerCase().includes(filter.toLowerCase()),
  )
  function markConnected(id: string) {
    setSources((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "Syncing",
              lastSync: "In progress",
              detail: undefined,
              scope: s.scope === "—" ? "All domains" : s.scope,
              authenticated: s.authenticated ?? 0,
            }
          : s,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ConnectDialog source={connecting} onOpenChange={(o) => !o && setConnecting(null)} onConnected={markConnected} />

      {/* Configured sources */}
      <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-[var(--shadow-db-sm)]">
          <SectionHeader
            title="Connected sources"
            description={`Connectors query with each user's own credentials, so users authenticate per source (share of ${GENIE_USERS.all} Genie users).`}
          />
          {/* Status summary — icon + label, the table has the detail. */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-[280px] max-w-full">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search sources…" value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-8" />
            </div>
            <Button size="sm" className="ml-auto shrink-0" onClick={() => toast.success("Opened connector catalog")}>Add source</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Metastores covered</TableHead>
                <TableHead className="w-[32%]">Users authenticated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <SourceLogo source={s} />
                        <span className="text-foreground">{s.name}</span>
                      </span>
                    </TableCell>
                    <TableCell><MetastoresCovered source={s} /></TableCell>
                    <TableCell><AuthBar source={s} total={GENIE_USERS.all} /></TableCell>
                  </TableRow>
                )
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">No sources match.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </section>

      <KnowledgeOriginsCard />
    </div>
  )
}
