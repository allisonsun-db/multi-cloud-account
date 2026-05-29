"use client"

import * as React from "react"
import { Lock, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DatabricksLogo } from "@/components/shell/DatabricksLogo"
import { DbIcon } from "@/components/ui/db-icon"
import {
  OfficeIcon,
  UserGroupIcon,
  DataIcon,
  DollarIcon,
  GearIcon,
  WorkspacesIcon,
  CheckCircleIcon,
  SidebarCollapseIcon,
  SidebarExpandIcon,
  SparkleIcon,
  CatalogIcon,
  CloudIcon,
  ShieldIcon,
  ShieldCheckIcon,
  ErdIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  GiftIcon,
} from "@/components/icons"
import { cn } from "@/lib/utils"
import { WorkspacesContent } from "@/app/workspaces/page"
import { CatalogContent } from "@/app/catalog/page"
import { CloudResourcesContent } from "@/app/cloud-resources/page"
import { ResilienceContent } from "@/app/resilience/page"
import { AccountsContent } from "@/app/accounts/page"

// ─── Data ─────────────────────────────────────────────────────────────────────

const ORG_NAME = "Nike Organization"

const ACCOUNTS = [
  { id: "main",    name: "Nike",             isMain: true,  url: "main.nike.databricks.com",    users: 1240, usageLabel: "$42k / mo", usageRaw: 42 },
  { id: "emea",    name: "Nike EMEA",         isMain: false, url: "emea.nike.databricks.com",    users: 89,   usageLabel: "$8k / mo",  usageRaw: 8  },
  { id: "ds",      name: "Nike Data Science", isMain: false, url: "ds.nike.databricks.com",      users: 234,  usageLabel: "$19k / mo", usageRaw: 19 },
  { id: "sandbox", name: "Nike Sandbox",      isMain: false, url: "sandbox.nike.databricks.com", users: 12,   usageLabel: "$1k / mo",  usageRaw: 1  },
]

const TOTAL_USAGE_RAW = ACCOUNTS.reduce((s, a) => s + a.usageRaw, 0)

type Scope = "org" | string
type NavKey = "accounts" | "identity" | "settings" | "governance" | "data" | "cost" | "workspaces" | "catalog" | "cloud-resources" | "resilience" | "previews"

// ─── Shared nav button ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NavButton({ item, active, onClick }: { item: { id: string; label: string; icon: React.ComponentType<any> }; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-7 w-full items-center gap-2 rounded px-3 text-left text-sm transition-colors",
        active ? "bg-primary/10 font-semibold text-primary" : "text-foreground hover:bg-muted-foreground/10",
      )}
    >
      <DbIcon icon={item.icon} size={16} color={active ? "primary" : "muted"} />
      {item.label}
    </button>
  )
}

// ─── Org scope content ────────────────────────────────────────────────────────

function OrgAccountsView({ onDrillIn }: { onDrillIn: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Accounts</h1>
          <p className="text-sm text-muted-foreground">
            4 accounts share unified identity, billing, and governance policies.
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Create account
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total accounts", value: "4" },
          { label: "Total users",    value: "1,575" },
          { label: "Total usage",    value: "$70k / mo" },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-muted/40 px-4 py-3">
            <div className="text-xl font-semibold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Usage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ACCOUNTS.map((account) => (
            <TableRow
              key={account.id}
              className="cursor-pointer"
              onClick={() => onDrillIn(account.id)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon size={14} className="text-[var(--success)]" />
                  <span className="text-foreground">{account.name}</span>
                  {account.isMain && <Badge variant="secondary">Main</Badge>}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{account.url}</TableCell>
              <TableCell className="text-foreground">{account.users.toLocaleString()}</TableCell>
              <TableCell className="text-foreground">{account.usageLabel}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function OrgIdentityView() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Identity</h1>
    </div>
  )
}

function OrgUsageView() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Cost</h1>
    </div>
  )
}

function OrgDataView() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Data</h1>
    </div>
  )
}

function OrgPreviewsView() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Previews</h1>
    </div>
  )
}

function OrgSettingsView() {
  const tabs = ["Billing"]
  const [tab, setTab] = React.useState(0)
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      <div className="flex gap-4 border-b border-border">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={cn(
              "-mb-px border-b-2 pb-2 text-sm transition-colors",
              i === tab ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Account scope content ────────────────────────────────────────────────────

function ManagedBanner({ label, onGoToOrg }: { label: string; onGoToOrg: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-primary/8 px-6 py-3">
      <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">Managed by {ORG_NAME}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={onGoToOrg}>
        Go to organization
      </Button>
    </div>
  )
}

function AccountIdentityView({ accountId, onGoToOrg }: { accountId: string; onGoToOrg: () => void }) {
  const account = ACCOUNTS.find((a) => a.id === accountId)!
  const tabs = ["Users", "Groups", "Service principals"]
  const [tab, setTab] = React.useState(0)

  return (
    <div className="flex flex-col">
      <ManagedBanner
        label="Identity is managed at the organization level."
        onGoToOrg={onGoToOrg}
      />
      <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Identity</h1>
      </div>

      <div className="flex gap-4 border-b border-border">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={cn(
              "-mb-px border-b-2 pb-2 text-sm transition-colors",
              i === tab
                ? "border-primary font-semibold text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-semibold text-foreground">Account-level groups</h2>
                <p className="text-xs text-muted-foreground">
                  Scoped to {account.name} only. Organization groups are also available.
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add group
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Scope</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: `${account.id}-analysts`, members: 24,   scope: "This account" },
                  { name: `${account.id}-admins`,   members: 3,    scope: "This account" },
                  { name: "nike-all-employees",      members: 1240, scope: "Organization" },
                ].map((g) => (
                  <TableRow key={g.name}>
                    <TableCell className="font-mono text-sm text-foreground">{g.name}</TableCell>
                    <TableCell className="text-foreground">{g.members}</TableCell>
                    <TableCell>
                      <Badge variant={g.scope === "Organization" ? "secondary" : "outline"}>
                        {g.scope === "Organization" && <Lock className="mr-1 h-2.5 w-2.5" />}
                        {g.scope}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Account-level service principals</h2>
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add service principal
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">No account-level service principals yet.</p>
        </div>
      )}
      </div>
    </div>
  )
}

function AccountUsageView({ accountId, onGoToOrg }: { accountId: string; onGoToOrg: () => void }) {
  void accountId; void onGoToOrg
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Cost</h1>
    </div>
  )
}

function AccountPreviewsView({ accountId }: { accountId: string }) {
  void accountId
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Previews</h1>
    </div>
  )
}

function AccountSettingsView({ accountId, onGoToOrg }: { accountId: string; onGoToOrg: () => void }) {
  void accountId; void onGoToOrg
  const tabs = ["Billing"]
  const [tab, setTab] = React.useState(0)
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      <div className="flex gap-4 border-b border-border">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={cn(
              "-mb-px border-b-2 pb-2 text-sm transition-colors",
              i === tab ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Governance ───────────────────────────────────────────────────────────────

function OrgGovernanceView() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Governance</h1>
    </div>
  )
}


function AccountGovernanceView({ accountId, onGoToOrgGovernance }: { accountId: string; onGoToOrgGovernance: () => void }) {
  void accountId; void onGoToOrgGovernance
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Governance</h1>
    </div>
  )
}

function AccountDataView({ accountId, onGoToOrgGovernance }: { accountId: string; onGoToOrgGovernance: () => void }) {
  void accountId; void onGoToOrgGovernance
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Data</h1>
    </div>
  )
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrgNavPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [scope, setScope] = React.useState<Scope>("org")
  const [activeNav, setActiveNav] = React.useState<NavKey>("data")

  const isOrg = scope === "org"
  const account = ACCOUNTS.find((a) => a.id === scope)

  const orgNavKeys: NavKey[]     = ["data", "cost", "accounts", "identity", "previews", "settings"]
  const accountNavKeys: NavKey[] = ["data", "cost", "workspaces", "catalog", "cloud-resources", "resilience", "identity", "previews", "settings"]

  function handleScopeChange(next: Scope) {
    setScope(next)
    const nextKeys = next === "org" ? orgNavKeys : accountNavKeys
    if (!nextKeys.includes(activeNav)) {
      setActiveNav("data")
    }
  }

  function goToOrg() {
    handleScopeChange("org")
  }

  function goToOrgGovernance() {
    setScope("org")
    setActiveNav("data")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type NavSection = { label?: string; items: { id: NavKey; label: string; icon: React.ComponentType<any> }[] }

  const orgNavSections: NavSection[] = [
    {
      label: "Governance",
      items: [
        { id: "data",       label: "Data",       icon: DataIcon },
        { id: "cost",       label: "Cost",       icon: DollarIcon },
      ],
    },
    {
      label: "Platform",
      items: [
        { id: "accounts",   label: "Accounts",   icon: OfficeIcon },
        { id: "identity",   label: "Identity",   icon: UserGroupIcon },
        { id: "previews",   label: "Previews",   icon: GiftIcon },
        { id: "settings",   label: "Settings",   icon: GearIcon },
      ],
    },
  ]

  const accountNavSections: NavSection[] = [
    {
      label: "Governance",
      items: [
        { id: "data",            label: "Data",             icon: DataIcon },
        { id: "cost",            label: "Cost",             icon: DollarIcon },
      ],
    },
    {
      label: "Infrastructure",
      items: [
        { id: "workspaces",      label: "Workspaces",       icon: WorkspacesIcon },
        { id: "catalog",         label: "Catalog",          icon: CatalogIcon },
        { id: "cloud-resources", label: "Cloud resources",  icon: CloudIcon },
        { id: "resilience",      label: "Resilience",       icon: ShieldIcon },
      ],
    },
    {
      label: "Platform",
      items: [
        { id: "identity",        label: "Identity",         icon: UserGroupIcon },
        { id: "previews",        label: "Previews",         icon: GiftIcon },
        { id: "settings",        label: "Settings",         icon: GearIcon },
      ],
    },
  ]


  function renderContent() {
    if (isOrg) {
      if (activeNav === "accounts")  return <AccountsContent onDrillIn={(id) => handleScopeChange(id)} />
      if (activeNav === "data")      return <OrgDataView />
      if (activeNav === "cost")      return <OrgUsageView />
      if (activeNav === "identity")  return <OrgIdentityView />
      if (activeNav === "governance") return <OrgGovernanceView />
      if (activeNav === "previews")  return <OrgPreviewsView />
      if (activeNav === "settings")  return <OrgSettingsView />
    } else {
      if (activeNav === "identity")        return <AccountIdentityView accountId={scope} onGoToOrg={goToOrg} />
      if (activeNav === "governance")      return <AccountGovernanceView accountId={scope} onGoToOrgGovernance={goToOrgGovernance} />
      if (activeNav === "data")            return <AccountDataView accountId={scope} onGoToOrgGovernance={goToOrgGovernance} />
      if (activeNav === "cost")            return <AccountUsageView accountId={scope} onGoToOrg={goToOrg} />
      if (activeNav === "previews")        return <AccountPreviewsView accountId={scope} />
      if (activeNav === "settings")        return <AccountSettingsView accountId={scope} onGoToOrg={goToOrg} />
      if (activeNav === "workspaces")      return <WorkspacesContent />
      if (activeNav === "catalog")         return <CatalogContent />
      if (activeNav === "cloud-resources") return <CloudResourcesContent />
      if (activeNav === "resilience")      return <ResilienceContent />
    }
    return null
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-secondary">

      {/* ── TopBar ── */}
      <header className="flex h-12 shrink-0 items-center gap-2 bg-secondary px-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen
            ? <SidebarCollapseIcon className="h-4 w-4 text-muted-foreground" />
            : <SidebarExpandIcon className="h-4 w-4 text-muted-foreground" />
          }
        </Button>

        <DatabricksLogo height={18} workspaceName={isOrg ? ORG_NAME : account?.name} />

        <div className="flex-1" aria-hidden />

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" aria-label="AI Assistant">
            <DbIcon icon={SparkleIcon} color="ai" size={16} />
          </Button>
          <button
            className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
            aria-label="User menu"
          >
            N
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside
          className={cn(
            "flex h-full shrink-0 flex-col bg-secondary transition-all duration-200 overflow-hidden",
            sidebarOpen ? "w-[220px]" : "w-0",
          )}
        >
          {/* ── Scope breadcrumb ── */}
          <div className="shrink-0 px-2 pb-2">
            {isOrg ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-10 w-full items-center gap-1.5 rounded-md border border-border px-3 text-left text-sm font-normal text-foreground transition-colors hover:bg-muted-foreground/10">
                    <DbIcon icon={OfficeIcon} size={16} color="muted" />
                    <span className="flex-1 truncate">{ORG_NAME}</span>
                    <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px]">
                  <DropdownMenuItem className="font-semibold text-primary pointer-events-none">
                    <DbIcon icon={OfficeIcon} size={16} color="primary" />
                    {ORG_NAME}
                    <CheckIcon className="ml-auto h-3.5 w-3.5 text-primary" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">Accounts</DropdownMenuLabel>
                  {ACCOUNTS.map((a) => (
                    <DropdownMenuItem key={a.id} onClick={() => handleScopeChange(a.id)}>
                      {a.name}
                      {a.isMain && <span className="ml-auto text-xs text-muted-foreground">Main</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex h-10 w-full items-center gap-0.5 rounded-md border border-border px-1">
                <button
                  onClick={goToOrg}
                  className="group flex h-8 shrink-0 items-center gap-1.5 rounded px-2 text-muted-foreground transition-all hover:bg-muted-foreground/10 hover:text-foreground"
                  aria-label={ORG_NAME}
                >
                  <DbIcon icon={OfficeIcon} size={16} color="muted" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm transition-all duration-200 group-hover:max-w-[160px]">
                    {ORG_NAME}
                  </span>
                </button>
                <span className="shrink-0 text-muted-foreground text-sm select-none">/</span>
                <div className="flex-1 min-w-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-8 w-full min-w-0 items-center gap-1.5 rounded px-2 text-sm font-normal text-foreground transition-colors hover:bg-muted-foreground/10">
                      <span className="truncate">{account?.name}</span>
                      <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[220px]">
                    <DropdownMenuItem onClick={goToOrg}>
                      <DbIcon icon={OfficeIcon} size={16} color="muted" />
                      {ORG_NAME}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">Accounts</DropdownMenuLabel>
                    {ACCOUNTS.map((a) => (
                      <DropdownMenuItem key={a.id} onClick={() => handleScopeChange(a.id)}>
                        {a.name}
                        {a.id === scope && <CheckIcon className="ml-auto h-3.5 w-3.5 text-primary" />}
                        {a.isMain && a.id !== scope && (
                          <span className="ml-auto text-xs text-muted-foreground">Main</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>
            )}
          </div>

          <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 py-2">
            {(isOrg ? orgNavSections : accountNavSections).map((section, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    {section.label && (
                      <div className="flex items-center px-3 py-1">
                        <span className="text-xs font-normal text-muted-foreground">{section.label}</span>
                      </div>
                    )}
                    {section.items.map((item) => (
                      <NavButton key={item.id} item={item} active={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
                    ))}
                  </div>
                ))
            }
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main
          className={cn(
            "flex-1 overflow-y-auto rounded-md border border-border bg-background mb-2 mr-2",
            !sidebarOpen && "ml-2",
          )}
        >
          {renderContent()}
        </main>

      </div>
    </div>
  )
}
