"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, ArrowRight } from "lucide-react"
import { TrashIcon, CatalogIcon } from "@/components/icons"
import { CLOUD_ICONS } from "@/components/ui/location-picker"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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
  const [selectedCatalogs, setSelectedCatalogs] = React.useState<Record<string, boolean>>({})
  const [replicateWorkspaceAssets, setReplicateWorkspaceAssets] = React.useState(false)
  const [primaryWorkspace, setPrimaryWorkspace] = React.useState("")
  const [drWorkspace, setDrWorkspace] = React.useState("")
  const [locationMappings, setLocationMappings] = React.useState([{ source: "", destination: "", sourceCustom: false, destCustom: false }])

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
  const sameWorkspaceError = primaryWorkspace && drWorkspace && primaryWorkspace === drWorkspace

  function addMapping() {
    setLocationMappings((prev) => [...prev, { source: "", destination: "", sourceCustom: false, destCustom: false }])
  }

  function removeMapping(index: number) {
    setLocationMappings((prev) => prev.filter((_, i) => i !== index))
  }

  function updateMapping(index: number, field: "source" | "destination", value: string) {
    setLocationMappings((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function setCustomMode(index: number, field: "sourceCustom" | "destCustom", value: boolean) {
    setLocationMappings((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value, [field === "sourceCustom" ? "source" : "destination"]: "" } : m))
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
                <Input id="plan-name" placeholder="my-failover-group" />
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="stable-url">Stable URL <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input id="stable-url" placeholder="https://omnimart.databricks.com/?c=…" />
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
                <div className="flex flex-col gap-3 px-4 py-4">
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

                <div className="border-t border-border mx-4" />

                {/* Workspace assets */}
                <div className="flex flex-col gap-1 px-4 py-4">
                  <p className="text-sm font-semibold">Workspace assets</p>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={replicateWorkspaceAssets}
                      onCheckedChange={setReplicateWorkspaceAssets}
                    />
                    <p className="text-sm text-accent-foreground">Replicate notebooks, jobs, dashboards, queries, clusters, SQL warehouses folders and files.</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="rounded-md border border-border flex flex-col">
            <div className="px-4 py-2.5 border-b border-border bg-secondary rounded-t-md">
              <p className="text-sm font-semibold">Storage mappings</p>
            </div>
            {Object.values(selectedCatalogs).some(Boolean) && (
              <div className="px-4 pt-4">
                <p className="text-sm text-accent-foreground">Map each primary storage location to its corresponding secondary location. Databricks will replicate data to the secondary location during failover.</p>
              </div>
            )}
            {!Object.values(selectedCatalogs).some(Boolean) ? (
              <div className="px-4 py-4">
                <p className="text-sm text-muted-foreground">Select catalogs to replicate first.</p>
              </div>
            ) : (
            <div className="flex flex-col gap-3 px-4 py-4">
              <div className="flex flex-col gap-2">
                {locationMappings.map((mapping, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex flex-col gap-2 flex-1">
                      {i === 0 && <span className="text-sm font-semibold text-foreground">Primary storage location</span>}
                      {mapping.sourceCustom ? (
                        <div className="flex gap-1">
                          <Input
                            autoFocus
                            placeholder="s3://my-bucket/path"
                            value={mapping.source}
                            onChange={(e) => updateMapping(i, "source", e.target.value)}
                          />
                          <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground" onClick={() => setCustomMode(i, "sourceCustom", false)}>
                            ← Back
                          </Button>
                        </div>
                      ) : (
                        <Select value={mapping.source} onValueChange={(v) => {
                          if (v === "__custom__") { setCustomMode(i, "sourceCustom", true) } else { updateMapping(i, "source", v) }
                        }}>
                          <SelectTrigger className="w-full">
                            <span className="sr-only"><SelectValue /></span>
                            {mapping.source ? <span className="truncate">{mapping.source}</span> : <span className="text-muted-foreground">Select location</span>}
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
                    <ArrowRight className="h-4 w-4 text-muted-foreground mb-2" />
                    <div className="flex flex-col gap-2 flex-1">
                      {i === 0 && <span className="text-sm font-semibold text-foreground">Secondary storage location</span>}
                      {mapping.destCustom ? (
                        <div className="flex gap-1">
                          <Input
                            autoFocus
                            placeholder="s3://my-dr-bucket/path"
                            value={mapping.destination}
                            onChange={(e) => updateMapping(i, "destination", e.target.value)}
                          />
                          <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground" onClick={() => setCustomMode(i, "destCustom", false)}>
                            ← Back
                          </Button>
                        </div>
                      ) : (
                        <Select value={mapping.destination} onValueChange={(v) => {
                          if (v === "__custom__") { setCustomMode(i, "destCustom", true) } else { updateMapping(i, "destination", v) }
                        }}>
                          <SelectTrigger className="w-full">
                            <span className="sr-only"><SelectValue /></span>
                            {mapping.destination ? <span className="truncate">{mapping.destination}</span> : <span className="text-muted-foreground">Select location</span>}
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
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="mb-0.5"
                      onClick={() => removeMapping(i)}
                      disabled={locationMappings.length === 1}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={addMapping}>
                  <Plus className="h-4 w-4" />
                  Add mapping
                </Button>
              </div>
            </div>
            )}
          </div>


        </div>

        <div className="sticky bottom-0 bg-background flex items-center justify-end gap-2 px-4 py-4">
          <Button variant="outline" size="sm" onClick={() => router.push(`/workspaces/${workspaceId}`)}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => router.push(`/workspaces/${workspaceId}/replication-plan/plan-1`)}>
            Create failover group
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
