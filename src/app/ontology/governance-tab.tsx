"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from "@/components/ui/dialog"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookIcon, BracketsCurlyIcon, CertifiedFillSmallIcon, OverflowIcon, TableIcon, DashboardIcon, WarningIcon,
} from "@/components/icons"
import { ChevronRight, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PillToggle, SectionHeader, UserCell } from "./shared"
import {
  BLOCKED_USERS, CONTRIBUTORS, DOMAINS, INITIAL_GRANTS, domainName,
  type BlockedUser, type ContributionKind, type Contributor, type DiscoveryGrant,
} from "./data"

// ─── Grant / edit Manage Discovery dialog ─────────────────────────────────────

function GrantDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: DiscoveryGrant | null
  onSave: (grant: DiscoveryGrant) => void
}) {
  const [email, setEmail] = React.useState("")
  const [level, setLevel] = React.useState<"account" | "domain">("domain")
  const [domains, setDomains] = React.useState<string[]>([])

  React.useEffect(() => {
    if (!open) return
    setEmail(editing?.email ?? "")
    setLevel(editing?.scope === "account" ? "account" : "domain")
    setDomains(editing && editing.scope !== "account" ? editing.scope : [])
  }, [open, editing])

  const valid = email.trim() && (level === "account" || domains.length > 0)

  function handleSave() {
    const name = editing?.name ?? email.split("@")[0].split(/[._]/).map((p) => p[0]?.toUpperCase() + p.slice(1)).join(" ")
    onSave({
      id: editing?.id ?? `g-${Date.now()}`,
      name,
      email: email.trim(),
      scope: level === "account" ? "account" : domains,
      grantedBy: editing?.grantedBy ?? "You",
      granted: editing?.granted ?? "Today",
      lastActivity: editing?.lastActivity ?? "—",
    })
    toast.success(editing ? "Access updated" : `Manage Discovery granted to ${name}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader className="px-6 pt-4 pb-0">
          <DialogTitle className="text-[22px] font-semibold leading-7">
            {editing ? "Edit Manage Discovery access" : "Grant Manage Discovery"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4 px-6 pt-4 pb-4">
          <p className="text-sm text-muted-foreground">
            Users with Manage Discovery can curate domains, pages, and trusted assets that Genie uses to ground answers.
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="grant-email">User or group</Label>
            <Input
              id="grant-email"
              value={email}
              disabled={!!editing}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Scope</Label>
            <RadioGroup value={level} onValueChange={(v) => setLevel(v as "account" | "domain")} className="gap-2">
              <div className="flex items-start gap-2">
                <RadioGroupItem value="account" id="scope-account" className="mt-0.5" />
                <Label htmlFor="scope-account" className="flex flex-col items-start gap-0 font-normal">
                  <span>Account level</span>
                  <span className="text-xs text-muted-foreground">Can curate every domain, including new ones</span>
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="domain" id="scope-domain" className="mt-0.5" />
                <Label htmlFor="scope-domain" className="flex flex-col items-start gap-0 font-normal">
                  <span>Specific domains</span>
                  <span className="text-xs text-muted-foreground">Recommended for domain experts</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          {level === "domain" && (
            <div className="grid grid-cols-2 gap-2 rounded border border-border p-3">
              {DOMAINS.map((d) => (
                <div key={d.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`dom-${d.id}`}
                    checked={domains.includes(d.id)}
                    onCheckedChange={(c) =>
                      setDomains((prev) => (c ? [...prev, d.id] : prev.filter((x) => x !== d.id)))
                    }
                  />
                  <Label htmlFor={`dom-${d.id}`} className="font-normal">{d.name}</Label>
                </div>
              ))}
            </div>
          )}
        </DialogBody>
        <DialogFooter className="px-6 pt-4 pb-6">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" disabled={!valid} onClick={handleSave}>
            {editing ? "Save" : "Grant access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Manage Discovery access ───────────────────────────────────────────────────

function ManageDiscoverySection({ domain }: { domain: string }) {
  const [grants, setGrants] = React.useState<DiscoveryGrant[]>(INITIAL_GRANTS)
  const [level, setLevel] = React.useState<"account" | "domain">("domain")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<DiscoveryGrant | null>(null)

  const accountGrants = grants.filter((g) => g.scope === "account")
  const domainGrants = grants.filter(
    (g) => g.scope !== "account" && (domain === "all" || g.scope.includes(domain)),
  )
  const rows = level === "account" ? accountGrants : domainGrants
  function openGrant(entry: DiscoveryGrant | null) {
    setEditing(entry)
    setDialogOpen(true)
  }

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-[var(--shadow-db-sm)]">
        <GrantDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editing={editing}
          onSave={(g) =>
            setGrants((prev) => (prev.some((p) => p.id === g.id) ? prev.map((p) => (p.id === g.id ? g : p)) : [g, ...prev]))
          }
        />
        <SectionHeader
          title="Discovery curators"
          description="Users who can curate the ontology for the account or specific domains."
        />

        <div className="flex flex-wrap items-center gap-3">
          <PillToggle
            value={level}
            onChange={setLevel}
            options={[
              { value: "domain", label: `Domain level (${domainGrants.length})` },
              { value: "account", label: `Account level (${accountGrants.length})` },
            ]}
          />
          <Button size="sm" className="ml-auto shrink-0" onClick={() => openGrant(null)}>Grant access</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Domains</TableHead>
              <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                  No users match.
                </TableCell>
              </TableRow>
            )}
            {rows.map((g) => (
              <TableRow key={g.id}>
                <TableCell><UserCell name={g.name} /></TableCell>
                <TableCell>
                  {g.scope === "account" ? (
                    <Badge variant="indigo" className="px-1.5 text-sm font-normal">All domains</Badge>
                  ) : (
                    <span className="flex flex-wrap gap-1">
                      {g.scope.map((d) => <Badge key={d} variant="secondary" className="px-1.5 text-sm font-normal">{domainName(d)}</Badge>)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="p-0 pr-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label={`Actions for ${g.name}`}>
                        <OverflowIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => window.setTimeout(() => openGrant(g), 0)}>Edit scope</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => {
                          setGrants((prev) => prev.filter((p) => p.id !== g.id))
                          toast.success(`Removed Manage Discovery from ${g.name}`)
                        }}
                      >
                        Remove access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </section>
  )
}

// ─── Top contributors ──────────────────────────────────────────────────────────

const KIND_ICON: Record<ContributionKind, React.ComponentType<{ className?: string }>> = {
  "Page": BookIcon,
  "Databricks asset": DashboardIcon,
  "Table": TableIcon,
  "Snippet": BracketsCurlyIcon,
}

function ContributorSheet({ contributor, onClose }: { contributor: Contributor | null; onClose: () => void }) {
  const kinds: ContributionKind[] = ["Page", "Databricks asset", "Table", "Snippet"]
  return (
    <Sheet open={!!contributor} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[480px] gap-0 sm:max-w-[480px]">
        {contributor && (
          <>
            <SheetHeader className="gap-2 border-b border-border p-6">
              <SheetTitle className="text-[18px] leading-6">{contributor.name}</SheetTitle>
              <SheetDescription>{contributor.email}</SheetDescription>
              <span className="flex flex-wrap gap-1">
                {contributor.domains.map((d) => <Badge key={d} variant="secondary">{domainName(d)}</Badge>)}
              </span>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
              {contributor.unusual && (
                <Alert variant="warning">
                  <WarningIcon size={16} />
                  <AlertDescription>{contributor.unusual}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Pages", value: contributor.pages },
                  { label: "Snippets", value: contributor.snippets },
                  { label: "Assets", value: contributor.assets },
                  { label: "Tables", value: contributor.tables },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col rounded border border-border px-3 py-2">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="text-sm font-semibold text-foreground">{s.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {kinds.map((kind) => {
                const items = contributor.contributions.filter((c) => c.kind === kind)
                if (items.length === 0) return null
                const Icon = KIND_ICON[kind]
                return (
                  <div key={kind} className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Recent {kind.toLowerCase()}s</span>
                    {items.map((c) => (
                      <a
                        key={c.name}
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{c.name}</span>
                        {c.certified && <CertifiedFillSmallIcon className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Certified" />}
                        <span className="shrink-0 text-xs text-muted-foreground">{domainName(c.domain)} · {c.updated}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                )
              })}
            </div>
            <SheetFooter className="flex-row justify-end border-t border-border p-4">
              <Button variant="outline" size="sm" onClick={() => toast.success("Opened Discover in prod-us-west")}>
                Open in Discover
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" onClick={() => toast.success("Message drafted to the domain expert")}>
                Contact domain expert
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function TopContributorsSection({ domain }: { domain: string }) {
  const [selected, setSelected] = React.useState<Contributor | null>(null)
  const contributions = (c: Contributor) => c.pages + c.snippets + c.tables
  const rows = CONTRIBUTORS
    .filter((c) => domain === "all" || c.domains.includes(domain))
    .sort((a, b) => contributions(b) - contributions(a))
  const maxContributions = Math.max(...rows.map(contributions), 1)

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-[var(--shadow-db-sm)]">
        <ContributorSheet contributor={selected} onClose={() => setSelected(null)} />
        <SectionHeader
          title="Top ontology contributors"
          description="Users who've added the most to the ontology. Select a row to see their contributions."
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="w-[40%]">Contributions</TableHead>
              <TableHead>Domains</TableHead>
              <TableHead className="w-10"><span className="sr-only">Open</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => setSelected(c)}>
                <TableCell>
                  <UserCell name={c.name} />
                </TableCell>
                <TableCell>
                  <span
                    className="flex h-[22px] items-center rounded bg-[var(--chart-bar)] px-2 tabular-nums text-foreground"
                    style={{ width: `${Math.max((contributions(c) / maxContributions) * 100, 12)}%` }}
                  >
                    {contributions(c).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex flex-wrap gap-1">
                    {c.domains.map((d) => <Badge key={d} variant="secondary" className="px-1.5 text-sm font-normal">{domainName(d)}</Badge>)}
                  </span>
                </TableCell>
                <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </section>
  )
}

// ─── Users missing data access ─────────────────────────────────────────────────

function BlockedUserSheet({ user, onClose, onGranted }: { user: BlockedUser | null; onClose: () => void; onGranted: (id: string) => void }) {
  const [picked, setPicked] = React.useState<string[]>([])

  React.useEffect(() => {
    setPicked(user ? user.suggestions.filter((s) => s.owner !== "No domain expert").map((s) => s.name) : [])
  }, [user])

  return (
    <Sheet open={!!user} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[480px] gap-0 sm:max-w-[480px]">
        {user && (
          <>
            <SheetHeader className="gap-1 border-b border-border p-6">
              <SheetTitle className="text-[18px] leading-6">{user.name}</SheetTitle>
              <SheetDescription>{user.team} · {domainName(user.domain)}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
              <p className="text-sm text-muted-foreground">
                {user.name.split(" ")[0]} asked Genie {user.questions30d} questions in the last 30 days;{" "}
                <span className="font-semibold text-foreground">{user.noAccessAnswers}</span> couldn&apos;t be answered because they
                can only read {user.accessibleTables} {user.accessibleTables === 1 ? "table" : "tables"}.
              </p>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-foreground">Suggested grants</span>
                {user.suggestions.map((s) => (
                  <label
                    key={s.name}
                    className="flex cursor-pointer items-start gap-3 rounded border border-border p-3 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={picked.includes(s.name)}
                      onCheckedChange={(c) => setPicked((prev) => (c ? [...prev, s.name] : prev.filter((x) => x !== s.name)))}
                      className="mt-0.5"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm text-foreground">{s.name}</span>
                        <Badge variant="secondary">{s.type}</Badge>
                      </span>
                      <span className="text-xs text-muted-foreground">{s.reason}</span>
                      <span className={cn("text-xs", s.owner === "No domain expert" ? "text-[var(--warning)]" : "text-muted-foreground")}>
                        Owner: {s.owner}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Grants are read-only (SELECT) and follow Unity Catalog permissions. Data owners are notified.
              </p>
            </div>
            <SheetFooter className="flex-row justify-end border-t border-border p-4">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button
                size="sm"
                disabled={picked.length === 0}
                onClick={() => {
                  toast.success(`Granted ${picked.length} ${picked.length === 1 ? "object" : "objects"} to ${user.name}`)
                  onGranted(user.id)
                }}
              >
                Grant {picked.length > 0 ? picked.length : ""} selected
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function BlockedUsersSection({ domain }: { domain: string }) {
  const [users, setUsers] = React.useState(BLOCKED_USERS)
  const [selected, setSelected] = React.useState<BlockedUser | null>(null)
  const rows = users.filter((u) => domain === "all" || u.domain === domain)

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-[var(--shadow-db-sm)]">
        <BlockedUserSheet
          user={selected}
          onClose={() => setSelected(null)}
          onGranted={(id) => {
            setUsers((prev) => prev.filter((u) => u.id !== id))
            setSelected(null)
          }}
        />
        <SectionHeader
          title="Users missing data access"
          description="Users Genie can't fully answer due to missing access. Select a row to see suggested grants, based on peer access and denied queries."
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="text-right"># of accessible assets</TableHead>
              <TableHead className="text-right">Questions (30d)</TableHead>
              <TableHead className="text-right"># of suggested grants</TableHead>
              <TableHead className="w-10"><span className="sr-only">Open</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                  Everyone in this domain can reach the data they ask about.
                </TableCell>
              </TableRow>
            )}
            {rows.map((u) => (
              <TableRow key={u.id} className="cursor-pointer" onClick={() => setSelected(u)}>
                <TableCell><UserCell name={u.name} /></TableCell>
                <TableCell className="text-right">
                  <span className={cn(u.accessibleTables === 0 && "font-semibold text-destructive")}>{u.accessibleTables}</span>
                </TableCell>
                <TableCell className="text-right">{u.questions30d}</TableCell>
                <TableCell className="text-right">{u.suggestions.length}</TableCell>
                <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </section>
  )
}

// ─── Governance tab ────────────────────────────────────────────────────────────

export function GovernanceTab({ domain }: { domain: string }) {
  return (
    <div className="flex flex-col gap-4">
      <ManageDiscoverySection domain={domain} />
      <TopContributorsSection domain={domain} />
      <BlockedUsersSection domain={domain} />
    </div>
  )
}
