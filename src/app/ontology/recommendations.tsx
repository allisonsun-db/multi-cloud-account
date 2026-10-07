"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CatalogIcon, WorkspacesIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { METASTORES_FOR_SETUP, SETUP_STEPS, type SetupStep } from "./data"

// Scope reads as plain muted text with the nav's icon for that level (Workspaces /
// Metastores); availability is the only badge, so the two never look alike.
function ScopeLabel({ scope }: { scope: SetupStep["scope"] }) {
  const icons =
    scope === "Workspace" ? [WorkspacesIcon] : scope === "Metastore" ? [CatalogIcon] : [CatalogIcon, WorkspacesIcon]
  return (
    <span className="flex items-center gap-1">
      {icons.map((Icon, i) => <Icon key={i} size={12} className="shrink-0" />)}
      {scope}
    </span>
  )
}

// Setup guide — the title-row popover (same pattern as /e/data). One compact row per
// step: checkbox, title, a meta line (scope · metastore progress · availability badge), and the first sentence of
// the description (full text on hover). Checkboxes are owned by the page so the
// button's count stays in sync.

export function SetupStepsPanel({
  done,
  onToggle,
  onReset,
}: {
  done: string[]
  onToggle: (id: string, checked: boolean) => void
  onReset: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mx-4 flex shrink-0 items-center justify-between gap-3 border-b border-border py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">Setup guide</span>
          <span className="text-xs text-muted-foreground">{done.length} of {SETUP_STEPS.length} complete</span>
        </div>
        {done.length > 0 && (
          <button type="button" onClick={onReset} className="text-xs text-primary hover:underline">
            Reset
          </button>
        )}
      </div>

      <div className="max-h-[440px] overflow-y-auto">
        {SETUP_STEPS.map((step) => {
          const checked = done.includes(step.id)
          const metastoresDone = step.metastoreStatus
            ? METASTORES_FOR_SETUP.filter((m) => step.metastoreStatus?.[m]).length
            : undefined
          return (
            <div key={step.id} className="mx-4 flex items-start gap-3 border-b border-border py-3 last:border-b-0">
              <Checkbox
                id={`step-${step.id}`}
                checked={checked}
                onCheckedChange={(c) => onToggle(step.id, c === true)}
                className="mt-0.5"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5" title={step.description}>
                <label
                  htmlFor={`step-${step.id}`}
                  className={cn("cursor-pointer text-sm font-semibold", checked ? "text-muted-foreground line-through" : "text-foreground")}
                >
                  {step.title}
                </label>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <ScopeLabel scope={step.scope} />
                  {metastoresDone !== undefined && (
                    <span>{metastoresDone} of {METASTORES_FOR_SETUP.length} metastores</span>
                  )}
                  <Badge variant="outline" className="px-1.5 py-0 font-normal text-muted-foreground">{step.availability}</Badge>
                </span>
                {!checked && (
                  <p className="line-clamp-2 pt-0.5 text-sm text-accent-foreground">
                    {step.summary}
                    {step.bullets && <> {step.bullets.map((b) => b.term).join(" · ")}</>}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
