"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Search } from "lucide-react"
import { NewWindowIcon } from "@/components/icons"
import { LocationPicker, buildCloudRegions, CLOUD_ICONS, CLOUD_LOGO } from "@/components/ui/location-picker"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
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

const MOST_USED_METASTORES = [
  { id: "1", name: "prod-metastore", cloud: "AWS", region: "us-east-1", workspaces: "8 workspaces" },
  { id: "2", name: "prod-metastore-west", cloud: "AWS", region: "us-west-2", workspaces: "5 workspaces" },
  { id: "3", name: "staging-metastore", cloud: "Azure", region: "eastus", workspaces: "4 workspaces" },
  { id: "7", name: "ml-platform-metastore", cloud: "GCP", region: "us-central1", workspaces: "3 workspaces" },
] satisfies Array<{
  id: string
  name: string
  cloud: Metastore["cloud"]
  region: string
  workspaces: string
}>

// ─── Page ──────────────────────────────────────────────────────────────────────

export function CatalogContent() {
  const router = useRouter()
  const [filter, setFilter] = React.useState("")
  const [locations, setLocations] = React.useState<string[]>([])

  const cloudRegions = React.useMemo(() => buildCloudRegions(METASTORES), [])

  const filtered = METASTORES.filter((m) => {
    if (filter && !m.name.toLowerCase().includes(filter.toLowerCase())) return false
    if (locations.length === 0) return true
    return locations.some(loc => {
      if (loc.includes(":")) {
        const [c, r] = loc.split(":")
        return m.cloud === c && m.region === r
      }
      return m.cloud === loc
    })
  })

  return (
    <div className="flex flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold text-foreground">Metastore</h1>

        {/* Filter + action */}
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="relative min-w-0 flex-[1_1_224px] max-w-[280px]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter metastores"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-8"
                />
              </div>
              <LocationPicker className="min-w-0 flex-[1_1_200px] max-w-[240px]" value={locations} onChange={setLocations} cloudRegions={cloudRegions} />
            </div>
            <Button className="shrink-0" size="sm" onClick={() => router.push("/catalog/new")}>Create metastore</Button>
          </div>

          {locations.length === 0 && !filter.trim() && (
            <section className="mt-2 mb-2 flex flex-col gap-3">
              <h2 className="text-[15px] font-semibold text-foreground">Most used by workspaces</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3 pb-1">
                {MOST_USED_METASTORES.map((metastore) => (
                  <Card
                    key={metastore.id}
                    className="cursor-pointer overflow-hidden py-0 transition-shadow hover:shadow-[var(--shadow-db-lg)]"
                    onClick={() => router.push(`/catalog/${metastore.id}`)}
                  >
                    <CardContent className="flex flex-col gap-0 px-0">
                      <div className="flex flex-col gap-0.5 px-4 py-3">
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <div className="truncate text-sm font-semibold text-foreground">{metastore.name}</div>
                          <div className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                            <img
                              src={CLOUD_LOGO[metastore.cloud]}
                              alt=""
                              width={12}
                              height={12}
                              className={cn("h-3 w-3 object-contain", metastore.cloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                            />
                            <span className="truncate">{metastore.region} · {metastore.workspaces}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex h-24 items-center justify-center border-t border-border bg-muted">
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <NewWindowIcon className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold text-foreground">All metastores</h2>

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
                    <a href={`/catalog/${m.id}`} className="text-primary hover:underline">
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
          </section>

      </div>
  )
}

export default function CatalogPage() {
  return (
    <AppShell activeItem="catalog">
      <CatalogContent />
    </AppShell>
  )
}
