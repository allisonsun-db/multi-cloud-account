"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Search } from "lucide-react"
import { CheckCircleIcon, XCircleIcon, DotsCircleIcon, UserGroupIcon, ShieldCheckIcon, CreditCardIcon, GiftIcon } from "@/components/icons"

// ─── Data ─────────────────────────────────────────────────────────────────────

type AccountStatus = "Active" | "Unverified" | "Pending"

type Account = {
  id: string
  name: string
  isMain: boolean
  url: string
  contact: string
  created: string
  status: AccountStatus
}

const INITIAL_ACCOUNTS: Account[] = [
  { id: "1", name: "Nike",              isMain: true,  url: "nike.databricks.com",         contact: "admin@nike.com",      created: "2024-06-15", status: "Active" },
  { id: "3", name: "Nike EMEA",         isMain: false, url: "nike-emea.databricks.com",    contact: "emea-admin@nike.com", created: "2025-03-01", status: "Active" },
  { id: "4", name: "Nike Data Science", isMain: false, url: "nike-ds.databricks.com",      contact: "ds-team@nike.com",    created: "2025-08-12", status: "Active" },
  { id: "5", name: "Nike Sandbox",      isMain: false, url: "nike-sandbox.databricks.com", contact: "sandbox@nike.com",    created: "2026-04-30", status: "Pending" },
]

const STATUS_META: Record<AccountStatus, { icon: React.ComponentType<{ size?: number; className?: string }>; className: string; tooltip: string }> = {
  Active:     { icon: CheckCircleIcon, className: "text-[var(--success)]", tooltip: "Active" },
  Unverified: { icon: XCircleIcon,     className: "text-[var(--warning)]", tooltip: "Unverified" },
  Pending:    { icon: DotsCircleIcon,  className: "text-muted-foreground", tooltip: "Pending — must be verified via SSO before approval" },
}

// ─── Create Account Dialog ─────────────────────────────────────────────────────

const MAIN_ACCOUNT = INITIAL_ACCOUNTS.find((a) => a.isMain)!
const URL_SUFFIX = `.${MAIN_ACCOUNT.url}`

function CreateAccountDialog({ onCreated }: { onCreated: (a: Account) => void }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [subdomain, setSubdomain] = React.useState("")

  function reset() { setName(""); setSubdomain("") }

  function handleCreate() {
    onCreated({
      id: String(Date.now()),
      name,
      isMain: false,
      url: `${subdomain}${URL_SUFFIX}`,
      contact: "",
      created: new Date().toISOString().slice(0, 10),
      status: "Pending",
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <Button size="sm" onClick={() => setOpen(true)}>
        Create account
      </Button>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-[22px] font-semibold leading-7">Create account</DialogTitle>
        </DialogHeader>
        <DialogBody className="px-6 pt-5 pb-2 flex flex-col gap-5">
          {/* Account name */}
          <div className="flex w-[320px] flex-col gap-2">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nike APAC"
            />
          </div>

          {/* Account URL */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="account-url">Account URL</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Choose a custom URL for this account. Only letters, numbers, and hyphens.
            </p>
            <div className="flex items-center">
              <Input
                id="account-url"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())}
                placeholder={name ? name.toLowerCase().replace(/\s+/g, "-") : "my-account"}
                className="w-[320px] shrink-0 rounded-r-none border-r-0"
              />
              <span className="flex h-8 items-center rounded-r border border-border bg-muted px-3 text-sm text-accent-foreground whitespace-nowrap">
                {URL_SUFFIX}
              </span>
            </div>
          </div>

          {/* Account settings */}
          <div className="flex flex-col gap-2">
            <Label>Account settings</Label>
            <div className="rounded-md border border-border divide-y divide-border">
              {[
                { label: "Identity", detail: "Groups, SCIM, and user provisioning", icon: UserGroupIcon },
                { label: "Security", detail: "Network policies, token reports, authentication", icon: ShieldCheckIcon },
                { label: "Billing",   detail: "Subscription, usage, and payment",        icon: CreditCardIcon },
                { label: "Previews",  detail: "Enablement for feature previews",  icon: GiftIcon },
              ].map(({ label, detail, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between px-3 py-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3 pr-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Icon size={16} className="text-muted-foreground" />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-sm font-semibold text-foreground">{label}</span>
                      <span className="text-xs text-muted-foreground">{detail}</span>
                    </div>
                  </div>
                  <span className="text-sm text-accent-foreground">Inherited from {MAIN_ACCOUNT.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ToS */}
          <p className="text-sm text-accent-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>.
          </p>
        </DialogBody>
        <DialogFooter className="px-6 pt-3 pb-6">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" onClick={handleCreate} disabled={!name.trim() || !subdomain.trim()}>
            Create account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Accounts Table ────────────────────────────────────────────────────────────

function AccountsTable({ accounts }: { accounts: Account[] }) {
  return (
    <Table className="border-b border-border">
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead>Account name</TableHead>
          <TableHead>Custom URL</TableHead>
          <TableHead>Created</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
              No accounts found.
            </TableCell>
          </TableRow>
        )}
        {accounts.map((account) => {
          const { icon: Icon, className: iconClass, tooltip } = STATUS_META[account.status]
          return (
            <TableRow key={account.id}>
              <TableCell className="w-8">
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    <Icon size={14} className={iconClass} />
                  </TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span className="text-foreground">{account.name}</span>
                  {account.isMain && <span className="text-xs text-muted-foreground">Main</span>}
                </span>
              </TableCell>
              <TableCell>
                {account.url ? (
                  <a
                    href={`https://${account.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-normal text-foreground hover:underline"
                  >
                    {account.url}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-accent-foreground">{account.created}</TableCell>
              <TableCell>
                {account.status === "Pending" && (
                  <Button variant="outline" size="xs">Review</Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const [accounts, setAccounts] = React.useState<Account[]>(INITIAL_ACCOUNTS)
  const [filter, setFilter] = React.useState("")

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(filter.toLowerCase()) ||
    a.url.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <AppShell activeItem="accounts">
      <div className="flex flex-col gap-6 p-6">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Accounts</h1>
          <p className="text-sm text-muted-foreground max-w-[600px]">
            Accounts linked to your organization share unified billing, identity, and governance policies.
          </p>
        </div>

        {/* Filter + action */}
        <div className="flex items-center gap-2">
          <div className="relative w-[280px]">
            <Input
              placeholder="Filter accounts"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pr-8"
            />
            <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="ml-auto">
            <CreateAccountDialog onCreated={(a) => setAccounts((prev) => [...prev, a])} />
          </div>
        </div>

        <AccountsTable accounts={filtered} />

      </div>
    </AppShell>
  )
}
