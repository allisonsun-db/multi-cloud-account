// Mock data for the account-level Ontology monitoring page (see [PRD] Ontology
// Monitoring). Everything is static; the domain picker reshapes numbers through
// lib/scope-data so a selection redraws deterministically.

export type Domain = { id: string; name: string }

export const DOMAINS: Domain[] = [
  { id: "sales",            name: "Sales" },
  { id: "finance",          name: "Finance" },
  { id: "supply-chain",     name: "Supply Chain" },
  { id: "marketing",        name: "Marketing" },
  { id: "customer-support", name: "Customer Support" },
  { id: "people",           name: "People & HR" },
]

export function domainName(id: string) {
  return DOMAINS.find((d) => d.id === id)?.name ?? id
}

// ─── Overview ──────────────────────────────────────────────────────────────────

// Ontology assets — what Genie knows. Connections (search indexes, MCP servers,
// connectors) are the other half of the inventory; their counts and status derive from
// INITIAL_SOURCES so they always match the Sources & connectors tab.
export type ObjectKind = "snippets" | "pages" | "assets"

export type OntologyObject = {
  kind: ObjectKind
  label: string
  total: number
  /** Certifiable objects only (pages, metric views). */
  certified?: number
  /** Monthly totals, oldest → newest (matches TREND_MONTHS). */
  trend: number[]
}

export const TREND_MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]

export const ONTOLOGY_OBJECTS: OntologyObject[] = [
  { kind: "snippets", label: "Snippets",           total: 4812,                trend: [620, 1310, 2080, 2950, 3920, 4812] },
  { kind: "pages",    label: "Pages",              total: 386,  certified: 142, trend: [41, 88, 152, 231, 318, 386] },
  { kind: "assets",   label: "Metric views",       total: 112,  certified: 47,  trend: [14, 31, 52, 70, 93, 112] },
]

// Snippet sources — source assets Genie harvests snippets from. Many assets can feed
// one snippet, so these counts are much larger than the snippet total. Type names and
// shares come from the Genie Ontology PuPr dashboard (fleet-wide, Oct 1, 2026);
// ACCOUNT_SOURCE_ASSETS is a PLACEHOLDER account-scale total — no real per-account
// source yet.
export const ACCOUNT_SOURCE_ASSETS = 418_000

export const SNIPPET_SOURCE_SHARES: { type: string; sharePct: number; thirdParty?: boolean }[] = [
  { type: "Notebook",      sharePct: 63.4 },
  { type: "Dashboard",     sharePct: 12.7 },
  { type: "Genie Agents",  sharePct: 8.9 },
  { type: "View",          sharePct: 7.0 },
  { type: "Metric view",   sharePct: 4.2 },
  { type: "Saved query",   sharePct: 2.3 },
  { type: "Query history", sharePct: 1.4 },
  { type: "Power BI",      sharePct: 0.03, thirdParty: true },
]

// Inventory by domain — demand (questions asked) and how much of it curated knowledge
// grounds. Object counts sum to the ONTOLOGY_OBJECTS totals.
export type Coverage = "good" | "gap" | "no-curator"

export type DomainInventory = {
  domain: string
  questions30d: number
  /** Share of questions answered from curated knowledge (pages, certified assets). */
  groundedPct: number
  /** Median seconds to answer — PLACEHOLDER mock values, no real source yet. */
  answerSec: { grounded: number; ungrounded: number }
  pages: number
  assets: number
  snippets: number
  agents: number
  coverage: Coverage
  coverageDetail?: string
}

export const DOMAIN_INVENTORY: DomainInventory[] = [
  { domain: "sales",            questions30d: 2140, groundedPct: 81, answerSec: { grounded: 3.9, ungrounded: 10.8 }, pages: 128, assets: 34, snippets: 1460, agents: 16, coverage: "good" },
  { domain: "finance",          questions30d: 1620, groundedPct: 76, answerSec: { grounded: 4.1, ungrounded: 12.6 }, pages: 104, assets: 31, snippets: 1180, agents: 14, coverage: "good" },
  { domain: "customer-support", questions30d: 1380, groundedPct: 22, answerSec: { grounded: 4.8, ungrounded: 13.9 }, pages: 22,  assets: 6,  snippets: 610,  agents: 6,  coverage: "gap",        coverageDetail: "“Customer churn” asked 527× · no page" },
  { domain: "supply-chain",     questions30d: 760, groundedPct: 84, answerSec: { grounded: 3.6, ungrounded: 9.7 },  pages: 96,  assets: 28, snippets: 1010, agents: 13, coverage: "good" },
  { domain: "marketing",        questions30d: 910, groundedPct: 18, answerSec: { grounded: 5.2, ungrounded: 12.2 },  pages: 18,  assets: 7,  snippets: 372,  agents: 4,  coverage: "no-curator", coverageDetail: "“Campaign ROI” asked 212× · no domain expert" },
  { domain: "people",           questions30d: 240, groundedPct: 45, answerSec: { grounded: 4.4, ungrounded: 10.1 },  pages: 18,  assets: 6,  snippets: 180,  agents: 4,  coverage: "no-curator", coverageDetail: "No domain expert assigned" },
]

// Account-wide median answer time. A true median can't be derived from per-domain
// medians, so this is its own value — PLACEHOLDER mock, no real source yet.
export const ACCOUNT_ANSWER_SEC = { grounded: 4.1, ungrounded: 11.6 }

// Top question topics per domain (single-domain view of the inventory card).
export const DOMAIN_TOPICS: Record<string, { topic: string; questions: number; curated: boolean }[]> = {
  "sales": [
    { topic: "Pipeline coverage",     questions: 412, curated: true },
    { topic: "Quota attainment",      questions: 356, curated: true },
    { topic: "Win rate by segment",   questions: 298, curated: false },
    { topic: "Bookings vs. billings", questions: 241, curated: true },
    { topic: "Discount approvals",    questions: 133, curated: true },
  ],
  "finance": [
    { topic: "Revenue recognition", questions: 388, curated: true },
    { topic: "Opex by cost center", questions: 301, curated: true },
    { topic: "Cash runway",         questions: 214, curated: false },
    { topic: "Gross margin by SKU", questions: 190, curated: true },
  ],
  "customer-support": [
    { topic: "Customer churn",       questions: 527, curated: false },
    { topic: "First response time",  questions: 318, curated: true },
    { topic: "Ticket backlog",       questions: 244, curated: false },
    { topic: "CSAT by product",      questions: 162, curated: false },
  ],
  "supply-chain": [
    { topic: "Inventory turns",     questions: 204, curated: true },
    { topic: "Late shipment rate",  questions: 188, curated: true },
    { topic: "Supplier lead time",  questions: 141, curated: true },
    { topic: "Forecast accuracy",   questions: 97,  curated: false },
  ],
  "marketing": [
    { topic: "Campaign ROI",        questions: 212, curated: false },
    { topic: "MQL to SQL rate",     questions: 176, curated: false },
    { topic: "Web traffic sources", questions: 133, curated: true },
  ],
  "people": [
    { topic: "Headcount by org", questions: 92, curated: true },
    { topic: "Attrition rate",   questions: 71, curated: false },
    { topic: "Time to hire",     questions: 44, curated: false },
  ],
}

// Weekly zero-result rate (% of search API calls that returned nothing), last 12 weeks.
export const ZERO_RESULT_WEEKS = [
  "Jul 19", "Jul 26", "Aug 2", "Aug 9", "Aug 16", "Aug 23",
  "Aug 30", "Sep 6", "Sep 13", "Sep 20", "Sep 27", "Oct 4",
]
export const ZERO_RESULT_RATE = [18.4, 17.9, 16.2, 15.8, 14.1, 13.6, 12.9, 11.4, 10.8, 9.7, 9.9, 8.6]

// Recommended setup steps — copy taken verbatim from the design. Scoped by metastore
// where a step applies; `metastoreStatus` marks which metastores have completed it.
export const METASTORES_FOR_SETUP = ["us-east-1", "eu-west-1", "ap-southeast-2"]

export type SetupStep = {
  id: string
  title: string
  scope: "Workspace" | "Metastore" | "Metastore + Workspace"
  availability: string
  description: string
  /** First sentence of `description`, shown in the compact panel (full text on hover). */
  summary: string
  /** Label before the metastore chips, e.g. "Certified" → "Certified in 2 of 3 metastores". */
  statusLabel?: string
  metastoreStatus?: Record<string, boolean>
  bullets?: { term: string; detail: string }[]
}

export const SETUP_STEPS: SetupStep[] = [
  {
    id: "snippets",
    summary: "Workspace admin toggle: Databricks auto-harvests existing dashboards, queries, Genie Agents, and metric views into ranked, permission-gated snippets.",
    title: "Enable Ontology Snippets (Inferred Context)",
    scope: "Workspace",
    availability: "Public Preview",
    description:
      "Workspace admin toggle: Databricks auto-harvests existing dashboards, queries, Genie Agents, and metric views into ranked, permission-gated snippets. Clean up Unity Catalog table and column descriptions first for the best results.",
  },
  {
    id: "metric-views",
    summary: "Create UC metric views manually or promote them from an AI/BI dashboard, then certify gold tables and key metric views so Genie steers toward the definitions you vouch for.",
    title: "Certify critical KPIs as Metric Views",
    scope: "Metastore",
    availability: "GA",
    description:
      "Create UC metric views manually or promote them from an AI/BI dashboard, then certify gold tables and key metric views so Genie steers toward the definitions you vouch for.",
    statusLabel: "Certified",
    metastoreStatus: { "us-east-1": true, "eu-west-1": true, "ap-southeast-2": false },
  },
  {
    id: "domains-pages",
    summary: "Group the estate by business area with Domains (Public Preview), then write Pages (Beta) to define key business concepts and terms alongside KPIs.",
    title: "Organize with Domains, then add Pages",
    scope: "Metastore + Workspace",
    availability: "Preview + Beta",
    description:
      "Group the estate by business area with Domains (Public Preview), then write Pages (Beta) to define key business concepts and terms alongside KPIs. Start with the highest-value areas.",
  },
  {
    id: "third-party",
    summary: "Give Genie business context through these paths.",
    title: "Connect 3rd-party context",
    scope: "Metastore",
    availability: "Preview",
    description: "Give Genie business context through these paths. Set up the ones the team uses:",
    statusLabel: "Set up",
    metastoreStatus: { "us-east-1": true, "eu-west-1": false, "ap-southeast-2": false },
    bullets: [
      { term: "Text2SQL over UC-governed data", detail: "the baseline. Genie writes SQL against governed tables, no extra connector needed." },
      { term: "MCP connectors", detail: "live lookups enforced with each user's own permissions (Slack, Jira, Confluence, GitHub, Glean)." },
      { term: "Search Index", detail: "higher-volume retrieval of indexed snippets across sources (Google Drive, Jira, Confluence)." },
      { term: "External Metadata Mirroring", detail: "if the team uses Power BI, sync its models, measures, and reports into Unity Catalog and the ontology." },
    ],
  },
  {
    id: "agents",
    summary: "Genie works on day one, even before you curate these semantics.",
    title: "Build Genie Agents and start using Genie",
    scope: "Workspace",
    availability: "Available now",
    description:
      "Genie works on day one, even before you curate these semantics. Build focused agents (start with 5 or fewer tables), then iterate on real user feedback.",
  },
]

// ─── Governance & access ───────────────────────────────────────────────────────

export type DiscoveryGrant = {
  id: string
  name: string
  email: string
  /** "account" = all domains; otherwise the domain ids this user can curate. */
  scope: "account" | string[]
  grantedBy: string
  granted: string
  lastActivity: string
}

export const INITIAL_GRANTS: DiscoveryGrant[] = [
  { id: "g1",  name: "Priya Raman",     email: "priya.raman@omnimart.com",     scope: "account",                    grantedBy: "Account admin",   granted: "May 12, 2026", lastActivity: "2 hours ago" },
  { id: "g2",  name: "Marcus Chen",     email: "marcus.chen@omnimart.com",     scope: "account",                    grantedBy: "Priya Raman",     granted: "Jun 3, 2026",  lastActivity: "Yesterday" },
  { id: "g3",  name: "Data Platform",   email: "data-platform@omnimart.com",   scope: "account",                    grantedBy: "Account admin",   granted: "May 12, 2026", lastActivity: "3 days ago" },
  { id: "g4",  name: "Elena Vasquez",   email: "elena.vasquez@omnimart.com",   scope: ["sales"],                    grantedBy: "Priya Raman",     granted: "Jun 18, 2026", lastActivity: "1 hour ago" },
  { id: "g5",  name: "Tom Okafor",      email: "tom.okafor@omnimart.com",      scope: ["finance"],                  grantedBy: "Marcus Chen",     granted: "Jul 2, 2026",  lastActivity: "Today" },
  { id: "g6",  name: "Hannah Lee",      email: "hannah.lee@omnimart.com",      scope: ["supply-chain"],             grantedBy: "Priya Raman",     granted: "Jul 9, 2026",  lastActivity: "4 days ago" },
  { id: "g7",  name: "Raj Patel",       email: "raj.patel@omnimart.com",       scope: ["sales", "finance"],         grantedBy: "Marcus Chen",     granted: "Aug 1, 2026",  lastActivity: "Today" },
  { id: "g8",  name: "Eric Johansson",  email: "eric.johansson@omnimart.com",  scope: ["finance", "supply-chain"],  grantedBy: "Raj Patel",       granted: "Sep 22, 2026", lastActivity: "6 hours ago" },
  { id: "g9",  name: "Sofia Moretti",   email: "sofia.moretti@omnimart.com",   scope: ["supply-chain"],             grantedBy: "Hannah Lee",      granted: "Aug 14, 2026", lastActivity: "2 weeks ago" },
]

export type ContributionKind = "Page" | "Databricks asset" | "Table" | "Snippet"

export type Contribution = {
  name: string
  kind: ContributionKind
  domain: string
  certified?: boolean
  updated: string
}

export type Contributor = {
  id: string
  name: string
  email: string
  domains: string[]
  pages: number
  snippets: number
  assets: number
  tables: number
  /** Flag for the audit story — contributing outside their usual domain. */
  unusual?: string
  contributions: Contribution[]
}

export const CONTRIBUTORS: Contributor[] = [
  {
    id: "c1", name: "Elena Vasquez", email: "elena.vasquez@omnimart.com", domains: ["sales"],
    pages: 64, snippets: 812, assets: 22, tables: 31,
    contributions: [
      { name: "Pipeline coverage definition",      kind: "Page",             domain: "sales", certified: true, updated: "Oct 3, 2026" },
      { name: "Bookings vs. billings",             kind: "Page",             domain: "sales", certified: true, updated: "Sep 30, 2026" },
      { name: "sales_kpis (metric view)",          kind: "Databricks asset", domain: "sales", certified: true, updated: "Sep 28, 2026" },
      { name: "Regional quota attainment",         kind: "Databricks asset", domain: "sales", updated: "Sep 24, 2026" },
      { name: "main.sales.opportunities",          kind: "Table",            domain: "sales", certified: true, updated: "Sep 20, 2026" },
      { name: "ARR rollup logic",                  kind: "Snippet",          domain: "sales", updated: "Sep 19, 2026" },
    ],
  },
  {
    id: "c2", name: "Tom Okafor", email: "tom.okafor@omnimart.com", domains: ["finance"],
    pages: 51, snippets: 640, assets: 18, tables: 26,
    contributions: [
      { name: "Revenue recognition rules",         kind: "Page",             domain: "finance", certified: true, updated: "Oct 2, 2026" },
      { name: "finance_close (metric view)",       kind: "Databricks asset", domain: "finance", certified: true, updated: "Sep 29, 2026" },
      { name: "main.finance.gl_entries",           kind: "Table",            domain: "finance", certified: true, updated: "Sep 18, 2026" },
      { name: "Opex by cost center",               kind: "Snippet",          domain: "finance", updated: "Sep 12, 2026" },
    ],
  },
  {
    id: "c3", name: "Raj Patel", email: "raj.patel@omnimart.com", domains: ["sales", "finance"],
    pages: 38, snippets: 455, assets: 12, tables: 14,
    contributions: [
      { name: "Discount approval matrix",          kind: "Page",             domain: "sales", updated: "Oct 1, 2026" },
      { name: "Deal desk dashboard",               kind: "Databricks asset", domain: "sales", updated: "Sep 26, 2026" },
      { name: "Margin by SKU",                     kind: "Snippet",          domain: "finance", updated: "Sep 21, 2026" },
    ],
  },
  {
    id: "c4", name: "Hannah Lee", email: "hannah.lee@omnimart.com", domains: ["supply-chain"],
    pages: 33, snippets: 390, assets: 9, tables: 21,
    contributions: [
      { name: "Inventory turns definition",        kind: "Page",             domain: "supply-chain", certified: true, updated: "Sep 30, 2026" },
      { name: "main.ops.shipments",                kind: "Table",            domain: "supply-chain", certified: true, updated: "Sep 25, 2026" },
      { name: "Late shipment rate",                kind: "Snippet",          domain: "supply-chain", updated: "Sep 22, 2026" },
    ],
  },
  {
    id: "c5", name: "Eric Johansson", email: "eric.johansson@omnimart.com", domains: ["finance", "supply-chain"],
    pages: 27, snippets: 362, assets: 14, tables: 9,
    unusual: "Most contributions are in Finance, but Eric's usual workspace is a sandbox.",
    contributions: [
      { name: "Eric test dashboard",               kind: "Databricks asset", domain: "finance", updated: "Oct 3, 2026" },
      { name: "eric_scratch.revenue_copy",         kind: "Table",            domain: "finance", updated: "Oct 2, 2026" },
      { name: "Revenue (draft v3)",                kind: "Page",             domain: "finance", updated: "Oct 1, 2026" },
      { name: "tmp join orders x gl",              kind: "Snippet",          domain: "finance", updated: "Sep 30, 2026" },
      { name: "Supplier lead time (test)",         kind: "Page",             domain: "supply-chain", updated: "Sep 27, 2026" },
    ],
  },
  {
    id: "c6", name: "Sofia Moretti", email: "sofia.moretti@omnimart.com", domains: ["supply-chain"],
    pages: 19, snippets: 214, assets: 6, tables: 11,
    contributions: [
      { name: "Supplier scorecard",                kind: "Page",             domain: "supply-chain", updated: "Sep 15, 2026" },
      { name: "Forecast accuracy",                 kind: "Snippet",          domain: "supply-chain", updated: "Sep 10, 2026" },
    ],
  },
]

// Active Genie users (30d) per domain; "all" is the account total.
export const GENIE_USERS: Record<string, number> = {
  all: 412,
  sales: 118,
  finance: 74,
  "supply-chain": 61,
  marketing: 66,
  "customer-support": 57,
  people: 36,
}

export type BlockedUser = {
  id: string
  name: string
  email: string
  team: string
  domain: string
  accessibleTables: number
  questions30d: number
  noAccessAnswers: number
  suggestions: { name: string; type: "Table" | "Metric view" | "Schema"; owner: string; reason: string }[]
}

export const BLOCKED_USERS: BlockedUser[] = [
  {
    id: "u1", name: "Jordan Blake", email: "jordan.blake@omnimart.com", team: "Field Sales — West", domain: "sales",
    accessibleTables: 0, questions30d: 47, noAccessAnswers: 41,
    suggestions: [
      { name: "main.sales.opportunities",    type: "Table",       owner: "Elena Vasquez", reason: "Referenced in 32 of Jordan's questions" },
      { name: "sales_kpis",                  type: "Metric view", owner: "Elena Vasquez", reason: "Certified, used by 88% of Sales" },
      { name: "main.sales.accounts",         type: "Table",       owner: "Raj Patel",     reason: "Peers on the same team have access" },
    ],
  },
  {
    id: "u2", name: "Aisha Mohammed", email: "aisha.mohammed@omnimart.com", team: "FP&A", domain: "finance",
    accessibleTables: 0, questions30d: 31, noAccessAnswers: 29,
    suggestions: [
      { name: "finance_close",               type: "Metric view", owner: "Tom Okafor", reason: "Certified, used by 74% of Finance" },
      { name: "main.finance.gl_entries",     type: "Table",       owner: "Tom Okafor", reason: "Referenced in 18 of Aisha's questions" },
    ],
  },
  {
    id: "u3", name: "Lucas Ferreira", email: "lucas.ferreira@omnimart.com", team: "Logistics", domain: "supply-chain",
    accessibleTables: 2, questions30d: 26, noAccessAnswers: 19,
    suggestions: [
      { name: "main.ops.shipments",          type: "Table",  owner: "Hannah Lee", reason: "Referenced in 14 of Lucas's questions" },
      { name: "main.ops",                    type: "Schema", owner: "Hannah Lee", reason: "Peers on the same team have access" },
    ],
  },
  {
    id: "u4", name: "Mei Tanaka", email: "mei.tanaka@omnimart.com", team: "Brand Marketing", domain: "marketing",
    accessibleTables: 0, questions30d: 22, noAccessAnswers: 22,
    suggestions: [
      { name: "main.marketing.campaigns",    type: "Table", owner: "No domain expert", reason: "Referenced in 12 of Mei's questions" },
    ],
  },
  {
    id: "u5", name: "Daniel Kim", email: "daniel.kim@omnimart.com", team: "Support Ops", domain: "customer-support",
    accessibleTables: 1, questions30d: 15, noAccessAnswers: 11,
    suggestions: [
      { name: "main.support.tickets",        type: "Table", owner: "No domain expert", reason: "Referenced in 9 of Daniel's questions" },
    ],
  },
]

// ─── Sources & connectors ──────────────────────────────────────────────────────

export type SourceStatus = "Healthy" | "Syncing" | "Needs attention" | "Not connected"
export type SourceChannel = "Search index" | "MCP server" | "Metadata mirroring" | "Enterprise connector"

export type Source = {
  id: string
  name: string
  channel: SourceChannel
  contributes: string
  scope: string
  status: SourceStatus
  lastSync: string
  detail?: string
  /** Genie users who've authenticated (connectors and MCP servers query with each user's own credentials). */
  authenticated?: number
}

export const INITIAL_SOURCES: Source[] = [
  { id: "s6",  name: "Google Drive",                 channel: "Enterprise connector", contributes: "Docs, Sheets",              scope: "Marketing",            status: "Healthy",         lastSync: "1 hour ago", authenticated: 330 },
  { id: "s12", name: "Slack",                        channel: "Enterprise connector", contributes: "Channels, threads",         scope: "All domains",          status: "Healthy",         lastSync: "20 min ago", authenticated: 368 },
  { id: "s7",  name: "Jira",                         channel: "Enterprise connector", contributes: "Issues, epics",             scope: "Customer Support",     status: "Needs attention", lastSync: "3 days ago", detail: "OAuth token expired", authenticated: 276 },
  { id: "s8",  name: "Confluence",                   channel: "Enterprise connector", contributes: "Wiki pages, runbooks",      scope: "All domains",          status: "Healthy",         lastSync: "2 hours ago", authenticated: 241 },
  { id: "s13", name: "GitHub",                       channel: "Enterprise connector", contributes: "Repos, READMEs, issues",    scope: "Supply Chain",         status: "Healthy",         lastSync: "35 min ago", authenticated: 154 },
  { id: "s9",  name: "SharePoint",                   channel: "Enterprise connector", contributes: "Sites, documents",          scope: "People & HR",          status: "Syncing",         lastSync: "In progress", authenticated: 198 },
  { id: "s14", name: "Glean",                        channel: "Enterprise connector", contributes: "Enterprise search results", scope: "All domains",          status: "Healthy",         lastSync: "1 hour ago", authenticated: 122 },
]

// Where the ontology's content originates (share of indexed knowledge objects).
export const KNOWLEDGE_ORIGINS = [
  { group: "Databricks",  name: "Databricks assets",    value: 58 },
  { group: "Databricks",  name: "Unity Catalog tables", value: 21 },
  { group: "Third-party", name: "Google Drive",         value: 6 },
  { group: "Third-party", name: "Slack",                value: 5 },
  { group: "Third-party", name: "Jira",                 value: 3 },
  { group: "Third-party", name: "Confluence",           value: 3 },
  { group: "Third-party", name: "GitHub",               value: 2 },
  { group: "Third-party", name: "SharePoint",           value: 1 },
  { group: "Third-party", name: "Glean",                value: 1 },
]

// Metastore coverage — connectors are configured per metastore, so setup in one region
// doesn't carry to the others. PLACEHOLDER statuses; us-east-1 matches INITIAL_SOURCES.
export type CoverageStatus = "Connected" | "Syncing" | "Auth needed" | "Not set up"
export const METASTORE_COVERAGE: { metastore: string; label: string; status: Record<string, CoverageStatus> }[] = [
  { metastore: "us-east-1",      label: "prod",    status: { "Google Drive": "Connected",  Slack: "Connected",  Jira: "Auth needed", Confluence: "Connected",  GitHub: "Connected",  SharePoint: "Syncing",    Glean: "Connected" } },
  { metastore: "eu-west-1",      label: "prod-eu", status: { "Google Drive": "Connected",  Slack: "Connected",  Jira: "Not set up",  Confluence: "Not set up", GitHub: "Not set up", SharePoint: "Connected",  Glean: "Not set up" } },
  { metastore: "ap-southeast-2", label: "apac",    status: { "Google Drive": "Not set up", Slack: "Not set up", Jira: "Not set up",  Confluence: "Not set up", GitHub: "Not set up", SharePoint: "Not set up", Glean: "Not set up" } },
]

// Most-needed sources — source assets Genie users' questions needed in the last 30d.
// `needed` and `missing` are PLACEHOLDER counts (no per-source access data yet). Names,
// types, and owners match BLOCKED_USERS suggestions and contributor data.
// `snippets` = number of snippets the source contributes to — also a PLACEHOLDER.
// `retrievals` (times Genie retrieved the source, 30d) and `authority` (0–100 score) are
// PLACEHOLDERS too — not defined in the PRD; added per design request.
export const MOST_NEEDED_SOURCES: { name: string; type: string; snippets: number; retrievals: number; authority: number; needed: number; missing: number; owner: string }[] = [
  { name: "sales_kpis",               type: "Metric view", snippets: 412, retrievals: 8_120, authority: 96, needed: 38, missing: 9,  owner: "Elena Vasquez" },
  { name: "main.sales.opportunities", type: "Table",       snippets: 356, retrievals: 5_470, authority: 92, needed: 29, missing: 12, owner: "Elena Vasquez" },
  { name: "finance_close",            type: "Metric view", snippets: 287, retrievals: 4_230, authority: 95, needed: 24, missing: 4,  owner: "Tom Okafor" },
  { name: "main.support.tickets",     type: "Table",       snippets: 198, retrievals: 3_910, authority: 79, needed: 19, missing: 11, owner: "No domain expert" },
  { name: "Pipeline forecast",        type: "Notebook",    snippets: 468, retrievals: 6_310, authority: 90, needed: 33, missing: 6,  owner: "Elena Vasquez" },
  { name: "Inventory health",         type: "Notebook",    snippets: 264, retrievals: 3_480, authority: 87, needed: 21, missing: 5,  owner: "Hannah Lee" },
  { name: "Month-end close checks",   type: "Query",       snippets: 172, retrievals: 2_960, authority: 91, needed: 15, missing: 2,  owner: "Eric Johansson" },
  { name: "Deal desk dashboard",      type: "Dashboard",   snippets: 141, retrievals: 2_540, authority: 84, needed: 17, missing: 0,  owner: "Raj Patel" },
  { name: "Supplier lead times",      type: "Dashboard",   snippets: 118, retrievals: 1_720, authority: 86, needed: 12, missing: 3,  owner: "Sofia Moretti" },
  { name: "Weekly churn cohorts",     type: "Query",       snippets: 96,  retrievals: 1_430, authority: 76, needed: 14, missing: 8,  owner: "No domain expert" },
]
