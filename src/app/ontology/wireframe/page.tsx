"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { UnifiedOverview } from "../wireframe-unified"

// Alternate Overview layout (unified scorecard + recommendations rail), shown inside a static page frame.

function Box({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`rounded-md border border-border bg-muted/60 ${className ?? ""}`}>{children}</div>
}

export default function OverviewWireframe() {
  return (
    <AppShell activeItem="ontology">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 p-6">
        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[22px] leading-7 font-semibold text-foreground">Ontology / All domains ▾</h1>
          <Box className="flex h-8 items-center px-3 text-sm text-muted-foreground">Setup guide (5)</Box>
        </div>
        <div className="flex gap-4 border-b border-border pb-2 text-sm">
          <span className="font-semibold text-foreground">Overview</span>
          <span className="text-muted-foreground">Governance &amp; access</span>
          <span className="text-muted-foreground">Sources &amp; connectors</span>
          <span className="text-muted-foreground">Ontology</span>
        </div>
        <UnifiedOverview />
      </div>
    </AppShell>
  )
}
