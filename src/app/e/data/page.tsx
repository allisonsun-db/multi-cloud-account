"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { DataGovernanceDashboard, DataRecommendationsPanel, buildDashboardData } from "@/components/monitoring/DataGovernanceDashboard"
import { MetastoreMonitorList } from "@/components/monitoring/MetastoreMonitorList"
import { MetastoreDetailContent, MetastoreAboutSidebar } from "@/app/catalog/[id]/page"
import { METASTORES } from "@/app/catalog/page"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { Lightbulb, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Unified "Data" surface: the full Governance "Data" dashboard stacked above the
// metastore management table (reused from /catalog). Consolidates the Governance
// monitoring view with the Admin "Metastores" tasks on one topic surface. The Data
// recommendations rail spans the full content height and toggles from the title row.
export default function UnifiedDataPage() {
  // Prototype-only: the picker scopes the (mock) dashboard. "all" = across all metastores.
  const [metastore, setMetastore] = React.useState("all")
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [recsOpen, setRecsOpen] = React.useState(false)
  const recCount = React.useMemo(() => buildDashboardData(metastore).recommendations.length, [metastore])

  const selectedMetastore = metastore === "all" ? undefined : METASTORES.find((m) => m.id === metastore)
  const selectedLabel = selectedMetastore?.name ?? "All metastores"

  return (
    <AppShell activeItem="data">
      <div className="flex flex-col gap-6 p-6">
        {/* Title row: "Data / <picker>" left; Create + Recommendations actions right. */}
        <div className="flex items-center justify-between gap-4">
            <h1 className="flex min-w-0 items-center gap-2 text-[22px] leading-7 font-semibold text-foreground">
              <button
                type="button"
                onClick={() => setMetastore("all")}
                className="rounded px-1 py-0.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Data
              </button>
              <span className="text-border font-normal" aria-hidden="true">/</span>
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Select metastore scope"
                    className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[22px] leading-7 font-semibold text-foreground transition-colors hover:bg-muted data-[state=open]:bg-muted"
                  >
                    {selectedMetastore && (
                      <img
                        src={CLOUD_LOGO[selectedMetastore.cloud]}
                        alt=""
                        width={18}
                        height={18}
                        className={cn("size-[18px] shrink-0 object-contain", selectedMetastore.cloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                      />
                    )}
                    <span className="truncate">{selectedLabel}</span>
                    <ChevronDown className="size-5 shrink-0 opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[260px] p-0">
                  <Command>
                    <CommandInput placeholder="Search metastores…" />
                    <CommandList>
                      <CommandEmpty>No metastores found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="All metastores"
                          onSelect={() => { setMetastore("all"); setPickerOpen(false) }}
                        >
                          <Check className={cn("h-4 w-4", metastore === "all" ? "opacity-100" : "opacity-0")} />
                          All metastores
                        </CommandItem>
                        {METASTORES.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={m.name}
                            onSelect={() => { setMetastore(m.id); setPickerOpen(false) }}
                          >
                            <Check className={cn("h-4 w-4", metastore === m.id ? "opacity-100" : "opacity-0")} />
                            <img
                              src={CLOUD_LOGO[m.cloud]}
                              alt=""
                              width={14}
                              height={14}
                              className={cn("h-3.5 w-3.5 shrink-0 object-contain", m.cloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                            />
                            <span className="truncate">{m.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </h1>

            <div className="flex shrink-0 items-center gap-2">
              {/* Recommendations open in a floating popover anchored to this button. */}
              <Popover open={recsOpen} onOpenChange={setRecsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" aria-pressed={recsOpen}>
                    <Lightbulb className="mr-1 h-4 w-4" />
                    Recommendations
                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-xs font-semibold text-muted-foreground">
                      {recCount}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[320px] overflow-hidden p-0">
                  <DataRecommendationsPanel metastoreId={metastore} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedMetastore ? (
            // Single metastore → full-width Overview/Configuration tab bar, then a two-column
            // body: main content on the left, "About this metastore" pane on the right (under
            // the tabs, visible across both).
            <Tabs defaultValue="overview" className="gap-4">
              <TabsList variant="line" className="w-full justify-start border-b border-border">
                <TabsTrigger value="overview" className="flex-none">Overview</TabsTrigger>
                <TabsTrigger value="configuration" className="flex-none">Configuration</TabsTrigger>
              </TabsList>
              <div className="flex gap-6">
                <div className="min-w-0 flex-1">
                  <TabsContent value="overview">
                    <DataGovernanceDashboard metastoreId={metastore} />
                  </TabsContent>
                  <TabsContent value="configuration">
                    <MetastoreDetailContent metastoreId={selectedMetastore.id} showAbout={false} />
                  </TabsContent>
                </div>
                <MetastoreAboutSidebar metastoreId={selectedMetastore.id} className="w-[280px] shrink-0" />
              </div>
            </Tabs>
          ) : (
            // All metastores → Overview (dashboard) + Metastores (comparison list) tabs.
            <Tabs defaultValue="overview" className="gap-4">
              <TabsList variant="line" className="w-full justify-start border-b border-border">
                <TabsTrigger value="overview" className="flex-none">Overview</TabsTrigger>
                <TabsTrigger value="metastores" className="flex-none">Metastores</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <DataGovernanceDashboard metastoreId={metastore} />
              </TabsContent>
              <TabsContent value="metastores">
                <MetastoreMonitorList onSelect={setMetastore} />
              </TabsContent>
            </Tabs>
          )}
      </div>
    </AppShell>
  )
}
