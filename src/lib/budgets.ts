// Mock budgets — shared between the Cost → Budgets table and the budget detail page.
// A budget tracks month-to-date spend against a limit, with escalating alert thresholds
// (each notifying a set of recipients) and a scope of workspaces/tags. Prototype data.

export type BudgetStatus = "On track" | "At risk" | "Exhausted"

export type BudgetThreshold = {
  amount: number
  recipients: string[]
}

export type Budget = {
  id: string
  name: string
  scope: string
  period: "Monthly" | "Quarterly"
  used: number
  limit: number
  status: BudgetStatus
  workspaces: string
  tags: string[]
  permissions: string
  thresholds: BudgetThreshold[]
  /** Daily cumulative MTD spend series ($), for the detail chart. */
  spendSeries: number[]
}

function statusFor(used: number, limit: number): BudgetStatus {
  const pct = used / limit
  if (pct >= 1) return "Exhausted"
  if (pct >= 0.8) return "At risk"
  return "On track"
}

// A gently accelerating cumulative-spend curve scaled to end near `used`.
function cumulativeSeries(used: number, days = 18): number[] {
  return Array.from({ length: days }, (_, i) => {
    const t = (i + 1) / days
    return Math.round(used * Math.pow(t, 1.25))
  })
}

// Alert thresholds at ~75% / 90% / 100% of the limit, with recipient lists.
function thresholdsFor(limit: number): BudgetThreshold[] {
  return [
    { amount: Math.round(limit * 0.75 * 100) / 100, recipients: ["mike.brown@dataanalytics.com"] },
    { amount: Math.round(limit * 0.9 * 100) / 100, recipients: ["lisa.chen@platform.co", "nina.zhao@dataops.com"] },
    { amount: Math.round(limit * 1.0 * 100) / 100, recipients: ["mike.brown@dataanalytics.com"] },
  ]
}

type Seed = {
  id: string
  name: string
  scope: string
  period: "Monthly" | "Quarterly"
  used: number
  limit: number
  workspaces: string
  tags: string[]
  permissions: string
}

const SEEDS: Seed[] = [
  { id: "engineering-org", name: "Engineering Org Budget", scope: "All workspaces · Monthly", period: "Monthly", used: 32457, limit: 24343, workspaces: "All workspaces", tags: ["business-unit: Cloud Services"], permissions: "Account admins" },
  { id: "production-compute", name: "Production compute", scope: "analytics-prod · Monthly", period: "Monthly", used: 84200, limit: 100000, workspaces: "analytics-prod", tags: ["team: Platform"], permissions: "Account admins" },
  { id: "ml-serving", name: "ML Serving", scope: "ml-platform · Monthly", period: "Monthly", used: 61500, limit: 60000, workspaces: "ml-platform-prod", tags: ["team: ML"], permissions: "Account admins" },
  { id: "data-engineering", name: "Data engineering", scope: "data-eng · Monthly", period: "Monthly", used: 38900, limit: 75000, workspaces: "data-eng-prod", tags: ["team: Data Eng"], permissions: "Account admins" },
  { id: "bi-reporting", name: "BI & reporting", scope: "bi-reporting · Quarterly", period: "Quarterly", used: 142000, limit: 150000, workspaces: "bi-reporting", tags: ["business-unit: Finance"], permissions: "Account admins" },
  { id: "sandbox-dev", name: "Sandbox & dev", scope: "All dev workspaces · Monthly", period: "Monthly", used: 12100, limit: 20000, workspaces: "All dev workspaces", tags: ["env: dev"], permissions: "Workspace admins" },
  { id: "ai-gateway", name: "AI Gateway", scope: "Account-wide · Monthly", period: "Monthly", used: 7400, limit: 10000, workspaces: "All workspaces", tags: ["service: AI Gateway"], permissions: "Account admins" },
]

export const BUDGETS: Budget[] = SEEDS.map((s) => ({
  ...s,
  status: statusFor(s.used, s.limit),
  thresholds: thresholdsFor(s.limit),
  spendSeries: cumulativeSeries(s.used),
}))

export function getBudget(id: string): Budget | undefined {
  return BUDGETS.find((b) => b.id === id)
}

export function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
