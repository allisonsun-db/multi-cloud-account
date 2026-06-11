"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, ArrowRight } from "lucide-react"
import { CheckCircleIcon, CopyIcon, LoadingIcon, TrashIcon, CatalogIcon } from "@/components/icons"
import { CLOUD_ICONS } from "@/components/ui/location-picker"
import {
  Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Select as SelectPrimitive } from "radix-ui"
import { CheckIcon } from "lucide-react"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"

const STORAGE_LOCATIONS = [
  "s3://omnimart-prod-primary/data",
  "s3://omnimart-prod-primary/logs",
  "s3://omnimart-analytics/warehouse",
  "s3://omnimart-ml-platform/artifacts",
  "abfss://prod@omnimartstorage.dfs.core.windows.net/data",
  "abfss://staging@omnimartstorage.dfs.core.windows.net/data",
  "gs://omnimart-gcp-prod/data",
  "gs://omnimart-gcp-dr/data",
]

const DR_STORAGE_LOCATIONS = [
  "s3://omnimart-prod-dr-west/data",
  "s3://omnimart-prod-dr-west/logs",
  "s3://omnimart-analytics-dr/warehouse",
  "s3://omnimart-ml-platform-dr/artifacts",
  "abfss://dr@omnimartstorage-dr.dfs.core.windows.net/data",
  "abfss://dr-staging@omnimartstorage-dr.dfs.core.windows.net/data",
  "gs://omnimart-gcp-dr-east/data",
  "gs://omnimart-gcp-dr-eu/data",
]

const STABLE_URLS = [
  { name: "Prod Analytics", url: "https://omnimart.databricks.com/?c=204bd90f-ebe0-49e6-ad49-994df412c126" },
  { name: "ML Platform", url: "https://omnimart.databricks.com/?c=a1b2c3d4-e5f6-4789-abcd-ef0123456789" },
  { name: "Data Eng Prod", url: "https://omnimart.databricks.com/?c=f7e6d5c4-b3a2-4190-8765-43210fedcba9" },
]

type StableUrl = (typeof STABLE_URLS)[number]

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function normalizeStorageLocation(location: string) {
  if (!location) return ""
  return location.replace(/\/\*$/, "")
}

function formatStorageLocation(location: string, includeWildcard: boolean) {
  const baseLocation = normalizeStorageLocation(location)
  return includeWildcard && baseLocation ? `${baseLocation}/*` : baseLocation
}

function CustomStorageLocationInput({
  value,
  includeWildcard,
  onChange,
}: {
  value: string
  includeWildcard: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="flex min-w-0">
      <Input
        value={normalizeStorageLocation(value)}
        onChange={(e) => onChange(normalizeStorageLocation(e.target.value))}
        placeholder="s3://bucket/path"
        className={includeWildcard ? "rounded-r-none border-r-0" : undefined}
      />
      {includeWildcard && (
        <span className="flex h-8 shrink-0 select-none items-center rounded-r border border-border bg-muted px-3 text-sm text-muted-foreground">
          {"/*"}
        </span>
      )}
    </div>
  )
}

const PREREQS = [
  {
    label: "Secondary metastore set up",
    description: "A metastore in the secondary region.",
  },
  {
    label: "Secondary workspace set up",
    description: "A workspace in the secondary region with the secondary metastore assigned.",
  },
  {
    label: "Users provisioned",
    description: "Users and service principals have been provisioned in the secondary workspace.",
  },
  {
    label: "Storage locations in secondary region",
    description: "Storage buckets for the metastore and any external locations for the secondary region.",
  },
]

export default function CreateReplicationPlanPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string

  const [prereqOpen, setPrereqOpen] = React.useState(true)
  const [planName, setPlanName] = React.useState("")
  const [selectedCatalogs, setSelectedCatalogs] = React.useState<Record<string, boolean>>({})
  const [replicateWorkspaceAssets, setReplicateWorkspaceAssets] = React.useState(false)
  const [primaryWorkspace, setPrimaryWorkspace] = React.useState("")
  const [drWorkspace, setDrWorkspace] = React.useState("")
  const [stableUrls, setStableUrls] = React.useState<StableUrl[]>(STABLE_URLS)
  const [stableUrl, setStableUrl] = React.useState("")
  const [stableUrlDialogOpen, setStableUrlDialogOpen] = React.useState(false)
  const [stableUrlStep, setStableUrlStep] = React.useState<"form" | "loading" | "success">("form")
  const [stableUrlName, setStableUrlName] = React.useState("")
  const [stableUrlPrimaryWorkspace, setStableUrlPrimaryWorkspace] = React.useState("")
  const [generatedStableUrl, setGeneratedStableUrl] = React.useState("")
  const [locationMappings, setLocationMappings] = React.useState([{
    source: "",
    sourceCustom: false,
    destination: "",
    destinationCustom: false,
    wildcard: false,
  }])
  const [validationOpen, setValidationOpen] = React.useState(false)
  const [reviewLoading, setReviewLoading] = React.useState(false)

  const CATALOGS = ["main", "prod_catalog", "analytics", "ml_catalog"]

  const WORKSPACES = [
    { value: "ws-prod-east",       label: "ws-prod-east",       cloud: "AWS",   region: "us-east-1" },
    { value: "ws-prod-west",       label: "ws-prod-west",       cloud: "AWS",   region: "us-west-2" },
    { value: "ws-prod-dr-west",    label: "ws-prod-dr-west",    cloud: "AWS",   region: "us-west-2" },
    { value: "ws-prod-dr-eu",      label: "ws-prod-dr-eu",      cloud: "AWS",   region: "eu-west-1" },
    { value: "ws-staging-primary", label: "ws-staging-primary", cloud: "Azure", region: "eastus" },
    { value: "ws-staging-dr",      label: "ws-staging-dr",      cloud: "Azure", region: "westus2" },
    { value: "ws-analytics-eu",    label: "ws-analytics-eu",    cloud: "Azure", region: "westeurope" },
    { value: "ws-analytics-dr",    label: "ws-analytics-dr",    cloud: "Azure", region: "northeurope" },
    { value: "ws-data-eng",        label: "ws-data-eng",        cloud: "GCP",   region: "us-central1" },
    { value: "ws-data-eng-dr",     label: "ws-data-eng-dr",     cloud: "GCP",   region: "us-west1" },
    { value: "ws-ml-platform",     label: "ws-ml-platform",     cloud: "GCP",   region: "us-east1" },
    { value: "ws-ml-dr",           label: "ws-ml-dr",           cloud: "GCP",   region: "europe-west1" },
  ]

  const selectedPrimary = WORKSPACES.find((w) => w.value === primaryWorkspace)
  const selectedDR = WORKSPACES.find((w) => w.value === drWorkspace)
  const selectedStableUrl = stableUrls.find((u) => u.url === stableUrl)
  const sameWorkspaceError = primaryWorkspace && drWorkspace && primaryWorkspace === drWorkspace
  const hasSelectedCatalogs = Object.values(selectedCatalogs).some(Boolean)
  const hasCompleteStorageMappings = locationMappings.every((mapping) => mapping.source && mapping.destination)
  const canReview = Boolean(
    planName.trim() &&
    primaryWorkspace &&
    drWorkspace &&
    !sameWorkspaceError,
  )
  const reviewPassed = hasSelectedCatalogs && hasCompleteStorageMappings

  React.useEffect(() => {
    if (!validationOpen) return

    setReviewLoading(true)
    const timer = window.setTimeout(() => setReviewLoading(false), 3000)

    return () => window.clearTimeout(timer)
  }, [validationOpen])

  function addMapping() {
    setLocationMappings((prev) => [...prev, {
      source: "",
      sourceCustom: false,
      destination: "",
      destinationCustom: false,
      wildcard: false,
    }])
  }

  function removeMapping(index: number) {
    setLocationMappings((prev) => prev.filter((_, i) => i !== index))
  }

  function updateMapping(index: number, field: "source" | "destination", value: string) {
    setLocationMappings((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function toggleMappingWildcard(index: number) {
    setLocationMappings((prev) => prev.map((m, i) => i === index ? { ...m, wildcard: !m.wildcard } : m))
  }

  function setCustomMode(index: number, field: "sourceCustom" | "destinationCustom", value: boolean) {
    setLocationMappings((prev) => prev.map((m, i) => (
      i === index
        ? { ...m, [field]: value, [field === "sourceCustom" ? "source" : "destination"]: "" }
        : m
    )))
  }

  function resetStableUrlDialog() {
    setStableUrlStep("form")
    setStableUrlName("")
    setStableUrlPrimaryWorkspace("")
    setGeneratedStableUrl("")
  }

  function handleCreateStableUrl() {
    const newUrl = `https://omnimart.databricks.com/?c=${uuid()}`
    setGeneratedStableUrl(newUrl)
    setStableUrlStep("loading")
    window.setTimeout(() => {
      const created = { name: stableUrlName, url: newUrl }
      setStableUrls((prev) => [created, ...prev])
      setStableUrl(newUrl)
      setStableUrlStep("success")
    }, 1200)
  }

  return (
    <AppShell activeItem="resilience">
      <div className="flex flex-col gap-4 p-6 max-w-[800px] w-full mx-auto">

        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/resilience">Resilience</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create failover group</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          title="Create failover group"
        />

        {/* Prerequisites modal */}
        <Dialog open={prereqOpen} onOpenChange={setPrereqOpen}>
          <DialogContent className="max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Before you begin</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-accent-foreground mb-4">Make sure the following are in place before creating a failover group.</p>
              <div className="flex flex-col gap-0">
                {PREREQS.map((prereq, i) => (
                  <div key={prereq.label} className="flex items-start gap-3 py-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-grey-100 text-muted-foreground mt-0.5 text-xs font-semibold">
                      {i + 1}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{prereq.label}</span>
                      <span className="text-sm text-muted-foreground">{prereq.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => router.push(`/workspaces/${workspaceId}`)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setPrereqOpen(false)}>
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Form */}
        <div className="flex flex-col gap-6">

          <div className="rounded-md border border-border flex flex-col">
            <div className="px-4 py-2.5 border-b border-border bg-secondary rounded-t-md">
              <p className="text-sm font-semibold">Details</p>
            </div>
            <div className="flex flex-col gap-4 px-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-name">Failover group name</Label>
                <Input
                  id="plan-name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="my-failover-group"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="primary-workspace">Primary workspace</Label>
                  <Select value={primaryWorkspace} onValueChange={setPrimaryWorkspace}>
                    <SelectTrigger id="primary-workspace" className="w-full">
                      <span className="sr-only"><SelectValue /></span>
                      {selectedPrimary ? (
                        <span className="flex items-center gap-2">
                          {CLOUD_ICONS[selectedPrimary.cloud]}
                          <span>{selectedPrimary.label} <span className="text-muted-foreground">({selectedPrimary.region})</span></span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select workspace</span>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {WORKSPACES.map((ws) => (
                        <SelectPrimitive.Item
                          key={ws.value}
                          value={ws.value}
                          className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default flex-col items-start rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                          <span className="absolute right-2 top-2 flex size-3.5 items-center justify-center">
                            <SelectPrimitive.ItemIndicator>
                              <CheckIcon className="size-4" />
                            </SelectPrimitive.ItemIndicator>
                          </span>
                          <SelectPrimitive.ItemText>
                            <span className="flex items-center gap-2">
                              {CLOUD_ICONS[ws.cloud]}
                              <span>{ws.label}</span>
                            </span>
                          </SelectPrimitive.ItemText>
                          <span className="text-xs text-muted-foreground pl-6">{ws.region}</span>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dr-workspace">Secondary workspace</Label>
                  <Select value={drWorkspace} onValueChange={setDrWorkspace}>
                    <SelectTrigger id="dr-workspace" className="w-full">
                      <span className="sr-only"><SelectValue /></span>
                      {selectedDR ? (
                        <span className="flex items-center gap-2">
                          {CLOUD_ICONS[selectedDR.cloud]}
                          <span>{selectedDR.label} <span className="text-muted-foreground">({selectedDR.region})</span></span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select workspace</span>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {WORKSPACES.map((ws) => (
                        <SelectPrimitive.Item
                          key={ws.value}
                          value={ws.value}
                          className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default flex-col items-start rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                          <span className="absolute right-2 top-2 flex size-3.5 items-center justify-center">
                            <SelectPrimitive.ItemIndicator>
                              <CheckIcon className="size-4" />
                            </SelectPrimitive.ItemIndicator>
                          </span>
                          <SelectPrimitive.ItemText>
                            <span className="flex items-center gap-2">
                              {CLOUD_ICONS[ws.cloud]}
                              <span>{ws.label}</span>
                            </span>
                          </SelectPrimitive.ItemText>
                          <span className="text-xs text-muted-foreground pl-6">{ws.region}</span>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {sameWorkspaceError && (
                <p className="text-sm text-destructive">Primary and secondary workspaces cannot be the same.</p>
              )}
              <div className="flex flex-col gap-4">
                <Label htmlFor="stable-url">Stable URL <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Select
                  value={stableUrl}
                  onValueChange={(value) => {
                    if (value === "__create__") {
                      setStableUrlPrimaryWorkspace(primaryWorkspace)
                      setStableUrlDialogOpen(true)
                      return
                    }
                    setStableUrl(value)
                  }}
                >
                  <SelectTrigger id="stable-url" className="w-full">
                    <span className="sr-only"><SelectValue /></span>
                    {selectedStableUrl ? (
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0">{selectedStableUrl.name}</span>
                        <span className="truncate text-muted-foreground">({selectedStableUrl.url})</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Select stable URL</span>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__create__" className="text-primary">
                      Create stable URL
                    </SelectItem>
                    <SelectSeparator className="mx-2" />
                    {stableUrls.map((entry) => (
                      <SelectItem key={entry.url} value={entry.url}>
                        <span className="flex min-w-0 flex-col">
                          <span>{entry.name}</span>
                          <span className="truncate text-xs text-muted-foreground">{entry.url}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border flex flex-col">
            <div className="px-4 py-2.5 border-b border-border bg-secondary rounded-t-md">
              <p className="text-sm font-semibold">Replication scope</p>
            </div>

            {!primaryWorkspace ? (
              <div className="px-4 py-4">
                <p className="text-sm text-muted-foreground">Select a primary workspace first.</p>
              </div>
            ) : (
              <>
                {/* Data */}
                <div className="flex flex-col gap-3 px-4 pt-4 pb-0">
                  <div>
                    <p className="text-sm font-semibold">Data</p>
                    <p className="text-sm text-muted-foreground">Select catalogs from the primary workspace to replicate.</p>
                  </div>
                  {primaryWorkspace && (
                    <div className="rounded-md border border-border flex flex-col">
                      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border sticky top-0 bg-background z-10">
                        <Checkbox
                          id="catalog-all"
                          checked={CATALOGS.every((c) => !!selectedCatalogs[c])}
                          onCheckedChange={(value) =>
                            setSelectedCatalogs(Object.fromEntries(CATALOGS.map((c) => [c, !!value])))
                          }
                        />
                        <Label htmlFor="catalog-all" className="font-normal">All catalogs</Label>
                      </div>
                      <div className="max-h-[220px] overflow-y-auto">
                      {CATALOGS.map((catalog) => (
                        <div key={catalog} className="flex items-center gap-2 px-3 py-2">
                          <Checkbox
                            id={`catalog-${catalog}`}
                            checked={!!selectedCatalogs[catalog]}
                            onCheckedChange={(value) =>
                              setSelectedCatalogs((prev) => ({ ...prev, [catalog]: !!value }))
                            }
                          />
                          <Label htmlFor={`catalog-${catalog}`} className="font-normal flex items-center gap-1.5">
                            <CatalogIcon className="h-4 w-4 text-muted-foreground" />
                            {catalog}
                          </Label>
                        </div>
                      ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Workspace assets */}
                <div className="flex flex-col gap-1 px-4 pt-4 pb-4">
                  <p className="text-sm font-semibold">Workspace assets</p>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={replicateWorkspaceAssets}
                      onCheckedChange={setReplicateWorkspaceAssets}
                    />
                    <p className="text-sm text-accent-foreground">
                      Replicate notebooks, jobs, dashboards, queries, clusters, SQL warehouses folders and files.{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Learn more
                      </Link>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="rounded-md border border-border flex flex-col">
            <div className="px-4 py-2.5 border-b border-border bg-secondary rounded-t-md">
              <p className="text-sm font-semibold">Storage mappings</p>
            </div>
            {hasSelectedCatalogs && (
              <div className="px-4 pt-4">
                <p className="text-sm text-accent-foreground">Map each primary storage location to its corresponding secondary location. Databricks will replicate data to the secondary location during failover.</p>
              </div>
            )}
            {!hasSelectedCatalogs ? (
              <div className="px-4 py-4">
                <p className="text-sm text-muted-foreground">Select catalogs to replicate first.</p>
              </div>
            ) : (
            <div className="flex flex-col gap-3 px-4 py-4">
              <div className="flex flex-col gap-6">
                {locationMappings.map((mapping, i) => (
                  <div key={i} className="flex min-w-0 flex-col gap-2">
                    <div className="flex min-w-0 items-end gap-2">
                      <div className="flex w-6 shrink-0 flex-col gap-2">
                        {i === 0 && <span className="invisible text-sm font-semibold" aria-hidden="true">#</span>}
                        <span className="flex h-8 items-center justify-center text-sm font-semibold text-muted-foreground" aria-label={`Mapping ${i + 1}`}>
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        {i === 0 && <span className="text-sm font-semibold text-foreground">Primary storage location</span>}
                        {mapping.sourceCustom ? (
                          <div className="flex gap-1">
                            <CustomStorageLocationInput
                              value={mapping.source}
                              includeWildcard={mapping.wildcard}
                              onChange={(value) => updateMapping(i, "source", value)}
                            />
                            <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground" onClick={() => setCustomMode(i, "sourceCustom", false)}>
                              Use list
                            </Button>
                          </div>
                        ) : (
                          <Select value={mapping.source} onValueChange={(v) => {
                            if (v === "__custom__") { setCustomMode(i, "sourceCustom", true) } else { updateMapping(i, "source", v) }
                          }}>
                            <SelectTrigger className="w-full min-w-0">
                              <span className="sr-only"><SelectValue /></span>
                              {mapping.source ? <span className="truncate">{formatStorageLocation(mapping.source, mapping.wildcard)}</span> : <span className="text-muted-foreground">Select location</span>}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__custom__" className="text-primary">Enter custom location…</SelectItem>
                              {STORAGE_LOCATIONS.map((loc) => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground mb-2" />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        {i === 0 && <span className="text-sm font-semibold text-foreground">Secondary storage location</span>}
                        {mapping.destinationCustom ? (
                          <div className="flex gap-1">
                            <CustomStorageLocationInput
                              value={mapping.destination}
                              includeWildcard={mapping.wildcard}
                              onChange={(value) => updateMapping(i, "destination", value)}
                            />
                            <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground" onClick={() => setCustomMode(i, "destinationCustom", false)}>
                              Use list
                            </Button>
                          </div>
                        ) : (
                          <Select value={mapping.destination} onValueChange={(v) => {
                            if (v === "__custom__") { setCustomMode(i, "destinationCustom", true) } else { updateMapping(i, "destination", v) }
                          }}>
                            <SelectTrigger className="w-full min-w-0">
                              <span className="sr-only"><SelectValue /></span>
                              {mapping.destination ? <span className="truncate">{formatStorageLocation(mapping.destination, mapping.wildcard)}</span> : <span className="text-muted-foreground">Select location</span>}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__custom__" className="text-primary">Enter custom location…</SelectItem>
                              {DR_STORAGE_LOCATIONS.map((loc) => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      {locationMappings.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="mb-0.5 shrink-0"
                          onClick={() => removeMapping(i)}
                        >
                          <TrashIcon className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                    <div className="ml-8 flex items-center gap-2">
                      <Checkbox
                        id={`mapping-${i}-wildcard`}
                        checked={mapping.wildcard}
                        onCheckedChange={() => toggleMappingWildcard(i)}
                      />
                      <Label htmlFor={`mapping-${i}-wildcard`} className="font-normal">
                        Include subdirectories
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ml-8">
                <Button variant="outline" size="sm" onClick={addMapping}>
                  <Plus className="h-4 w-4" />
                  Add mapping
                </Button>
              </div>
            </div>
            )}
          </div>


        </div>

        <Dialog open={stableUrlDialogOpen} onOpenChange={(open) => {
          setStableUrlDialogOpen(open)
          if (!open) resetStableUrlDialog()
        }}>
          <DialogContent className="sm:max-w-[480px]">
            {stableUrlStep === "form" && (<>
              <DialogHeader className="px-6 pt-4 pb-0">
                <DialogTitle className="text-[22px] font-semibold leading-7">Create stable URL</DialogTitle>
              </DialogHeader>
              <DialogBody className="px-6 pt-4 pb-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="stable-url-name">Name</Label>
                  <Input
                    id="stable-url-name"
                    value={stableUrlName}
                    onChange={(e) => setStableUrlName(e.target.value)}
                    placeholder="e.g. Prod Analytics"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="stable-url-primary-workspace">Primary workspace</Label>
                  <Select value={stableUrlPrimaryWorkspace} onValueChange={setStableUrlPrimaryWorkspace}>
                    <SelectTrigger id="stable-url-primary-workspace" className="w-full">
                      <SelectValue placeholder="Select primary workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKSPACES.map((ws) => (
                        <SelectItem key={ws.value} value={ws.value}>
                          <span className="flex items-center gap-2">
                            {CLOUD_ICONS[ws.cloud]}
                            {ws.label}
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
                  onClick={handleCreateStableUrl}
                  disabled={!stableUrlName.trim() || !stableUrlPrimaryWorkspace}
                >
                  Create
                </Button>
              </DialogFooter>
            </>)}

            {stableUrlStep === "loading" && (
              <DialogBody className="px-6 py-16 flex flex-col items-center justify-center gap-3">
                <LoadingIcon size={24} className="animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Generating stable URL...</span>
              </DialogBody>
            )}

            {stableUrlStep === "success" && (<>
              <DialogHeader className="px-6 pt-4 pb-0">
                <DialogTitle className="flex items-center gap-2 text-[22px] font-semibold leading-7">
                  <CheckCircleIcon size={22} className="text-[var(--success)] shrink-0" />
                  Stable URL created
                </DialogTitle>
              </DialogHeader>
              <DialogBody className="px-6 pt-4 pb-4 flex flex-col gap-3 min-w-0 overflow-hidden">
                <p className="text-sm text-muted-foreground">
                  Your stable URL for <span className="font-semibold text-foreground">{stableUrlName}</span> is ready.
                </p>
                <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-2 overflow-hidden">
                  <span className="flex-1 truncate text-sm text-foreground min-w-0">{generatedStableUrl}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(generatedStableUrl)}
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

        <Dialog open={validationOpen} onOpenChange={setValidationOpen}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Review failover group</DialogTitle>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-4">
              <p className="text-sm text-accent-foreground">
                Databricks will check that the selected workspaces are compatible before creating this failover group.
              </p>
              {reviewLoading ? (
                <div className="flex items-start gap-3 rounded border border-border px-3 py-3">
                  <LoadingIcon className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">Reviewing failover group</span>
                    <span className="text-sm text-accent-foreground">
                      This usually takes a few seconds.
                    </span>
                  </div>
                </div>
              ) : reviewPassed ? (
                <div className="flex items-start gap-3 rounded border border-[var(--border-success)] bg-[var(--background-success)] px-3 py-3">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                  <span className="text-sm font-semibold text-accent-foreground">This failover group is ready to create.</span>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded border border-[var(--border-danger)] bg-[var(--background-danger)] px-3 py-3">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 rotate-45 text-destructive" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">This failover group is not ready to create</span>
                    <span className="text-sm text-accent-foreground">
                      Select at least one catalog and complete every storage mapping before creating the failover group.
                    </span>
                  </div>
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setValidationOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={reviewLoading || !reviewPassed}
                onClick={() => router.push(`/workspaces/${workspaceId}/replication-plan/plan-1`)}
              >
                Create failover group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="sticky bottom-0 bg-background flex items-center justify-end gap-2 px-4 py-4">
          <Button variant="outline" size="sm" onClick={() => router.push(`/workspaces/${workspaceId}`)}>
            Cancel
          </Button>
          <Button size="sm" disabled={!canReview} onClick={() => setValidationOpen(true)}>
            Review
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
