"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "@/lib/utils"

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
  { id: "main",    name: "Nike",             isMain: true,  url: "nike.databricks.com",         contact: "admin@nike.com",      created: "2024-06-15", status: "Active" },
  { id: "emea",    name: "Nike EMEA",        isMain: false, url: "nike-emea.databricks.com",    contact: "emea-admin@nike.com", created: "2025-03-01", status: "Active" },
  { id: "ds",      name: "Nike Data Science",isMain: false, url: "nike-ds.databricks.com",      contact: "ds-team@nike.com",    created: "2025-08-12", status: "Active" },
  { id: "sandbox", name: "Nike Sandbox",     isMain: false, url: "nike-sandbox.databricks.com", contact: "sandbox@nike.com",    created: "2026-04-30", status: "Pending" },
]

const STATUS_META: Record<AccountStatus, { icon: React.ComponentType<{ size?: number; className?: string }>; className: string; tooltip: string }> = {
  Active:     { icon: CheckCircleIcon, className: "text-[var(--success)]", tooltip: "Active — in organization" },
  Unverified: { icon: XCircleIcon,     className: "text-[var(--warning)]", tooltip: "Unverified — needs attention" },
  Pending:    { icon: DotsCircleIcon,  className: "text-muted-foreground", tooltip: "Pending approval before joining the organization" },
}

type SettingDiffResult = "override" | "retained" | "attention"

type SettingDiff = {
  category: string
  setting: string
  currentValue: string
  mainValue: string
  result: SettingDiffResult
  action: string
}

const SETTING_CHECKLIST_TEMPLATE: SettingDiff[] = [
  {
    category: "Accounts",
    setting: "Account creation",
    currentValue: "Available in the account",
    mainValue: "Managed from the organization",
    result: "override",
    action: "No action needed. New account creation moves to the organization.",
  },
  {
    category: "Identity and Access Management",
    setting: "User identity",
    currentValue: "Managed in the account",
    mainValue: "Managed uniformly at the organization",
    result: "override",
    action: "No action needed. Users defer to organization-level identity settings.",
  },
  {
    category: "Identity and Access Management",
    setting: "Groups",
    currentValue: "Account-scoped groups",
    mainValue: "Organization groups apply across member accounts",
    result: "retained",
    action: "No action needed. Account groups remain scoped to this account.",
  },
  {
    category: "Security",
    setting: "SCIM, authentication, and user provisioning",
    currentValue: "Configured in the account",
    mainValue: "Inherited from the organization",
    result: "override",
    action: "No action needed. Replaced by main account settings on approval.",
  },
  {
    category: "Security",
    setting: "Token management and reports",
    currentValue: "Available in the account",
    mainValue: "Available in the account",
    result: "retained",
    action: "No action needed. Token management and reports remain available at account level.",
  },
  {
    category: "Settings",
    setting: "Billing",
    currentValue: "Managed in the account",
    mainValue: "Universal commit managed at the organization",
    result: "override",
    action: "No action needed. Billing moves under organization-level management.",
  },
  {
    category: "Settings",
    setting: "Custom URLs and non-billing settings",
    currentValue: "Account-level settings",
    mainValue: "Account-level settings",
    result: "retained",
    action: "No action needed. Non-billing settings remain available at account level.",
  },
  {
    category: "Cost Governance Hub",
    setting: "Budgets",
    currentValue: "Per-account budgets",
    mainValue: "Organization budgets inherited across accounts",
    result: "override",
    action: "No action needed. Organization budgets are inherited on approval.",
  },
  {
    category: "Cost Governance Hub",
    setting: "Cost and usage view",
    currentValue: "Per-account view",
    mainValue: "Organization aggregate plus per-account view",
    result: "retained",
    action: "No action needed. The account can still view its own cost and usage.",
  },
  {
    category: "Data and Security Governance Hub",
    setting: "Governance view",
    currentValue: "Per-account view",
    mainValue: "Organization aggregate plus per-account view",
    result: "retained",
    action: "No action needed. Per-account governance views remain available.",
  },
  {
    category: "Network Securities and Policies",
    setting: "Org-enforced network policies",
    currentValue: "Managed in the account unless enforced",
    mainValue: "Organization can enforce policies top-down",
    result: "override",
    action: "No action needed when organization enforcement is enabled.",
  },
  {
    category: "Network Securities and Policies",
    setting: "Account network configuration",
    currentValue: "Account-managed network config",
    mainValue: "Account-managed if not organization-enforced",
    result: "retained",
    action: "No action needed unless the organization enforces a conflicting policy.",
  },
  {
    category: "Previews",
    setting: "Org-enforced feature previews",
    currentValue: "Managed in the account unless enforced",
    mainValue: "Organization can enable or disable previews across accounts",
    result: "override",
    action: "No action needed when organization enforcement is enabled.",
  },
  {
    category: "Previews",
    setting: "Account-managed feature previews",
    currentValue: "May differ from organization defaults",
    mainValue: "Retained if not organization-enforced",
    result: "attention",
    action: "If this differs from policy, change in source account: Account settings > Previews.",
  },
]

function buildSettingChecklist(account: Account): SettingDiff[] {
  return SETTING_CHECKLIST_TEMPLATE.map((diff) => {
    if (diff.setting === "Custom URLs and non-billing settings") {
      return {
        ...diff,
        currentValue: account.url,
        mainValue: account.url,
      }
    }

    return diff
  })
}

const DIFF_RESULT_META: Record<SettingDiffResult, { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }> = {
  override: { label: "Org behavior", variant: "secondary" },
  retained: { label: "Retained", variant: "outline" },
  attention: { label: "Needs attention", variant: "lemon" },
}

/** Main account first, then pending (triage), then alphabetical by name. */
function sortAccountsForAdmin(rows: Account[]) {
  return [...rows].sort((a, b) => {
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1
    const pri = (s: AccountStatus) => (s === "Pending" ? 0 : 1)
    if (pri(a.status) !== pri(b.status)) return pri(a.status) - pri(b.status)
    return a.name.localeCompare(b.name)
  })
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
              Choose a custom URL for this account.
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
            <div className="rounded-md border border-border">
              {[
                { label: "Identity", detail: "Groups, SCIM, and user provisioning", icon: UserGroupIcon },
                { label: "Security", detail: "Network policies, token reports, authentication", icon: ShieldCheckIcon },
                { label: "Billing",   detail: "Subscription, usage, and payment",        icon: CreditCardIcon },
                { label: "Previews",  detail: "Enablement for feature previews",  icon: GiftIcon },
              ].map(({ label, detail, icon: Icon }, index) => (
                <div
                  key={label}
                  className={cn(
                    "relative flex items-center justify-between px-3 py-3",
                    index > 0 && "before:absolute before:left-3 before:right-3 before:top-0 before:h-px before:bg-border"
                  )}
                >
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

// ─── Review account ────────────────────────────────────────────────────────────

function ReviewAccountDialog({
  account,
  open,
  onOpenChange,
  onApprove,
}: {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: () => void
}) {
  const [step, setStep] = React.useState<"verify" | "compare">("verify")
  const [manualChangesConfirmed, setManualChangesConfirmed] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setStep("verify")
      setManualChangesConfirmed(false)
    }
  }, [open])

  const settingChecklist = React.useMemo(
    () => (account ? buildSettingChecklist(account) : []),
    [account],
  )
  const overrides = settingChecklist.filter((diff) => diff.result === "override").length
  const retained = settingChecklist.filter((diff) => diff.result === "retained").length
  const needsAttention = settingChecklist.filter((diff) => diff.result === "attention").length
  const manualChanges = settingChecklist.filter((diff) => diff.result === "attention")
  const canApprove = manualChanges.length === 0 || manualChangesConfirmed

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={step === "compare" ? "sm:max-w-[760px]" : "sm:max-w-[480px]"}>
        <DialogHeader className="px-6 pt-4 pb-0">
          <DialogTitle className="text-[22px] font-semibold leading-7">
            {step === "compare" ? "Review settings checklist" : "Review account"}
          </DialogTitle>
        </DialogHeader>
        {account && step === "verify" && (
          <DialogBody className="px-6 pt-4 pb-4 flex flex-col gap-4">
            <p className="text-sm text-accent-foreground">
              Verify ownership with your identity provider before approving this account for unified billing and governance.
            </p>
            <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 px-3 py-3">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-accent-foreground shrink-0">Name</span>
                <span className="font-semibold text-accent-foreground text-right">{account.name}</span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-accent-foreground shrink-0">Custom URL</span>
                <span className="text-accent-foreground text-right break-all">{account.url}</span>
              </div>
              {account.contact ? (
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-accent-foreground shrink-0">Contact</span>
                  <span className="text-accent-foreground text-right break-all">{account.contact}</span>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-accent-foreground shrink-0">Requested</span>
                <span className="text-accent-foreground">{account.created}</span>
              </div>
            </div>
          </DialogBody>
        )}
        {account && step === "compare" && (
          <DialogBody className="px-6 pt-4 pb-4 flex max-h-[64vh] flex-col gap-4 overflow-y-auto">
            <p className="text-sm text-accent-foreground">
              {account.name} is verified. This checklist reflects the latest differences between this account and {MAIN_ACCOUNT.name}.
            </p>

            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5">
              {needsAttention > 0 && (
                <Badge variant="lemon">{needsAttention} need{needsAttention === 1 ? "s" : ""} review</Badge>
              )}
              <Badge variant="secondary">{overrides} will use org behavior</Badge>
              <Badge variant="outline">{retained} retained at account level</Badge>
            </div>

            {manualChanges.length > 0 ? (
              <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 px-3 py-3">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-semibold text-accent-foreground">Review before approval</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {manualChanges.map((diff) => (
                    <div key={`${diff.category}-${diff.setting}`} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-accent-foreground">{diff.setting}</span>
                        <Badge variant={DIFF_RESULT_META[diff.result].variant}>
                          {DIFF_RESULT_META[diff.result].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-accent-foreground">
                        Current behavior: {diff.currentValue}. {diff.action}{" "}
                        {diff.action.includes("Account settings") && (
                          <a href="#" className="text-primary hover:underline">Open account settings →</a>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="manual-confirm"
                    checked={manualChangesConfirmed}
                    onCheckedChange={(v) => setManualChangesConfirmed(!!v)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="manual-confirm" className="font-normal text-sm text-accent-foreground leading-snug cursor-pointer">
                    I’ve reviewed these items and made any required changes in the source account.
                  </Label>
                </div>
              </div>
            ) : null}

            <Accordion type="single" collapsible className="rounded-md border border-border">
              <AccordionItem value="automatic-changes">
                <AccordionTrigger className="px-3 py-3 text-accent-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span>View full settings checklist</span>
                    <span className="text-xs font-normal text-accent-foreground">
                      {settingChecklist.length} setting{settingChecklist.length !== 1 ? "s" : ""}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-accent-foreground">Domain</TableHead>
                        <TableHead className="text-accent-foreground">Setting</TableHead>
                        <TableHead className="text-accent-foreground">Current behavior</TableHead>
                        <TableHead className="text-accent-foreground">Organization behavior</TableHead>
                        <TableHead className="text-accent-foreground">Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settingChecklist.map((diff) => {
                        const meta = DIFF_RESULT_META[diff.result]
                        const currentValue = diff.setting === "Custom URL" ? account.url : diff.currentValue
                        const mainValue = diff.setting === "Custom URL" ? account.url : diff.mainValue

                        return (
                          <TableRow
                            key={`${diff.category}-${diff.setting}`}
                            className={diff.result === "attention" ? "bg-[var(--background-warning)]" : undefined}
                          >
                            <TableCell className="text-accent-foreground">{diff.category}</TableCell>
                            <TableCell className="text-accent-foreground">{diff.setting}</TableCell>
                            <TableCell className="text-accent-foreground">{currentValue}</TableCell>
                            <TableCell className="text-accent-foreground">{mainValue}</TableCell>
                            <TableCell>
                              <Badge variant={meta.variant}>{meta.label}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </DialogBody>
        )}
        <DialogFooter className="px-6 pt-2 pb-6">
          {step === "verify" ? (
            <>
              <DialogClose asChild>
                <Button variant="outline" size="sm">Cancel</Button>
              </DialogClose>
              <Button
                size="sm"
                disabled={!account}
                onClick={() => setStep("compare")}
              >
                Sign in with Okta
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep("verify")}>
                Back
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={!canApprove ? 0 : undefined}>
                    <Button
                      size="sm"
                      disabled={!account || !canApprove}
                      onClick={() => {
                        onApprove()
                      }}
                    >
                      Approve and apply main settings
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canApprove && (
                  <TooltipContent>Check the box above to confirm you have reviewed manual changes</TooltipContent>
                )}
              </Tooltip>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Accounts Table ────────────────────────────────────────────────────────────

function AccountsTable({
  accounts,
  emptyMessage,
  onDrillIn,
}: {
  accounts: Account[]
  emptyMessage: string
  onDrillIn?: (id: string) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead>Account name</TableHead>
          <TableHead>Custom URL</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
        {accounts.map((account) => {
          const { icon: Icon, className: iconClass, tooltip } = STATUS_META[account.status]
          return (
            <TableRow key={account.id}>
              <TableCell className="w-8">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center rounded p-0.5 hover:bg-muted/60"
                      aria-label={tooltip}
                    >
                      <Icon size={14} className={iconClass} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  {onDrillIn ? (
                    <button
                      onClick={() => onDrillIn(account.id)}
                      className="text-primary hover:underline text-left"
                    >
                      {account.name}
                    </button>
                  ) : (
                    <span className="text-foreground">{account.name}</span>
                  )}
                  {account.isMain ? (
                    <span className="text-xs text-muted-foreground">Main</span>
                  ) : null}
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
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function AccountsContent({ onDrillIn }: { onDrillIn?: (id: string) => void } = {}) {
  const [accounts, setAccounts] = React.useState<Account[]>(INITIAL_ACCOUNTS)
  const [filter, setFilter] = React.useState("")
  const [reviewAccount, setReviewAccount] = React.useState<Account | null>(null)

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return accounts
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.url.toLowerCase().includes(q) ||
        (a.contact && a.contact.toLowerCase().includes(q)),
    )
  }, [accounts, filter])

  const displayRows = React.useMemo(() => sortAccountsForAdmin(filtered), [filtered])

  const emptyMessage =
    accounts.length === 0
      ? "No accounts yet. Create one to get started."
      : "No accounts match your filters."

  function handleApproveReviewed() {
    if (!reviewAccount) return
    setAccounts((prev) =>
      prev.map((a) => (a.id === reviewAccount.id ? { ...a, status: "Active" as const } : a)),
    )
    setReviewAccount(null)
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1000px] w-full mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Accounts</h1>
        <p className="text-sm text-muted-foreground max-w-[600px]">
          Accounts linked to your organization share unified billing, identity, and governance policies.
        </p>
      </div>

      {/* Filter + action */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-4">
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
      </div>

      <AccountsTable
        accounts={displayRows}
        emptyMessage={emptyMessage}
        onDrillIn={onDrillIn}
      />

      <ReviewAccountDialog
        account={reviewAccount}
        open={!!reviewAccount}
        onOpenChange={(o) => {
          if (!o) setReviewAccount(null)
        }}
        onApprove={handleApproveReviewed}
      />

    </div>
  )
}

export default function AccountsPage() {
  return (
    <AppShell activeItem="accounts">
      <AccountsContent />
    </AppShell>
  )
}
