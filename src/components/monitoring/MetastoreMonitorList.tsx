"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { EllipsisVertical, Search } from "lucide-react"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { cn } from "@/lib/utils"
import { METASTORES } from "@/app/catalog/page"

// The per-metastore list — identity (cloud, region, workspaces) plus management actions
// in a ⋯ menu, sitting under the org-level monitoring dashboard. Selecting a metastore
// scopes the Data view to it (Overview / Configuration tabs) rather than navigating away.

export function MetastoreMonitorList({ onSelect }: { onSelect: (id: string) => void }) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const rows = METASTORES.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-[280px] max-w-full">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search metastores…"
            className="pl-8"
          />
        </div>
        <Button size="sm" className="shrink-0" onClick={() => router.push("/catalog/new")}>
          Create metastore
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-foreground w-[280px]">Metastore</TableHead>
            <TableHead className="font-semibold text-foreground"><div className="flex justify-center">Cloud</div></TableHead>
            <TableHead className="font-semibold text-foreground">Region</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Workspaces</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                No metastores found.
              </TableCell>
            </TableRow>
          )}
          {rows.map((m) => {
            return (
              <TableRow key={m.id}>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onSelect(m.id)}
                    className="text-primary hover:underline"
                  >
                    {m.name}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <img
                      src={CLOUD_LOGO[m.cloud]}
                      alt={m.cloud}
                      width={14}
                      height={14}
                      className={cn("h-3.5 w-3.5 object-contain", m.cloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                    />
                  </div>
                </TableCell>
                <TableCell>{m.region}</TableCell>
                <TableCell className="text-right tabular-nums">{m.workspaces}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${m.name}`} className="text-muted-foreground hover:text-foreground">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuItem onClick={() => onSelect(m.id)}>Open metastore</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSelect(m.id)}>Manage permissions</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSelect(m.id)}>Edit details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </section>
  )
}
