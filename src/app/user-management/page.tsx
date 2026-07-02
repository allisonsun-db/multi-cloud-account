"use client"

import * as React from "react"
import { AppShell, useAccountScope } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LockIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

const TABS = ["Users", "Groups", "Service principals"]

function ManagedBanner({ onGoToOrg }: { onGoToOrg: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-primary/8 px-6 py-3">
      <LockIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">Managed by organization</span>
        <span className="text-sm text-muted-foreground">
          Identity is managed at the organization level.
        </span>
      </div>
      <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={onGoToOrg}>
        Go to organization
      </Button>
    </div>
  )
}

function IdentitySkeleton() {
  return (
    <div className="rounded-md border border-border">
      <div className="grid grid-cols-[1.5fr_1fr_1fr_96px] gap-4 border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "grid grid-cols-[1.5fr_1fr_1fr_96px] gap-4 px-4 py-3",
              index < 4 && "border-b border-border",
            )}
          >
            <Skeleton className="h-4 w-full max-w-[180px]" />
            <Skeleton className="h-4 w-full max-w-[120px]" />
            <Skeleton className="h-4 w-full max-w-[140px]" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

function UserManagementContent() {
  const [tab, setTab] = React.useState(0)
  const { scope, setScope } = useAccountScope()
  const isAccountScope = scope !== "org"

  return (
    <div className="flex flex-col">
      {isAccountScope && <ManagedBanner onGoToOrg={() => setScope("org")} />}
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">Identity</h1>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button variant="outline" size="sm" disabled={isAccountScope}>
                  Configure identity provider
                </Button>
              </span>
            </TooltipTrigger>
            {isAccountScope && (
              <TooltipContent className="w-[220px]">
                Identity provider is configured at the organization level. Switch to your organization or ask your admin.
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        <div className="flex gap-4 border-b border-border">
          {TABS.map((tabLabel, index) => (
            <button
              key={tabLabel}
              onClick={() => setTab(index)}
              className={cn(
                "-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors",
                index === tab
                  ? "border-primary text-accent-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tabLabel}
            </button>
          ))}
        </div>

        <IdentitySkeleton />
      </div>
    </div>
  )
}

export default function UserManagementPage() {
  return (
    <AppShell activeItem="user-management" workspace="Nike Production" userInitial="A">
      <UserManagementContent />
    </AppShell>
  )
}
