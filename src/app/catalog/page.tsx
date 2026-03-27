"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Search, ChevronsUpDown, ArrowDownUp } from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────

type Metastore = {
  id: string
  name: string
  region: string
  path: string
  createdAt: string
  updatedAt: string
}

const METASTORES: Metastore[] = [
  { id: "1",  name: "prod-metastore",                      region: "us-east-1", path: "", createdAt: "03/19/2026", updatedAt: "03/19/2026" },
  { id: "2",  name: "prod-metastore-west",                 region: "us-west-2", path: "", createdAt: "03/08/2026", updatedAt: "03/08/2026" },
  { id: "3",  name: "staging-metastore",                   region: "us-east-1", path: "", createdAt: "03/07/2026", updatedAt: "03/07/2026" },
  { id: "4",  name: "staging-metastore-west",              region: "us-west-2", path: "", createdAt: "03/03/2026", updatedAt: "03/04/2026" },
  { id: "5",  name: "dev-metastore",                       region: "us-west-1", path: "", createdAt: "03/02/2026", updatedAt: "03/05/2026" },
  { id: "6",  name: "analytics-metastore",                 region: "us-west-2", path: "", createdAt: "03/01/2026", updatedAt: "03/01/2026" },
  { id: "7",  name: "ml-platform-metastore",               region: "us-west-2", path: "", createdAt: "02/27/2026", updatedAt: "02/27/2026" },
  { id: "8",  name: "data-eng-metastore",                  region: "us-west-2", path: "", createdAt: "02/25/2026", updatedAt: "02/25/2026" },
  { id: "9",  name: "finance-metastore",                   region: "us-west-1", path: "", createdAt: "02/25/2026", updatedAt: "02/25/2026" },
  { id: "10", name: "az-global-uc-test-unstable-staging-2", region: "us-east-1", path: "", createdAt: "02/23/2026", updatedAt: "02/23/2026" },
  { id: "11", name: "risk-metastore",                      region: "us-east-1", path: "", createdAt: "02/20/2026", updatedAt: "02/21/2026" },
  { id: "12", name: "customer-data-metastore",             region: "us-west-2", path: "", createdAt: "02/18/2026", updatedAt: "02/18/2026" },
  { id: "13", name: "marketing-metastore",                 region: "us-east-1", path: "", createdAt: "02/15/2026", updatedAt: "02/16/2026" },
  { id: "14", name: "security-audit-metastore",            region: "us-west-2", path: "", createdAt: "02/10/2026", updatedAt: "02/10/2026" },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const [filter, setFilter] = React.useState("")

  const filtered = filter
    ? METASTORES.filter((m) => m.name.toLowerCase().includes(filter.toLowerCase()))
    : METASTORES

  return (
    <AppShell activeItem="catalog">
      <div className="flex flex-col gap-6 p-6">

        {/* Page title */}
        <h1 className="text-xl font-semibold text-foreground">Metastore</h1>

        <div className="flex flex-col gap-3">
          {/* Filter + action */}
          <div className="flex items-center justify-between">
            <div className="relative w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter metastores"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button size="sm">Create metastore</Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-1">
                    Name <ChevronsUpDown className="h-3.5 w-3.5" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">Region</TableHead>
                <TableHead className="font-semibold text-foreground">Path</TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-1">
                    Created at <ArrowDownUp className="h-3.5 w-3.5" />
                  </div>
                </TableHead>
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
                  <TableCell>{m.region}</TableCell>
                  <TableCell className="text-muted-foreground">{m.path || ""}</TableCell>
                  <TableCell>{m.createdAt}</TableCell>
                  <TableCell>{m.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>
    </AppShell>
  )
}
