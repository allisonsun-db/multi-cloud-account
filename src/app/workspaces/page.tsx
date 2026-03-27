"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { CheckCircleIcon } from "@/components/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ExternalLink, Search } from "lucide-react"
import { LocationPicker, buildCloudRegions, CLOUD_ICONS } from "@/components/ui/location-picker"
import { cn } from "@/lib/utils"

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
  { id: "1",  name: "prod-us-west",           status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",         storage: "Default",   credentialName: "Serverless",        created: "yesterday at ...",  metastore: "prod-metastore" },
  { id: "2",  name: "prod-us-east",           status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",         storage: "Serverless", credentialName: "prod-storage-cred", created: "yesterday at ...",  metastore: "prod-metastore" },
  { id: "3",  name: "staging-us-west",        status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",         storage: "Default",   credentialName: "Serverless",        created: "yesterday at ...",  metastore: "staging-metast..." },
  { id: "4",  name: "staging-us-east",        status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "eastus",            storage: "Default",   credentialName: "Serverless",        created: "last Tuesday ...",  metastore: "staging-metast..." },
  { id: "5",  name: "data-eng-prod",          status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "eastus2",           storage: "Default",   credentialName: "Serverless",        created: "last Tuesday ...",  metastore: "prod-metastore" },
  { id: "6",  name: "ml-platform-prod",       status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "us-central1",       storage: "Default",   credentialName: "Serverless",        created: "last Tuesday ...",  metastore: "prod-metastore" },
  { id: "7",  name: "analytics-prod",         status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",         storage: "Default",   credentialName: "Serverless",        created: "last Monday ...",   metastore: null },
  { id: "8",  name: "analytics-staging",      status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "westeurope",        storage: "Default",   credentialName: "Serverless",        created: "last Monday ...",   metastore: "staging-metast..." },
  { id: "9",  name: "finance-reporting",      status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "europe-west1",      storage: "Default",   credentialName: "Serverless",        created: "last Friday at...", metastore: "prod-metastore" },
  { id: "10", name: "risk-modeling",          status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",         storage: "Default",   credentialName: "Serverless",        created: "last Friday at...", metastore: "prod-metastore" },
  { id: "11", name: "marketing-analytics",    status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "eastus",            storage: "Default",   credentialName: "Serverless",        created: "03/19/2026",        metastore: "prod-metastore" },
  { id: "12", name: "customer-data-platform", status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",         storage: "Default",   credentialName: "Serverless",        created: "03/19/2026",        metastore: "prod-metastore" },
  { id: "13", name: "security-audit",         status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "us-west1",          storage: "Default",   credentialName: "Serverless",        created: "03/18/2026",        metastore: "prod-metastore" },
  { id: "14", name: "data-science-sandbox",   status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",         storage: "Default",   credentialName: "Serverless",        created: "03/18/2026",        metastore: "dev-metastore" },
  { id: "15", name: "platform-dev",           status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "westus2",           storage: "Default",   credentialName: "Serverless",        created: "03/18/2026",        metastore: "dev-metastore" },
  { id: "16", name: "etl-orchestration",      status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "us-east1",          storage: "Default",   credentialName: "Serverless",        created: "03/18/2026",        metastore: "prod-metastore" },
  { id: "17", name: "realtime-streaming",     status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-west-2",         storage: "Default",   credentialName: "Serverless",        created: "03/17/2026",        metastore: "prod-metastore" },
  { id: "18", name: "supply-chain-analytics", status: "Running", cloud: "Azure", pricingTier: "Enterprise", region: "northeurope",       storage: "Default",   credentialName: "Serverless",        created: "03/17/2026",        metastore: "prod-metastore" },
  { id: "19", name: "feature-store-prod",     status: "Running", cloud: "GCP",   pricingTier: "Enterprise", region: "asia-east1",        storage: "Default",   credentialName: "Serverless",        created: "03/16/2026",        metastore: "prod-metastore" },
  { id: "20", name: "model-serving-prod",     status: "Running", cloud: "AWS",   pricingTier: "Enterprise", region: "us-east-1",         storage: "Default",   credentialName: "Serverless",        created: "03/15/2026",        metastore: "prod-metastore" },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function WorkspacesPage() {
  const [filter, setFilter] = React.useState("")
  const [location, setLocation] = React.useState("all")

  const cloudRegions = React.useMemo(() => buildCloudRegions(WORKSPACES), [])

  const filtered = WORKSPACES.filter((w) => {
    if (filter && !w.name.toLowerCase().includes(filter.toLowerCase())) return false
    if (location === "all") return true
    if (location.includes(":")) {
      const [c, r] = location.split(":")
      return w.cloud === c && w.region === r
    }
    return w.cloud === location
  })

  return (
    <AppShell activeItem="workspaces">
      <div className="flex flex-col gap-4 p-6">

        <h1 className="text-xl font-semibold text-foreground">Workspaces</h1>

        {/* Filters + action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <Input
                placeholder="Filter workspaces"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pr-8"
              />
              <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <LocationPicker value={location} onChange={setLocation} cloudRegions={cloudRegions} />
          </div>
          <Button size="sm">Create workspace</Button>
        </div>

        {/* Table */}
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="font-semibold text-foreground">Name</TableHead>
                <TableHead className="font-semibold text-foreground"><div className="flex justify-center">Cloud</div></TableHead>
                <TableHead className="font-semibold text-foreground">Region</TableHead>
                <TableHead className="font-semibold text-foreground">Storage</TableHead>
                <TableHead className="font-semibold text-foreground">Credential</TableHead>
                <TableHead className="font-semibold text-foreground">Created</TableHead>
                <TableHead className="font-semibold text-foreground">Pricing tier</TableHead>
                <TableHead className="font-semibold text-foreground">Metastore</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell className="w-8">
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircleIcon size={14} className="text-[var(--success)]" />
                      </TooltipTrigger>
                      <TooltipContent>Running</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <a href="#" className="text-primary hover:underline truncate block max-w-[120px]">
                      {ws.name}
                    </a>
                  </TableCell>
                  <TableCell><div className="flex justify-center">{CLOUD_ICONS[ws.cloud]}</div></TableCell>
                  <TableCell>{ws.region}</TableCell>
                  <TableCell>
                    <span className={cn(ws.storage === "Default" && "italic")}>{ws.storage}</span>
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate">
                    {ws.credentialName === "Serverless"
                      ? <span className="italic">{ws.credentialName}</span>
                      : ws.credentialName}
                  </TableCell>
                  <TableCell>{ws.created}</TableCell>
                  <TableCell>{ws.pricingTier}</TableCell>
                  <TableCell>
                    {ws.metastore ? (
                      <a href="#" className="text-primary hover:underline truncate block max-w-[100px]">
                        {ws.metastore}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <a
                      href="#"
                      className="flex items-center gap-1 text-primary hover:underline whitespace-nowrap"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>
    </AppShell>
  )
}
