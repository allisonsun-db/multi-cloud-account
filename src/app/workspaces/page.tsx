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
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

type Workspace = {
  id: string
  name: string
  status: string
  pricingTier: string
  region: string
  storage: string
  credentialName: string
  created: string
  metastore: string | null
}

const WORKSPACES: Workspace[] = [
  { id: "1",  name: "prod-us-west",           status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "yesterday at ...",  metastore: "prod-metastore" },
  { id: "2",  name: "prod-us-east",           status: "Running", pricingTier: "Enterprise", region: "us-east-1", storage: "Serverless",      credentialName: "prod-storage-cred",   created: "yesterday at ...",  metastore: "prod-metastore" },
  { id: "3",  name: "staging-us-west",        status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "yesterday at ...",  metastore: "staging-metast..." },
  { id: "4",  name: "staging-us-east",        status: "Running", pricingTier: "Enterprise", region: "us-east-1", storage: "Default",        credentialName: "Serverless",  created: "last Tuesday ...",  metastore: "staging-metast..." },
  { id: "5",  name: "data-eng-prod",          status: "Running", pricingTier: "Enterprise", region: "us-east-1", storage: "Default",        credentialName: "Serverless",  created: "last Tuesday ...",  metastore: "prod-metastore" },
  { id: "6",  name: "ml-platform-prod",       status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "last Tuesday ...",  metastore: "prod-metastore" },
  { id: "7",  name: "analytics-prod",         status: "Running", pricingTier: "Enterprise", region: "us-east-1", storage: "Default",        credentialName: "Serverless",  created: "last Monday ...",   metastore: null },
  { id: "8",  name: "analytics-staging",      status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "last Monday ...",   metastore: "staging-metast..." },
  { id: "9",  name: "finance-reporting",      status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "last Friday at...", metastore: "prod-metastore" },
  { id: "10", name: "risk-modeling",          status: "Running", pricingTier: "Enterprise", region: "us-east-1", storage: "Default",        credentialName: "Serverless",  created: "last Friday at...", metastore: "prod-metastore" },
  { id: "11", name: "marketing-analytics",    status: "Running", pricingTier: "Enterprise", region: "us-east-1", storage: "Default",        credentialName: "Serverless",  created: "03/19/2026",        metastore: "prod-metastore" },
  { id: "12", name: "customer-data-platform", status: "Running", pricingTier: "Enterprise", region: "us-east-1", storage: "Default",        credentialName: "Serverless",  created: "03/19/2026",        metastore: "prod-metastore" },
  { id: "13", name: "security-audit",         status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "03/18/2026",        metastore: "prod-metastore" },
  { id: "14", name: "data-science-sandbox",   status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "03/18/2026",        metastore: "dev-metastore" },
  { id: "15", name: "platform-dev",           status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "03/18/2026",        metastore: "dev-metastore" },
  { id: "16", name: "etl-orchestration",      status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "03/18/2026",        metastore: "prod-metastore" },
  { id: "17", name: "realtime-streaming",     status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "03/17/2026",        metastore: "prod-metastore" },
  { id: "18", name: "supply-chain-analytics", status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "03/17/2026",        metastore: "prod-metastore" },
  { id: "19", name: "feature-store-prod",     status: "Running", pricingTier: "Enterprise", region: "us-west-2", storage: "Default",        credentialName: "Serverless",  created: "03/16/2026",        metastore: "prod-metastore" },
  { id: "20", name: "model-serving-prod",     status: "Running", pricingTier: "Enterprise", region: "us-east-1", storage: "Default",        credentialName: "Serverless",  created: "03/15/2026",        metastore: "prod-metastore" },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function WorkspacesPage() {
  const [filter, setFilter] = React.useState("")

  const filtered = filter
    ? WORKSPACES.filter((w) => w.name.toLowerCase().includes(filter.toLowerCase()))
    : WORKSPACES

  return (
    <AppShell activeItem="workspaces">
      <div className="flex flex-col gap-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Workspaces</h1>
          <Button size="sm">Create workspace</Button>
        </div>

        {/* Filter */}
        <div className="relative w-64">
          <Input
            placeholder="Filter workspaces"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pr-8"
          />
          <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Table */}
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="font-semibold text-foreground">Name</TableHead>
                <TableHead className="font-semibold text-foreground">Pricing tier</TableHead>
                <TableHead className="font-semibold text-foreground">Region</TableHead>
                <TableHead className="font-semibold text-foreground">Storage</TableHead>
                <TableHead className="font-semibold text-foreground">Credential</TableHead>
                <TableHead className="font-semibold text-foreground">Created</TableHead>
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
                  <TableCell>{ws.pricingTier}</TableCell>
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
