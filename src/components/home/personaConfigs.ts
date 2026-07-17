// ─── Persona-aware homepage content ─────────────────────────────────────────
// Mocked personas for the prototype. Toggling the persona in the Prototype
// settings panel swaps the homepage widget content (cards, alerts, setup,
// Genie suggestions).
//
// Persona set + content is grounded in the "Persona-Defined Admin Roles" doc
// (customer evidence: JPMC, Mastercard, Disney, BASF, P&G, HSBC, Klarna).
// Key constraints from that doc:
//   • Security / Infra / FinOps roles must surface ZERO data access
//     (JPMC: security teams are "legally prohibited from having data access").

import type React from "react"
import {
  OfficeIcon,
  WorkspacesIcon,
  DollarIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UserGroupIcon,
  TagIcon,
  CloudIcon,
  ChartLineIcon,
  ChecklistIcon,
  KeyIcon,
  ModelsIcon,
} from "@/components/icons"

export type PersonaKey =
  | "org-admin"
  | "account-admin"
  | "security-admin"
  | "finops-admin"
  | "infra-admin"
  | "identity-admin"

export type ChangeTone = "success" | "warning" | "danger" | "muted"

// The micro-visual a card renders under its value:
//   • "trend"  — sparkline, for metrics that move over time (spend, users)
//   • "meter"  — filled track, for scores & ratios (DR 18/20, % of budget)
//   • "segment"— proportional stacked bar, for a breakdown that sums to a whole
//                (posture: passed vs. high/medium/low findings)
//   • "status" — row of dots, for small counts where health matters (accounts, resources)
//   • undefined — no visual; value + caption only (timestamps, point-in-time counts)
export type CardVisual = "trend" | "meter" | "segment" | "status"

export type SegmentKind = "passed" | "high" | "medium" | "low"

export type OverviewCard = {
  label: string
  value: string
  change?: string
  changeTone?: ChangeTone
  caption?: string
  href?: string
  // Which micro-visual to render. Defaults to none.
  visual?: CardVisual
  // For visual: "trend" — the sparkline series.
  spark?: number[]
  // For visual: "meter" — current value, its max, and an optional limit marker.
  meter?: { value: number; max: number; threshold?: number }
  // For visual: "segment" — proportional buckets that sum to a whole.
  segments?: { kind: SegmentKind; value: number; label?: string }[]
  // For visual: "status" — the dots to render (tone per item).
  status?: { tone: ChangeTone; label?: string }[]
}

export type AlertLevel = "urgent" | "warning" | "pending"

export type AttentionAlert = {
  id: string
  level: AlertLevel
  text: string
  href: string
  source: string
}

export type SetupStep = {
  id: string
  label: string
  href: string
  done?: boolean
}

export type QuickAction = {
  id: string
  label: string
  href: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
}

export type PersonaConfig = {
  label: string
  // Short description of who this admin is (shown in settings panel).
  blurb: string
  // Homepage H1 greeting, tuned to the role's focus.
  greeting: string
  cards: OverviewCard[]
  // "Needs attention" list — issues this persona can act on, most urgent first.
  alerts: AttentionAlert[]
  // "Finish setup" checklist — onboarding tasks scoped to this persona.
  // Shown for "new" accounts.
  setup: SetupStep[]
  // "Quick actions" — common tasks for this persona. Shown for "established"
  // accounts in place of the setup checklist.
  quickActions: QuickAction[]
  // Genie suggested-prompt chips shown under the command bar.
  geniePrompts: string[]
  // Read-only roles get view-only alerts and an export panel instead of setup.
  readOnly?: boolean
}

export const PERSONA_KEYS: PersonaKey[] = [
  "org-admin",
  "account-admin",
  "security-admin",
  "finops-admin",
  "infra-admin",
  "identity-admin",
]

export const DEFAULT_PERSONA: PersonaKey = "org-admin"

// Seeded PRNG + random walk so the spend trend has realistic intraday texture
// (many fine ticks, short runs that reverse) while staying deterministic across
// renders / SSR. Mirrors the sparkline generator on the home page.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildWalk(seed: number, shape: (t: number) => number, points = 64) {
  const rand = mulberry32(seed)
  let noise = 0
  const out: number[] = []
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    noise += (rand() - 0.5) * 0.5 - noise * 0.08
    out.push(shape(t) + noise)
  }
  return out
}

// Spend trend shared across personas that surface it — noisy climb over the month.
const SPEND_TREND = buildWalk(5150, (t) => 9.0 + Math.pow(t, 1.4) * 4.4)

// Active-users trend — steady onboarding growth with day-to-day churn.
const USERS_TREND = buildWalk(8420, (t) => 7.2 + t * 3.6)

export const PERSONA_CONFIGS: Record<PersonaKey, PersonaConfig> = {
  // ── Org admin (GLOBALORGADMIN — cross-account) ──────────────────────────
  "org-admin": {
    label: "Org admin",
    blurb: "Cross-account view of cost, accounts, and posture across the org.",
    greeting: "Manage your organization",
    cards: [
      { label: "Org spend", value: "$74.6K", change: "+34%", changeTone: "warning", caption: "vs. last month", href: "/cost", visual: "trend", spark: SPEND_TREND },
      { label: "Accounts", value: "4", change: "all healthy", changeTone: "success", caption: "network-isolated", href: "/accounts", visual: "status", status: [{ tone: "success" }, { tone: "success" }, { tone: "success" }, { tone: "success" }] },
      { label: "Security findings", value: "70%", change: "passed", changeTone: "success", caption: "passed org-wide", href: "/security", visual: "segment", segments: [{ kind: "passed", value: 70, label: "70% passed" }, { kind: "high", value: 12, label: "12% high-risk" }, { kind: "medium", value: 10, label: "10% medium" }, { kind: "low", value: 8, label: "8% low" }] },
    ],
    alerts: [
      { id: "budget",  level: "urgent",  text: "Account B forecast is 10% over budget",         href: "/cost",       source: "Budget alerts" },
      { id: "mfa",     level: "warning", text: "12 users org-wide have no MFA enrolled",         href: "/identities", source: "Account users" },
      { id: "access",  level: "pending", text: "3 access requests awaiting approval",            href: "/identities", source: "Access requests" },
      { id: "tokens",  level: "warning", text: "5 service principals have non-expiring tokens",  href: "/security",   source: "Service principals" },
    ],
    setup: [
      { id: "idp",     label: "Connect identity provider", href: "/identity-provider", done: true },
      { id: "admins",  label: "Assign admin roles",        href: "/accounts",          done: true },
      { id: "audit",   label: "Enable audit log delivery", href: "/settings" },
      { id: "budget",  label: "Set an org-wide budget",    href: "/cost" },
      { id: "billing", label: "Add billing information",   href: "/billing" },
    ],
    quickActions: [
      { id: "account",   label: "Create an account",      href: "/accounts",   icon: OfficeIcon },
      { id: "idp",       label: "Add identity provider",   href: "/identity-provider", icon: KeyIcon },
      { id: "budget",    label: "Review org spend",        href: "/cost",       icon: DollarIcon },
      { id: "posture",   label: "Check security posture",  href: "/security",   icon: ShieldCheckIcon },
    ],
    geniePrompts: [
      "Compare spend across all accounts",
      "Which accounts are over budget?",
      "Show security posture by account",
    ],
  },

  // ── Account admin ───────────────────────────────────────────────────────
  "account-admin": {
    label: "Account admin",
    blurb: "Full account management — workspaces, users, billing, and posture.",
    greeting: "Manage your account",
    cards: [
      { label: "Account spend", value: "$18.2K", change: "+34%", changeTone: "warning", caption: "vs. last month", href: "/cost", visual: "trend", spark: SPEND_TREND },
      { label: "Workspaces", value: "20", change: "+2", changeTone: "success", caption: "new this week", href: "/workspaces" },
      { label: "Security findings", value: "70%", change: "passed", changeTone: "success", caption: "passed this week", href: "/security", visual: "segment", segments: [{ kind: "passed", value: 70, label: "70% passed" }, { kind: "high", value: 12, label: "12% high-risk" }, { kind: "medium", value: 10, label: "10% medium" }, { kind: "low", value: 8, label: "8% low" }] },
    ],
    alerts: [
      { id: "mfa",    level: "urgent",  text: "12 users have no MFA enrolled",                       href: "/identities", source: "Account users" },
      { id: "cost",   level: "warning", text: "Prod-west workspace is approaching its budget limit", href: "/cost",       source: "Budget alerts" },
      { id: "access", level: "pending", text: "3 access requests awaiting approval",                 href: "/identities", source: "Access requests" },
      { id: "tokens", level: "warning", text: "5 service principals have non-expiring tokens",       href: "/security",   source: "Service principals" },
    ],
    setup: [
      { id: "idp",     label: "Connect identity provider", href: "/identity-provider", done: true },
      { id: "admins",  label: "Assign admin roles",        href: "/accounts",          done: true },
      { id: "audit",   label: "Enable audit log delivery", href: "/settings" },
      { id: "network", label: "Configure network access",  href: "/cloud-resources" },
      { id: "billing", label: "Add billing information",   href: "/billing" },
    ],
    quickActions: [
      { id: "workspace", label: "Create a workspace",  href: "/workspaces", icon: WorkspacesIcon },
      { id: "group",     label: "Create a group",      href: "/identities", icon: UserGroupIcon },
      { id: "budget",    label: "Review spend",        href: "/cost",       icon: DollarIcon },
      { id: "create-budget", label: "Create a budget", href: "/cost",       icon: DollarIcon },
    ],
    geniePrompts: [
      "Create a new workspace",
      "Who has account admin access?",
      "Show this month's spend",
    ],
  },

  // ── Security admin (control posture, ZERO data access) ──────────────────
  // Content modeled on the Security Hub prototype (/governance/security):
  // findings-passed score, severity counts, category scores, workspaces
  // needing attention, and control-based recommendations.
  "security-admin": {
    label: "Security admin",
    blurb: "Control posture, findings, and compliance across workspaces — no data access.",
    greeting: "Monitor your security posture",
    cards: [
      { label: "High-risk findings", value: "25", caption: "vs. 30 days ago", href: "/security" },
      { label: "MFA coverage", value: "98%", change: "+2%", changeTone: "success", caption: "users enrolled", href: "/identities", visual: "meter", meter: { value: 98, max: 100 } },
      { label: "Non-expiring tokens", value: "5", change: "needs review", changeTone: "warning", caption: "service principals", href: "/security", visual: "status", status: [{ tone: "warning" }, { tone: "warning" }, { tone: "warning" }, { tone: "warning" }, { tone: "warning" }] },
    ],
    alerts: [
      { id: "ingress",  level: "urgent",  text: "Restrictive ingress access policy is failing in 6 workspaces", href: "/security", source: "Network security" },
      { id: "ws-risk",  level: "urgent",  text: "dev-notebooks has 6 high-risk findings",                       href: "/security", source: "Workspaces at risk" },
      { id: "sso",      level: "warning", text: "Single sign-on (SSO) is not enabled in 3 workspaces",           href: "/security", source: "Identity & access" },
      { id: "dp-drop",  level: "warning", text: "Data protection posture dropped 1.4% this month",               href: "/security", source: "Data protection" },
    ],
    setup: [
      { id: "csp",      label: "Enable Compliance Security Profile", href: "/security", done: true },
      { id: "sso",      label: "Enforce single sign-on (SSO)",       href: "/security" },
      { id: "ingress",  label: "Set restrictive ingress policy",     href: "/security" },
      { id: "monitor",  label: "Enable enhanced security monitoring", href: "/security" },
    ],
    quickActions: [
      { id: "findings", label: "View security findings",    href: "/security", icon: ShieldCheckIcon },
      { id: "workspaces", label: "Review flagged workspaces", href: "/security", icon: WorkspacesIcon },
      { id: "policies", label: "Manage security policies",  href: "/security", icon: ShieldIcon },
    ],
    geniePrompts: [
      "Which controls are failing?",
      "Show high-risk findings by workspace",
      "How do I fix the ingress access policy?",
    ],
  },

  // ── FinOps admin (cost across accounts — Mastercard / JPMC) ─────────────
  "finops-admin": {
    label: "FinOps admin",
    blurb: "Spend, budgets, and usage attribution across accounts.",
    greeting: "Monitor your spend",
    cards: [
      { label: "Spend", value: "$18.2K", change: "+34%", changeTone: "warning", caption: "vs. last month", href: "/cost", visual: "trend", spark: SPEND_TREND },
      { label: "Forecast vs. budget", value: "110%", change: "$22K / $20K", changeTone: "danger", caption: "projected this month", href: "/cost", visual: "meter", meter: { value: 22, max: 22, threshold: 20 } },
      { label: "Untagged spend", value: "18%", change: "−4%", changeTone: "success", caption: "of usage this month", href: "/tags", visual: "meter", meter: { value: 18, max: 100 } },
    ],
    alerts: [
      { id: "budget",   level: "urgent",  text: "Forecast is 10% over this month's budget",            href: "/cost", source: "Budget alerts" },
      { id: "cost",     level: "warning", text: "Prod-west workspace is approaching its budget limit",  href: "/cost", source: "Budget alerts" },
      { id: "untagged", level: "warning", text: "18% of spend is untagged and unattributed",            href: "/tags", source: "Tags" },
      { id: "spike",    level: "pending", text: "Serverless SQL spend up 34% week over week",           href: "/cost", source: "Usage" },
    ],
    setup: [
      { id: "budget",     label: "Set up budget alerts",       href: "/cost", done: true },
      { id: "tags",       label: "Define a tagging policy",     href: "/tags" },
      { id: "chargeback", label: "Configure chargeback tags",   href: "/tags" },
      { id: "export",     label: "Set up usage export",         href: "/cost" },
    ],
    quickActions: [
      { id: "budget",    label: "Create a budget",        href: "/cost", icon: DollarIcon },
      { id: "ai-spend",  label: "View AI Gateway spend",  href: "/ai",   icon: ModelsIcon },
      { id: "tags",      label: "Manage tags",            href: "/tags", icon: TagIcon },
    ],
    geniePrompts: [
      "Break down cost by workspace",
      "Why did spend spike 34%?",
      "Show untagged usage this month",
    ],
  },

  // ── Infra / Ops admin (cluster/job/pipeline status, NO data) ────────────
  "infra-admin": {
    label: "Infra/Ops admin",
    blurb: "Workspaces, cloud resources, jobs, and resilience — no data access.",
    greeting: "Manage your infrastructure",
    cards: [
      { label: "Workspaces", value: "20", change: "+2", changeTone: "success", caption: "new this week", href: "/workspaces" },
      { label: "Cloud resources", value: "1", change: "needs attention", changeTone: "warning", caption: "network misconfigured", href: "/cloud-resources", visual: "status", status: [{ tone: "warning", label: "1 needs attention" }] },
      { label: "DR coverage", value: "18/20", change: "2 uncovered", changeTone: "warning", caption: "workspaces backed up", href: "/resilience", visual: "meter", meter: { value: 18, max: 20 } },
    ],
    alerts: [
      { id: "network", level: "urgent",  text: "Prod-west network is misconfigured",            href: "/cloud-resources", source: "Cloud resources" },
      { id: "jobs",    level: "urgent",  text: "8 job runs failed in the last 24 hours",        href: "/workspaces",      source: "Job runs" },
      { id: "dr",      level: "warning", text: "2 workspaces have no disaster-recovery backup",  href: "/resilience",      source: "Resilience" },
      { id: "quota",   level: "warning", text: "us-east-1 is at 85% of its compute quota",      href: "/cloud-resources", source: "Cloud resources" },
    ],
    setup: [
      { id: "network",   label: "Configure network access",     href: "/cloud-resources", done: true },
      { id: "workspace", label: "Create your first workspace",   href: "/workspaces",      done: true },
      { id: "dr",        label: "Enable disaster recovery",      href: "/resilience" },
      { id: "storage",   label: "Connect cloud storage",         href: "/cloud-resources" },
    ],
    quickActions: [
      { id: "workspace", label: "Create a workspace",   href: "/workspaces",      icon: WorkspacesIcon },
      { id: "jobs",      label: "View failed jobs",      href: "/workspaces",      icon: ChartLineIcon },
      { id: "storage",   label: "Connect cloud storage", href: "/cloud-resources", icon: CloudIcon },
      { id: "dr",        label: "Check DR coverage",     href: "/resilience",      icon: ShieldIcon },
    ],
    geniePrompts: [
      "Show failed jobs across workspaces",
      "Which clusters are unhealthy?",
      "What's my compute quota usage?",
    ],
  },

  // ── Identity admin (NEW — Mastercard multi-IDP / SCIM) ──────────────────
  "identity-admin": {
    label: "Identity admin",
    blurb: "User provisioning, IDP sync, and group management — no full admin.",
    greeting: "Manage identities and access",
    cards: [
      { label: "Active users", value: "1,247", change: "+23", changeTone: "success", caption: "this week", href: "/identities", visual: "trend", spark: USERS_TREND },
      { label: "New users", value: "23", change: "+23", changeTone: "success", caption: "this week", href: "/identities", visual: "trend", spark: USERS_TREND },
      { label: "SCIM sync", value: "1 of 2", change: "1 failing", changeTone: "danger", caption: "identity providers", href: "/identity-provider", visual: "status", status: [{ tone: "success", label: "Primary IDP synced" }, { tone: "danger", label: "Acquired-entity IDP failing" }] },
    ],
    alerts: [
      { id: "scim",    level: "urgent",  text: "SCIM sync failing for the acquired-entity IDP",   href: "/identity-provider", source: "Identity provider" },
      { id: "access",  level: "warning", text: "3 access requests awaiting approval",              href: "/identities",        source: "Access requests" },
      { id: "stale",   level: "warning", text: "14 users deprovisioned in IDP but still active",   href: "/identities",        source: "Account users" },
      { id: "guests",  level: "pending", text: "6 guest accounts are not assigned to a group",     href: "/identities",        source: "Groups" },
    ],
    setup: [
      { id: "idp",     label: "Connect primary identity provider", href: "/identity-provider", done: true },
      { id: "idp2",    label: "Add second IDP for acquisition",    href: "/identity-provider" },
      { id: "scim",    label: "Configure SCIM provisioning",       href: "/identity-provider" },
      { id: "groups",  label: "Set up group mappings",             href: "/identities" },
    ],
    quickActions: [
      { id: "idp",      label: "Add identity provider",  href: "/identity-provider", icon: KeyIcon },
      { id: "group",    label: "Create a group",          href: "/identities",        icon: UserGroupIcon },
      { id: "scim",     label: "Manage SCIM sync",        href: "/identity-provider", icon: KeyIcon },
      { id: "requests", label: "Review access requests",  href: "/identities",        icon: ChecklistIcon },
    ],
    geniePrompts: [
      "Add a user",
      "Set up SCIM for a new identity provider",
      "Which users aren't syncing from our directory?",
    ],
  },
}
