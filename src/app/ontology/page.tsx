"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ErdIcon } from "@/components/icons"
import { ListChecks } from "lucide-react"
import { DOMAINS, SETUP_STEPS } from "./data"
import { WireframeOverview } from "./wireframe-overview"
import { SetupStepsPanel } from "./recommendations"
import { GovernanceTab } from "./governance-tab"
import { SourcesTab } from "./sources-tab"

// Account-level Ontology monitoring ([PRD] Ontology Monitoring, MVP). Platform admins
// see what makes up the Genie ontology, who curates it, which sources feed it, and
// where the gaps are — across all domains or scoped to one. Mock data only.

function OntologyMapPlaceholder() {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex min-h-[480px] flex-col items-center justify-center gap-2 p-12 text-center">
        <ErdIcon size={32} className="text-muted-foreground" />
        <div className="text-sm font-semibold text-foreground">Ontology map</div>
        <div className="max-w-[440px] text-sm text-muted-foreground">
          Domains and the pages, agents, and assets connected to them, with usage density and gaps. Same view as the
          workspace Discover map.
        </div>
      </CardContent>
    </Card>
  )
}

export default function Page() {
  const [domain, setDomain] = React.useState("all")
  const [recsOpen, setRecsOpen] = React.useState(false)
  const [doneSteps, setDoneSteps] = React.useState<string[]>([])
  const [tab, setTab] = React.useState("overview")
  // Deep-link support, e.g. /ontology?tab=sources&domain=sales
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("tab")
    const d = params.get("domain")
    if (t && ["overview", "governance", "sources", "map"].includes(t)) setTab(t)
    if (d && DOMAINS.some((x) => x.id === d)) setDomain(d)
  }, [])
  return (
    <AppShell activeItem="ontology">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 p-6">
        {/* Title row: "Ontology" left; Setup guide right (same pattern as /e/data). */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="min-w-0 text-[22px] leading-7 font-semibold text-foreground">Ontology</h1>

          <Popover open={recsOpen} onOpenChange={setRecsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" aria-pressed={recsOpen}>
                <ListChecks className="mr-1 h-4 w-4" />
                Setup guide
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-xs font-semibold text-muted-foreground">
                  {SETUP_STEPS.length - doneSteps.length}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[400px] overflow-hidden p-0">
              <SetupStepsPanel
                done={doneSteps}
                onToggle={(id, checked) => setDoneSteps((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))}
                onReset={() => setDoneSteps([])}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="gap-4">
          <TabsList variant="line" className="w-full justify-start border-b border-border">
            <TabsTrigger value="overview" className="flex-none">Overview</TabsTrigger>
            <TabsTrigger value="governance" className="flex-none">Governance &amp; access</TabsTrigger>
            <TabsTrigger value="sources" className="flex-none">Sources &amp; connectors</TabsTrigger>
            <TabsTrigger value="map" className="flex-none">Ontology map</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <WireframeOverview onNavigate={setTab} />
          </TabsContent>
          <TabsContent value="governance">
            <GovernanceTab domain={domain} />
          </TabsContent>
          <TabsContent value="sources">
            <SourcesTab />
          </TabsContent>
          <TabsContent value="map">
            <OntologyMapPlaceholder />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
