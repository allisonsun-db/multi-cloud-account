"use client"

import * as React from "react"
import { AppShell, ManagedByOrganizationBanner, useAccountScope } from "@/components/shell"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Workspaces the view can scope to (subset of the account's workspaces).
const WORKSPACES: { id: string; name: string; cloud: "AWS" | "Azure" | "GCP" }[] = [
  { id: "1", name: "prod-us-west", cloud: "AWS" },
  { id: "5", name: "data-eng-prod", cloud: "Azure" },
  { id: "6", name: "ml-platform-prod", cloud: "GCP" },
  { id: "7", name: "analytics-prod", cloud: "AWS" },
  { id: "11", name: "marketing-analytics", cloud: "Azure" },
  { id: "20", name: "model-serving-prod", cloud: "AWS" },
]

const IDENTITY_TABS = [
  { value: "overview", label: "Overview", detail: "Account-wide identity summary — users, groups, and service principals at a glance." },
  { value: "users", label: "Users", detail: "People with access to the account, synced from your identity provider." },
  { value: "groups", label: "Groups", detail: "Groups used to assign access and entitlements across workspaces." },
  { value: "service-principals", label: "Service principals", detail: "Non-human identities for automation, jobs, and integrations." },
]

function IdentitiesContent() {
  const { scope, setScope } = useAccountScope()
  const isAccountScope = scope !== "org"

  // Prototype-only: the picker scopes the (mock) view. "all" = across all workspaces.
  const [workspace, setWorkspace] = React.useState("all")
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const selectedWorkspace = workspace === "all" ? undefined : WORKSPACES.find((w) => w.id === workspace)
  const selectedLabel = selectedWorkspace?.name ?? "All workspaces"

  return (
    <div className="flex flex-col">
      {isAccountScope && <ManagedByOrganizationBanner onSwitchToOrg={() => setScope("org")} />}
      <div className="mx-auto w-full max-w-[1000px] p-6">
        <h1 className="flex min-w-0 items-center gap-2 text-[22px] leading-7 font-semibold text-foreground">
          <button
            type="button"
            onClick={() => setWorkspace("all")}
            className="rounded px-1 py-0.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Identities
          </button>
          <span className="text-border font-normal" aria-hidden="true">/</span>
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Select workspace scope"
                className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[22px] leading-7 font-semibold text-foreground transition-colors hover:bg-muted data-[state=open]:bg-muted"
              >
                {selectedWorkspace && (
                  <img
                    src={CLOUD_LOGO[selectedWorkspace.cloud]}
                    alt=""
                    width={18}
                    height={18}
                    className={cn("size-[18px] shrink-0 object-contain", selectedWorkspace.cloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                  />
                )}
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown className="size-5 shrink-0 opacity-60" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[260px] p-0">
              <Command>
                <CommandInput placeholder="Search workspaces…" />
                <CommandList>
                  <CommandEmpty>No workspaces found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="All workspaces"
                      onSelect={() => { setWorkspace("all"); setPickerOpen(false) }}
                    >
                      <Check className={cn("h-4 w-4", workspace === "all" ? "opacity-100" : "opacity-0")} />
                      All workspaces
                    </CommandItem>
                    {WORKSPACES.map((w) => (
                      <CommandItem
                        key={w.id}
                        value={w.name}
                        onSelect={() => { setWorkspace(w.id); setPickerOpen(false) }}
                      >
                        <Check className={cn("h-4 w-4", workspace === w.id ? "opacity-100" : "opacity-0")} />
                        <img
                          src={CLOUD_LOGO[w.cloud]}
                          alt=""
                          width={14}
                          height={14}
                          className={cn("h-3.5 w-3.5 shrink-0 object-contain", w.cloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                        />
                        <span className="truncate">{w.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </h1>
        <Tabs defaultValue="overview" className="mt-4 gap-4">
          <TabsList variant="line" className="w-full justify-start border-b border-border">
            {IDENTITY_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-none">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {IDENTITY_TABS.map((t) => (
            <TabsContent key={t.value} value={t.value}>
              <Card className="py-0 shadow-none">
                <CardContent className="flex flex-col items-center justify-center gap-1 p-12 text-center">
                  <div className="text-sm font-semibold text-foreground">{t.label}</div>
                  <div className="text-sm text-muted-foreground">{t.detail}</div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AppShell activeItem="identities" contentClassName="max-w-none">
      <IdentitiesContent />
    </AppShell>
  )
}
