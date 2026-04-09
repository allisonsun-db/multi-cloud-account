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
import { TrashIcon } from "@/components/icons"
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

const PREREQS = [
  {
    label: "Secondary workspace set up",
    description: "A Databricks workspace exists in your target region and cloud.",
  },
  {
    label: "Secondary metastore set up",
    description: "A Unity Catalog metastore is attached to the secondary workspace.",
  },
  {
    label: "Users provisioned",
    description: "Users and service principals have been provisioned in the secondary workspace.",
  },
  {
    label: "Object storage buckets in secondary region",
    description: "Storage buckets for the metastore root and any external locations are created in the secondary region.",
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
  const [locationMappings, setLocationMappings] = React.useState([{ source: "", destination: "" }])

  const CATALOGS = ["main", "prod_catalog", "analytics", "ml_catalog"]

  const WORKSPACES = [
    { value: "ws-prod-east",       label: "ws-prod-east",       cloud: "AWS",   region: "us-east-1" },
    { value: "ws-prod-west",       label: "ws-prod-west",       cloud: "AWS",   region: "us-west-2" },
    { value: "ws-staging-primary", label: "ws-staging-primary", cloud: "Azure", region: "eastus" },
    { value: "ws-analytics-eu",    label: "ws-analytics-eu",    cloud: "Azure", region: "westeurope" },
    { value: "ws-data-eng",        label: "ws-data-eng",        cloud: "GCP",   region: "us-central1" },
    { value: "ws-ml-platform",     label: "ws-ml-platform",     cloud: "GCP",   region: "us-east1" },
  ]

  const DR_WORKSPACES = [
    { value: "ws-prod-dr-west",    label: "ws-prod-dr-west",    cloud: "AWS",   region: "us-west-2" },
    { value: "ws-prod-dr-eu",      label: "ws-prod-dr-eu",      cloud: "AWS",   region: "eu-west-1" },
    { value: "ws-staging-dr",      label: "ws-staging-dr",      cloud: "Azure", region: "westus2" },
    { value: "ws-analytics-dr",    label: "ws-analytics-dr",    cloud: "Azure", region: "northeurope" },
    { value: "ws-data-eng-dr",     label: "ws-data-eng-dr",     cloud: "GCP",   region: "us-west1" },
    { value: "ws-ml-dr",           label: "ws-ml-dr",           cloud: "GCP",   region: "europe-west1" },
  ]

  const selectedPrimary = WORKSPACES.find((w) => w.value === primaryWorkspace)
  const selectedDR = DR_WORKSPACES.find((w) => w.value === drWorkspace)

  function addMapping() {
    setLocationMappings((prev) => [...prev, { source: "", destination: "" }])
  }

  function removeMapping(index: number) {
    setLocationMappings((prev) => prev.filter((_, i) => i !== index))
  }

  function updateMapping(index: number, field: "source" | "destination", value: string) {
    setLocationMappings((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  return (
    <AppShell activeItem="workspaces">
      <div className="flex flex-col gap-4 p-6 max-w-[800px] w-full mx-auto">

        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/workspaces">Workspaces</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create replication plan</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          title="Create replication plan"
        />

        {/* Prerequisites modal */}
        <Dialog open={prereqOpen} onOpenChange={setPrereqOpen}>
          <DialogContent className="max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Before you begin</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-muted-foreground mb-4">Make sure the following are in place before creating a replication plan.</p>
              <div className="flex flex-col gap-0">
                {PREREQS.map((prereq, i) => (
                  <div key={prereq.label} className="flex items-start gap-3 py-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground mt-0.5 text-xs font-semibold">
                      {i + 1}
                    </div>
                    <div className="flex flex-col gap-2">
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
              <p className="text-sm font-semibold">Basics</p>
            </div>
            <div className="flex flex-col gap-4 px-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-name">Plan name</Label>
                <Input id="plan-name" placeholder="my-replication-plan" />
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
                  <Label htmlFor="dr-workspace">Replica workspace</Label>
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
                      {DR_WORKSPACES.map((ws) => (
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
            </div>
          </div>

          <div className="rounded-md border border-border flex flex-col">
            <div className="px-4 py-2.5 border-b border-border bg-secondary rounded-t-md">
              <p className="text-sm font-semibold">Select what to replicate</p>
            </div>

            {/* Data */}
            <div className="flex flex-col gap-3 px-4 py-4 border-b border-border">
              <div>
                <p className="text-sm font-semibold">Data</p>
                <p className="text-sm text-muted-foreground">Select catalogs from the primary workspace to replicate.</p>
              </div>
              <div className="flex flex-col gap-2">
                {CATALOGS.map((catalog) => (
                  <div key={catalog} className="flex items-center gap-2">
                    <Checkbox
                      id={`catalog-${catalog}`}
                      checked={!!selectedCatalogs[catalog]}
                      onCheckedChange={(value) =>
                        setSelectedCatalogs((prev) => ({ ...prev, [catalog]: !!value }))
                      }
                    />
                    <Label htmlFor={`catalog-${catalog}`} className="font-normal">{catalog}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Workspace assets */}
            <div className="flex flex-col gap-1 px-4 py-4">
              <p className="text-sm font-semibold">Workspace assets</p>
              <div className="flex items-center gap-2">
                <Switch
                  checked={replicateWorkspaceAssets}
                  onCheckedChange={setReplicateWorkspaceAssets}
                />
                <p className="text-sm text-muted-foreground">Replicate all notebooks, jobs, and dashboards.</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border flex flex-col">
            <div className="px-4 py-2.5 border-b border-border bg-secondary rounded-t-md">
              <p className="text-sm font-semibold">Map storage locations</p>
            </div>
            <div className="flex flex-col gap-3 px-4 py-4">
              <p className="text-sm text-muted-foreground">Map source storage paths to their destination paths in the DR region.</p>
              <div className="flex flex-col gap-2">
                {locationMappings.map((mapping, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex flex-col gap-2 flex-1">
                      {i === 0 && <span className="text-sm font-semibold text-foreground">Source</span>}
                      <Input
                        placeholder="s3://primary-bucket/path"
                        value={mapping.source}
                        onChange={(e) => updateMapping(i, "source", e.target.value)}
                      />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground mb-2" />
                    <div className="flex flex-col gap-2 flex-1">
                      {i === 0 && <span className="text-sm font-semibold text-foreground">Destination</span>}
                      <Input
                        placeholder="s3://dr-bucket/path"
                        value={mapping.destination}
                        onChange={(e) => updateMapping(i, "destination", e.target.value)}
                      />
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
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/workspaces/${workspaceId}`)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => router.push(`/workspaces/${workspaceId}`)}>
              Create plan
            </Button>
          </div>

        </div>
      </div>
    </AppShell>
  )
}
