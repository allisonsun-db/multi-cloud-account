"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Search } from "lucide-react"
import { LocationPicker, buildCloudRegions, CLOUD_ICONS } from "@/components/ui/location-picker"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
// ─── Data ─────────────────────────────────────────────────────────────────────

type Metastore = {
  id: string
  name: string
  cloud: "AWS" | "Azure" | "GCP"
  region: string
  path: string
  createdAt: string
  updatedAt: string
}

const METASTORES: Metastore[] = [
  { id: "1",  name: "prod-metastore",                       cloud: "AWS",   region: "us-east-1",   path: "", createdAt: "03/19/2026", updatedAt: "03/19/2026" },
  { id: "2",  name: "prod-metastore-west",                  cloud: "AWS",   region: "us-west-2",   path: "", createdAt: "03/08/2026", updatedAt: "03/08/2026" },
  { id: "3",  name: "staging-metastore",                    cloud: "Azure", region: "eastus",      path: "", createdAt: "03/07/2026", updatedAt: "03/07/2026" },
  { id: "4",  name: "staging-metastore-west",               cloud: "Azure", region: "westus2",     path: "", createdAt: "03/03/2026", updatedAt: "03/04/2026" },
  { id: "5",  name: "dev-metastore",                        cloud: "GCP",   region: "us-west1",    path: "", createdAt: "03/02/2026", updatedAt: "03/05/2026" },
  { id: "6",  name: "analytics-metastore",                  cloud: "AWS",   region: "us-west-2",   path: "", createdAt: "03/01/2026", updatedAt: "03/01/2026" },
  { id: "7",  name: "ml-platform-metastore",                cloud: "GCP",   region: "us-central1", path: "", createdAt: "02/27/2026", updatedAt: "02/27/2026" },
  { id: "8",  name: "data-eng-metastore",                   cloud: "AWS",   region: "us-west-2",   path: "", createdAt: "02/25/2026", updatedAt: "02/25/2026" },
  { id: "9",  name: "finance-metastore",                    cloud: "Azure", region: "westeurope",  path: "", createdAt: "02/25/2026", updatedAt: "02/25/2026" },
  { id: "10", name: "az-global-uc-test-unstable-staging-2", cloud: "Azure", region: "eastus",      path: "", createdAt: "02/23/2026", updatedAt: "02/23/2026" },
  { id: "11", name: "risk-metastore",                       cloud: "AWS",   region: "us-east-1",   path: "", createdAt: "02/20/2026", updatedAt: "02/21/2026" },
  { id: "12", name: "customer-data-metastore",              cloud: "GCP",   region: "europe-west1", path: "", createdAt: "02/18/2026", updatedAt: "02/18/2026" },
  { id: "13", name: "marketing-metastore",                  cloud: "AWS",   region: "us-east-1",   path: "", createdAt: "02/15/2026", updatedAt: "02/16/2026" },
  { id: "14", name: "security-audit-metastore",             cloud: "GCP",   region: "us-west1",    path: "", createdAt: "02/10/2026", updatedAt: "02/10/2026" },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const [filter, setFilter] = React.useState("")
  const [location, setLocation] = React.useState("all")

  const cloudRegions = React.useMemo(() => buildCloudRegions(METASTORES), [])

  const filtered = METASTORES.filter((m) => {
    if (filter && !m.name.toLowerCase().includes(filter.toLowerCase())) return false
    if (location === "all") return true
    if (location.includes(":")) {
      const [c, r] = location.split(":")
      return m.cloud === c && m.region === r
    }
    return m.cloud === location
  })

  return (
    <AppShell activeItem="catalog">
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold text-foreground">Metastore</h1>

        {/* Filter + action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter metastores"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-8"
                />
              </div>
              <LocationPicker value={location} onChange={setLocation} cloudRegions={cloudRegions} />
            </div>
            <Button size="sm">Create metastore</Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-foreground w-[320px]">Name</TableHead>
                <TableHead className="font-semibold text-foreground"><div className="flex justify-center">Cloud</div></TableHead>
                <TableHead className="font-semibold text-foreground">Region</TableHead>
                <TableHead className="font-semibold text-foreground">Path</TableHead>
                <TableHead className="font-semibold text-foreground">Created at</TableHead>
                <TableHead className="font-semibold text-foreground">Updated at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <a href="#" className="text-primary hover:underline">
                      {m.name}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{CLOUD_ICONS[m.cloud]}</span>
                        </TooltipTrigger>
                        <TooltipContent>{m.cloud}</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>{m.region}</TableCell>
                  <TableCell className="text-muted-foreground">{m.path || ""}</TableCell>
                  <TableCell>{m.createdAt}</TableCell>
                  <TableCell>{m.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

      </div>
    </AppShell>
  )
}
