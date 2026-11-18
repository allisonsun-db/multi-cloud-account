"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  CatalogIcon, CheckCircleIcon, ChevronRightIcon, CloseIcon, DangerFillIcon, FolderIcon, FunctionIcon,
  SchemaIcon, TableIcon, XCircleIcon,
} from "@/components/icons"
// ─── API shape (ListReplicationStateErrors, "[UCDR] Logging API design") ──────

/** The doc leaves asset_type as a free string; these are the UC asset types used in the mocks. */
type AssetType = "CATALOG" | "SCHEMA" | "TABLE" | "VOLUME" | "FUNCTION"

interface ErrorParameter {
  key: string
  value: string
}

export interface ReplicationStateError {
  errorClass: string
  parameters: ErrorParameter[]
  /** Template with parameter placeholders, written here as `{key}`. */
  message: string
  affectedAssetCounts: { assetType: AssetType; failingCount: number }[]
  /** Capped by DR Manager, so it can hold fewer assets than the counts sum to. */
  affectedAssetsSubset: { fullName: string; assetType: AssetType }[]
}

const ASSET_LABEL: Record<AssetType, [string, string]> = {
  CATALOG: ["catalog", "catalogs"],
  SCHEMA: ["schema", "schemas"],
  TABLE: ["table", "tables"],
  VOLUME: ["volume", "volumes"],
  FUNCTION: ["function", "functions"],
}

const ASSET_ICON: Record<AssetType, React.ComponentType<{ className?: string; "aria-label"?: string }>> = {
  CATALOG: CatalogIcon,
  SCHEMA: SchemaIcon,
  TABLE: TableIcon,
  VOLUME: FolderIcon,
  FUNCTION: FunctionIcon,
}

function plural(count: number, [one, many]: [string, string]) {
  return `${count.toLocaleString()} ${count === 1 ? one : many}`
}

const tables = (prefix: string, names: string[]) =>
  names.map((n) => ({ fullName: `${prefix}.${n}`, assetType: "TABLE" as const }))

/** Builds `count` distinct table names across schemas, for samples near the subset cap. */
function manyTables(catalog: string, schemas: string[], bases: string[], count: number) {
  return Array.from({ length: count }, (_, i) => {
    const schema = schemas[i % schemas.length]
    const base = bases[Math.floor(i / schemas.length) % bases.length]
    const version = Math.floor(i / (schemas.length * bases.length))
    return { fullName: `${catalog}.${schema}.${base}${version ? `_v${version + 1}` : ""}`, assetType: "TABLE" as const }
  })
}

const params = (entries: Record<string, string>): ErrorParameter[] =>
  Object.entries(entries).map(([key, value]) => ({ key, value }))

// The error class and `report` value follow the doc's UNAUTHORIZED_ACCESS example (AWS).
// Other error classes, keys, and messages are placeholders: the doc doesn't list them.
const PLAN_1_ERRORS: ReplicationStateError[] = [
  {
    errorClass: "UNAUTHORIZED_ACCESS",
    parameters: params({
      report:
        "s3://primary-bucket/external/__unitystorage/schemas/c8f96a5b-90be-4f26-a750-a7d4ce33d67f/tables/0dd72813-0af8-47c8-855a-27921224bba4/_delta_log: getFileStatus on s3://primary-bucket/external/__unitystorage/schemas/c8f96a5b-90be-4f26-a750-a7d4ce33d67f/tables/0dd72813-0af8-47c8-855a-27921224bba4/_delta_log: shaded.databricks.awssdk.com.amazonaws.services.s3.model.AmazonS3Exception: Access to storage destination is denied because of serverless network policy; request: HEAD http://primary-bucket.s3.amazonaws.com __unitystorage/schemas/c8f96a5b-90be-4f26-a750-a7d4ce33d67f/tables/0dd72813-0af8-47c8-855a-27921224bba4/_delta_log {} Hadoop 3.5.0, aws-sdk-java/1.12.681 (Service: Amazon S3; Status Code: 403; Error Code: 403 Forbidden; Request ID: null; S3 Extended Request ID: null; Proxy: 192.168.200.20), S3 Extended Request ID: null:403 Forbidden",
    }),
    message: "Access to storage was denied.",
    affectedAssetCounts: [{ assetType: "TABLE", failingCount: 312 }, { assetType: "VOLUME", failingCount: 4 }],
    affectedAssetsSubset: [
      ...manyTables("ml_catalog", ["features", "training", "scoring"], ["customer_ltv", "churn_signals", "basket_embeddings", "store_traffic", "price_elasticity", "promo_lift", "session_events", "demand_forecast"], 96),
      ...["raw_events", "images", "checkpoints", "exports"].map((n) => ({ fullName: `ml_catalog.features.${n}`, assetType: "VOLUME" as const })),
    ],
  },
  {
    errorClass: "CREATION_FAILED",
    parameters: params({ full_name: "analytics.finance.budget" }),
    message: "Couldn't create {full_name} in the secondary workspace.",
    affectedAssetCounts: [{ assetType: "TABLE", failingCount: 1 }],
    affectedAssetsSubset: tables("analytics.finance", ["budget"]),
  },
  {
    errorClass: "CATALOG_NOT_REPLICATED",
    parameters: params({ catalog: "ml_catalog_legacy" }),
    message: "Catalog {catalog} can't be replicated.",
    affectedAssetCounts: [
      { assetType: "CATALOG", failingCount: 1 },
      { assetType: "SCHEMA", failingCount: 14 },
      { assetType: "TABLE", failingCount: 220 },
    ],
    affectedAssetsSubset: [
      { fullName: "ml_catalog_legacy", assetType: "CATALOG" },
      { fullName: "ml_catalog_legacy.experiments", assetType: "SCHEMA" },
      ...tables("ml_catalog_legacy.experiments", ["runs", "metrics", "params"]),
    ],
  },
  {
    errorClass: "STORAGE_CREDENTIAL_EXPIRED",
    parameters: params({ credential: "prod_east_cred" }),
    message: "Storage credential {credential} expired.",
    affectedAssetCounts: [{ assetType: "TABLE", failingCount: 48 }],
    affectedAssetsSubset: tables("analytics.finance", ["gl_entries", "ap_invoices", "ar_aging", "forecast", "fx_rates"]),
  },
  {
    errorClass: "TABLE_SCHEMA_MISMATCH",
    parameters: params({ table: "main.sales.orders" }),
    message: "Table {table} has a different schema in the secondary workspace.",
    affectedAssetCounts: [{ assetType: "TABLE", failingCount: 1 }],
    affectedAssetsSubset: tables("main.sales", ["orders"]),
  },
  {
    errorClass: "FUNCTION_DEPENDENCY_NOT_REPLICATED",
    parameters: params({ function: "analytics.udf.score_customer", dependency: "analytics.udf.base_score" }),
    message: "Function {function} depends on {dependency}, which isn't replicated.",
    affectedAssetCounts: [{ assetType: "FUNCTION", failingCount: 2 }],
    affectedAssetsSubset: [
      { fullName: "analytics.udf.score_customer", assetType: "FUNCTION" },
      { fullName: "analytics.udf.score_segment", assetType: "FUNCTION" },
    ],
  },
]

const PLAN_5_ERRORS: ReplicationStateError[] = [
  {
    errorClass: "STORAGE_LOCATION_NOT_MAPPED",
    parameters: params({ location: "s3://finance-prod/reporting/" }),
    message: "Storage location {location} has no mapping in the secondary region.",
    affectedAssetCounts: [{ assetType: "TABLE", failingCount: 26 }],
    affectedAssetsSubset: tables("finance.reporting", ["daily_close", "monthly_close", "fx_rates", "cost_centers", "headcount"]),
  },
  {
    errorClass: "TABLE_SCHEMA_MISMATCH",
    parameters: params({ table: "finance.payroll.employees" }),
    message: "Table {table} has a different schema in the secondary workspace.",
    affectedAssetCounts: [{ assetType: "TABLE", failingCount: 1 }],
    affectedAssetsSubset: tables("finance.payroll", ["employees"]),
  },
]

const ERRORS_BY_PLAN: Record<string, ReplicationStateError[]> = {
  "plan-1": PLAN_1_ERRORS,
  "plan-5": PLAN_5_ERRORS,
}

export function getReplicationErrors(planId: string): ReplicationStateError[] {
  return ERRORS_BY_PLAN[planId] ?? []
}

/** Indices of errors that affect a catalog, or reference a storage location in a parameter. */
export function errorsForAsset(errors: ReplicationStateError[], asset: { catalog?: string; location?: string }) {
  return errors.flatMap((error, i) => {
    const matches = asset.catalog
      ? error.affectedAssetsSubset.some((a) => a.fullName === asset.catalog || a.fullName.startsWith(`${asset.catalog}.`))
      : error.parameters.some((p) => asset.location && p.value.includes(asset.location))
    return matches ? [i] : []
  })
}

export function affectedTotal(error: ReplicationStateError) {
  return error.affectedAssetCounts.reduce((sum, c) => sum + c.failingCount, 0)
}

/** Stands in for the response's total_errors and total_affected_assets. The mocks have no grouped errors, so they match the rows. */
export function summarizeErrors(errors: ReplicationStateError[]) {
  return {
    totalErrors: errors.length,
    totalAffectedAssets: errors.reduce((sum, e) => sum + affectedTotal(e), 0),
  }
}

export function summaryText(errors: ReplicationStateError[]) {
  const { totalErrors, totalAffectedAssets } = summarizeErrors(errors)
  return `${plural(totalErrors, ["error", "errors"])} affecting ${plural(totalAffectedAssets, ["asset", "assets"])}`
}

// ─── Failover group list tag ───────────────────────────────────────────────────

export function ErrorCountTag({ errors }: { errors: ReplicationStateError[] }) {
  if (errors.length === 0) return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className="h-5 gap-1 bg-[var(--background-danger)] px-1.5 py-0 text-sm font-normal text-destructive [&>svg]:size-3.5">
          <XCircleIcon />
          {plural(errors.length, ["error", "errors"])}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="first-letter:uppercase">{summaryText(errors)}</TooltipContent>
    </Tooltip>
  )
}

// ─── Replication status card ───────────────────────────────────────────────────

export function ReplicationErrorsAlert({ errors, onView }: { errors: ReplicationStateError[]; onView: () => void }) {
  if (errors.length === 0) return null
  return (
    <Alert variant="destructive" className="flex items-center gap-2 px-3 py-2 [&>svg]:translate-y-0">
      <DangerFillIcon className="size-4 shrink-0" />
      <AlertTitle className="min-w-0 flex-1 truncate font-normal leading-5 text-foreground">
        <span className="font-semibold">{plural(errors.length, ["error", "errors"])}</span>
        {" "}affecting {plural(summarizeErrors(errors).totalAffectedAssets, ["asset", "assets"])} in the secondary workspace
      </AlertTitle>
      <Button variant="outline" size="xs" className="shrink-0 bg-background text-sm text-foreground" onClick={onView}>
        View errors
      </Button>
    </Alert>
  )
}

/** Same look as the failed-check tags in the Validations results column. */
export function FlowErrorTag({ errors, onView }: { errors: ReplicationStateError[]; onView: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          asChild
          className="h-5 cursor-pointer gap-1 px-1.5 py-0 text-sm font-normal text-destructive ring-2 ring-background [&>svg]:size-3.5"
          // The danger tint is translucent in dark mode; layer it over the page background so the arrow doesn't show through.
          style={{ background: "linear-gradient(var(--background-danger), var(--background-danger)), var(--background)" }}
        >
          <button type="button" aria-label={`View ${summaryText(errors)}`} onClick={onView}>
            <XCircleIcon />
            {errors.length}
          </button>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="first-letter:uppercase">{summaryText(errors)}</TooltipContent>
    </Tooltip>
  )
}

export function FlowErrorMarker({ errors, onView }: { errors: ReplicationStateError[]; onView: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`View ${summaryText(errors)}`}
          onClick={onView}
          className="absolute left-1/2 top-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background text-destructive transition-transform hover:scale-110"
        >
          <DangerFillIcon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="first-letter:uppercase">{summaryText(errors)}</TooltipContent>
    </Tooltip>
  )
}

// ─── Errors panel ──────────────────────────────────────────────────────────────

function ErrorMessage({ error }: { error: ReplicationStateError }) {
  const parts = error.message.split(/(\{\w+\})/)
  return (
    <span>
      {parts.map((part, i) => {
        const key = part.match(/^\{(\w+)\}$/)?.[1]
        const value = key ? error.parameters.find((p) => p.key === key)?.value : undefined
        return value !== undefined
          ? <code key={i} className="break-all font-mono text-[12px]">{value}</code>
          : <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </span>
  )
}

const ASSET_PREVIEW = 10

const NESTED_ROW = "bg-secondary/50 hover:bg-secondary/50 dark:hover:bg-secondary/50"

function AffectedAssetRows({ error }: { error: ReplicationStateError }) {
  const [query, setQuery] = React.useState("")
  const [expanded, setExpanded] = React.useState(false)
  const subset = error.affectedAssetsSubset
  const total = affectedTotal(error)
  const matches = query ? subset.filter((a) => a.fullName.toLowerCase().includes(query.toLowerCase())) : subset
  const shown = expanded || query ? matches : matches.slice(0, ASSET_PREVIEW)
  const hidden = matches.length - shown.length

  return (
    <>
      {subset.length > ASSET_PREVIEW && (
        <TableRow className={NESTED_ROW}>
          <TableCell colSpan={2} className="pl-9">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter assets" className="bg-background pl-8" />
            </div>
          </TableCell>
        </TableRow>
      )}
      {shown.map((asset) => {
        const Icon = ASSET_ICON[asset.assetType]
        return (
          <TableRow key={asset.fullName} className={NESTED_ROW}>
            <TableCell colSpan={2} className="pl-9">
              <span className="flex min-w-0 items-center gap-2">
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-label={ASSET_LABEL[asset.assetType][0]} />
                <span className="min-w-0 truncate" title={asset.fullName}>{asset.fullName}</span>
              </span>
            </TableCell>
          </TableRow>
        )
      })}
      {shown.length === 0 && (
        <TableRow className={NESTED_ROW}>
          <TableCell colSpan={2} className="pl-9 text-muted-foreground">No matching assets</TableCell>
        </TableRow>
      )}
      {!query && (hidden > 0 || subset.length < total) && (
        <TableRow className={NESTED_ROW}>
          <TableCell colSpan={2} className="pl-9">
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">
                Showing {shown.length.toLocaleString()} of {total.toLocaleString()} assets
              </span>
              {hidden > 0 && (
                <Button variant="link" size="xs" className="h-auto p-0 text-sm" onClick={() => setExpanded(true)}>
                  Show {hidden.toLocaleString()} more
                </Button>
              )}
            </span>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

function ErrorRows({ error, defaultOpen = false }: { error: ReplicationStateError; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <TableCell className="whitespace-normal align-top">
          <button
            type="button"
            className="flex w-full items-start gap-2 text-left outline-none focus-visible:underline"
            aria-expanded={open}
            onClick={(e) => {
              e.stopPropagation()
              setOpen((v) => !v)
            }}
          >
            <ChevronRightIcon className={`mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
            <span className="min-w-0 leading-5 text-foreground">
              <ErrorMessage error={error} />
            </span>
          </button>
        </TableCell>
        <TableCell className="align-top text-right leading-5 text-muted-foreground tabular-nums">
          {affectedTotal(error).toLocaleString()}
        </TableCell>
      </TableRow>
      {open && <AffectedAssetRows error={error} />}
    </>
  )
}

function AssetList({ errors }: { errors: ReplicationStateError[] }) {
  const [query, setQuery] = React.useState("")
  const rows = React.useMemo(() => {
    const byName = new Map<string, { fullName: string; assetType: AssetType; errors: ReplicationStateError[] }>()
    for (const error of errors) {
      for (const asset of error.affectedAssetsSubset) {
        const row = byName.get(asset.fullName) ?? { ...asset, errors: [] }
        row.errors.push(error)
        byName.set(asset.fullName, row)
      }
    }
    return [...byName.values()].sort((a, b) => a.fullName.localeCompare(b.fullName))
  }, [errors])
  const shown = query ? rows.filter((r) => r.fullName.toLowerCase().includes(query.toLowerCase())) : rows
  const { totalAffectedAssets } = summarizeErrors(errors)

  return (
    <>
      {rows.length > ASSET_PREVIEW && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter assets" className="pl-8" />
        </div>
      )}
      <div className="rounded-md border border-border [&>[data-slot=table-container]]:overflow-visible">
        <Table className="table-fixed">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
              <TableHead className="w-[45%] rounded-tl-md bg-secondary">Asset</TableHead>
              <TableHead className="rounded-tr-md bg-secondary">Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((row) => {
              const Icon = ASSET_ICON[row.assetType]
              return (
                <TableRow key={row.fullName} className="hover:bg-transparent dark:hover:bg-transparent">
                  <TableCell className="align-top">
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon className="size-4 shrink-0 text-muted-foreground" aria-label={ASSET_LABEL[row.assetType][0]} />
                      <span className="min-w-0 truncate" title={row.fullName}>{row.fullName}</span>
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-normal align-top">
                    <span className="flex flex-col gap-1">
                      {row.errors.map((error) => (
                        <span key={errors.indexOf(error)}><ErrorMessage error={error} /></span>
                      ))}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
            {shown.length === 0 && (
              <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                <TableCell colSpan={2} className="text-muted-foreground">No matching assets</TableCell>
              </TableRow>
            )}
            {!query && rows.length < totalAffectedAssets && (
              <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                <TableCell colSpan={2} className="text-muted-foreground">
                  Showing {rows.length.toLocaleString()} of {totalAffectedAssets.toLocaleString()} assets
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export function ReplicationErrorsSheet({
  open,
  onOpenChange,
  errors,
  assetFilter,
  onClearFilter,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  errors: ReplicationStateError[]
  /** Narrows the list to the errors affecting one catalog or storage location. */
  assetFilter?: { name: string; indices: number[] } | null
  onClearFilter?: () => void
}) {
  const filtered = assetFilter ? assetFilter.indices.map((i) => errors[i]).filter(Boolean) : null
  // The API is paginated (next_page_token); the panel fetches every page and lists them all.
  const shown = filtered ?? errors
  const [view, setView] = React.useState<"errors" | "assets">("errors")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton={false} className="w-full gap-0 sm:max-w-[640px]">
        <SheetHeader className="gap-1 px-6 pt-6 pb-4">
          <span className="flex items-center gap-2">
            <SheetTitle className="text-lg leading-6">Replication errors</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Close" className="-mr-1 ml-auto">
                <CloseIcon className="size-4 text-muted-foreground" />
              </Button>
            </SheetClose>
          </span>
          <SheetDescription className="sr-only">Active replication errors for this failover group</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 pb-6">
          {errors.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-md border border-border px-6 py-12 text-center">
              <CheckCircleIcon className="size-6 text-[var(--success)]" />
              <p className="text-sm font-semibold text-foreground">No active errors</p>
              <p className="text-sm text-muted-foreground">Replication is running without errors.</p>
            </div>
          ) : (
            <>
              {filtered && assetFilter && (
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-foreground">
                  <span>
                    {plural(filtered.length, ["error", "errors"])} affecting{" "}
                    <code className="break-all font-mono text-[12px]">{assetFilter.name}</code>
                  </span>
                  <Button variant="link" size="xs" className="h-auto p-0 text-sm" onClick={onClearFilter}>
                    Show all {plural(errors.length, ["error", "errors"])}
                  </Button>
                </p>
              )}
              <Tabs value={view} onValueChange={(v) => setView(v as "errors" | "assets")}>
                <TabsList variant="line">
                  <TabsTrigger value="errors">Group by error</TabsTrigger>
                  <TabsTrigger value="assets">All assets</TabsTrigger>
                </TabsList>
              </Tabs>
              {view === "errors" ? (
                <div className="rounded-md border border-border [&>[data-slot=table-container]]:overflow-visible">
                  <Table className="table-fixed">
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                        <TableHead className="rounded-tl-md bg-secondary pl-9">Error</TableHead>
                        <TableHead className="w-32 rounded-tr-md bg-secondary text-right">Affected assets</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shown.map((error) => (
                        <ErrorRows
                          key={`${errors.indexOf(error)}-${assetFilter?.name ?? "all"}`}
                          error={error}
                          defaultOpen={filtered?.length === 1}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <AssetList errors={shown} />
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
