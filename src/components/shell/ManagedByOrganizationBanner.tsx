"use client"

import { Button } from "@/components/ui/button"
import { LockIcon } from "@/components/icons"

export function ManagedByOrganizationBanner({ onSwitchToOrg }: { onSwitchToOrg: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-primary/8 px-6 py-3">
      <LockIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">Managed by organization</span>
        <span className="text-sm text-muted-foreground">
          Identity is managed at the organization level.
        </span>
      </div>
      <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={onSwitchToOrg}>
        Switch to organization
      </Button>
    </div>
  )
}
