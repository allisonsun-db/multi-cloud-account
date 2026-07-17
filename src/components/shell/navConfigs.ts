import {
  DataIcon,
  DollarIcon,
  WorkspacesIcon,
  CatalogIcon,
  ChartLineIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ShieldIcon,
  CloudIcon,
  GiftIcon,
  GearIcon,
  NotebookIcon,
  PipelineIcon,
  WorkflowsIcon,
  ModelsIcon,
  QueryEditorIcon,
  StorefrontIcon,
  TagIcon,
  SpeedometerIcon,
  SparkleDoubleIcon,
  UserKeyIconIcon,
  McpIcon,
  AssistantIcon,
  CreditCardIcon,
  ChecklistIcon,
  UserCircleIcon,
  OfficeIcon,
} from "@/components/icons"
import type React from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type NavItem = {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  iconColor?: "default" | "muted" | "primary" | "ai"
  href?: string
}

export type NavSection = {
  label?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: React.ComponentType<any>  // used by rail layout
  items: NavItem[]
}

export type NavVersionConfig = {
  layout?: "sections" | "rail" | "drill-down"  // default "sections"
  maxItemsPerSection?: number
  sections: NavSection[]
}

// ─── Nav Versions ─────────────────────────────────────────────────────────────

export const NAV_VERSIONS: Record<string, NavVersionConfig> = {
  "A": {
    layout: "sections",
    sections: [
      {
        label: "Governance",
        items: [
          { id: "data",         label: "Data",         icon: DataIcon,          href: "/data" },
          { id: "ai-gov",       label: "AI",           icon: SparkleDoubleIcon, href: "/ai" },
          { id: "cost",         label: "Cost",         icon: DollarIcon,        href: "/cost" },
          { id: "performance",  label: "Performance",  icon: SpeedometerIcon,   href: "/performance" },
        ],
      },
      {
        label: "Admin",
        items: [
          { id: "accounts",         label: "Accounts",         icon: OfficeIcon,      href: "/accounts" },
          { id: "workspaces",       label: "Workspaces",       icon: WorkspacesIcon,  href: "/workspaces" },
          { id: "catalog",          label: "Catalog",          icon: CatalogIcon,     href: "/catalog" },
          { id: "user-management",  label: "Identity",         icon: UserGroupIcon,   href: "/user-management" },
          { id: "security",         label: "Security",         icon: ShieldCheckIcon, href: "/security" },
          { id: "resilience",       label: "Resilience",       icon: ShieldIcon,      href: "/resilience" },
          { id: "cloud-resources",  label: "Cloud resources",  icon: CloudIcon,       href: "/cloud-resources" },
          { id: "previews",         label: "Previews",         icon: GiftIcon,        href: "/previews" },
          { id: "settings",         label: "Settings",         icon: GearIcon,        href: "/settings" },
        ],
      },
    ],
  },

  "B": {
    layout: "sections",
    sections: [
      {
        label: "Governance",
        items: [
          { id: "data",         label: "Data",        icon: DataIcon,          href: "/data" },
          { id: "cost",         label: "Cost",        icon: DollarIcon,        href: "/cost" },
          { id: "tags",         label: "Tags",        icon: TagIcon,           href: "/tags" },
          { id: "performance",  label: "Performance", icon: SpeedometerIcon,   href: "/performance" },
          { id: "security-gov", label: "Security",    icon: ShieldCheckIcon,   href: "/security" },
          { id: "ai-gateway",   label: "AI",          icon: SparkleDoubleIcon, href: "/ai" },
        ],
      },
      {
        label: "Infrastructure",
        items: [
          { id: "workspaces",      label: "Workspaces",      icon: WorkspacesIcon, href: "/workspaces" },
          { id: "catalog",         label: "Metastores",      icon: CatalogIcon,    href: "/catalog" },
          { id: "resilience",      label: "Resilience",      icon: ShieldIcon,     href: "/resilience" },
          { id: "cloud-resources", label: "Cloud resources",  icon: CloudIcon,     href: "/cloud-resources" },
        ],
      },
      {
        label: "Identity",
        items: [
          { id: "identities",        label: "Identities", icon: UserGroupIcon,  href: "/identities" },
          { id: "identity-provider", label: "Provider",   icon: UserKeyIconIcon, href: "/identity-provider" },
        ],
      },
      {
        label: "AI",
        items: [
          { id: "glean-mcp", label: "Knowledge platform", icon: McpIcon,      href: "/knowledge-platform" },
          { id: "genie",     label: "Genie",               icon: AssistantIcon, href: "/genie" },
        ],
      },
      {
        label: "Account",
        items: [
          { id: "accounts",        label: "Accounts",               icon: OfficeIcon,     href: "/accounts" },
          { id: "custom-url",      label: "Account settings",       icon: OfficeIcon,     href: "/custom-url" },
          { id: "feature-preview", label: "Features & previews",    icon: ChecklistIcon,  href: "/previews" },
          { id: "billing",         label: "Subscription & billing", icon: CreditCardIcon, href: "/billing" },
        ],
      },
    ],
  },

  "C": {
    layout: "drill-down",
    sections: [
      {
        label: "Monitoring",
        icon: ShieldCheckIcon,
        items: [
          { id: "data",         label: "Data",        icon: DataIcon,          href: "/data" },
          { id: "cost",         label: "Cost",        icon: DollarIcon,        href: "/cost" },
          { id: "tags",         label: "Tags",        icon: TagIcon,           href: "/tags" },
          { id: "performance",  label: "Performance", icon: SpeedometerIcon,   href: "/performance" },
          { id: "security-gov", label: "Security",    icon: ShieldCheckIcon,   href: "/security" },
          { id: "ai-gateway",   label: "AI",          icon: SparkleDoubleIcon, href: "/ai" },
        ],
      },
      {
        label: "Infrastructure",
        icon: CloudIcon,
        items: [
          { id: "workspaces",      label: "Workspaces",      icon: WorkspacesIcon,  href: "/workspaces" },
          { id: "catalog",         label: "Metastores",      icon: CatalogIcon,     href: "/catalog" },
          { id: "resilience",      label: "Resilience",      icon: ShieldIcon,      href: "/resilience" },
          { id: "security-cloud",  label: "Security",        icon: ShieldCheckIcon, href: "/security" },
          { id: "cloud-resources", label: "Cloud resources",  icon: CloudIcon,      href: "/cloud-resources" },
        ],
      },
      {
        label: "Identity and access",
        icon: UserGroupIcon,
        items: [
          { id: "identities",        label: "Identities",        icon: UserGroupIcon,   href: "/identities" },
          { id: "identity-provider", label: "Identity provider", icon: UserKeyIconIcon,  href: "/identity-provider" },
        ],
      },
      {
        label: "AI",
        icon: SparkleDoubleIcon,
        items: [
          { id: "glean-mcp", label: "Knowledge platform", icon: McpIcon,      href: "/knowledge-platform" },
          { id: "genie",     label: "Genie",               icon: AssistantIcon, href: "/genie" },
        ],
      },
      {
        label: "Account",
        icon: OfficeIcon,
        items: [
          { id: "accounts",        label: "Accounts",               icon: OfficeIcon,     href: "/accounts" },
          { id: "custom-url",      label: "Account settings",       icon: OfficeIcon,     href: "/custom-url" },
          { id: "feature-preview", label: "Features & previews",    icon: ChecklistIcon,  href: "/previews" },
          { id: "billing",         label: "Subscription & billing", icon: CreditCardIcon, href: "/billing" },
        ],
      },
    ],
  },

  "D": {
    layout: "rail",
    sections: [
      {
        label: "Monitor",
        icon: ShieldCheckIcon,
        items: [
          { id: "data",         label: "Data",        icon: DataIcon,          href: "/data" },
          { id: "cost",         label: "Cost",        icon: DollarIcon,        href: "/cost" },
          { id: "tags",         label: "Tags",        icon: TagIcon,           href: "/tags" },
          { id: "performance",  label: "Performance", icon: SpeedometerIcon,   href: "/performance" },
          { id: "security-gov", label: "Security",    icon: ShieldCheckIcon,   href: "/security" },
          { id: "ai-gateway",   label: "AI",          icon: SparkleDoubleIcon, href: "/ai" },
        ],
      },
      {
        label: "Cloud",
        icon: CloudIcon,
        items: [
          { id: "workspaces",      label: "Workspaces",      icon: WorkspacesIcon,  href: "/workspaces" },
          { id: "catalog",         label: "Metastores",      icon: CatalogIcon,     href: "/catalog" },
          { id: "resilience",      label: "Resilience",      icon: ShieldIcon,      href: "/resilience" },
          { id: "security-cloud",  label: "Security",        icon: ShieldCheckIcon, href: "/security" },
          { id: "cloud-resources", label: "Cloud resources",  icon: CloudIcon,      href: "/cloud-resources" },
        ],
      },
      {
        label: "Identity",
        icon: UserGroupIcon,
        items: [
          { id: "identities",        label: "Identities",        icon: UserGroupIcon,   href: "/identities" },
          { id: "identity-provider", label: "Identity provider", icon: UserKeyIconIcon,  href: "/identity-provider" },
        ],
      },
      {
        label: "AI",
        icon: SparkleDoubleIcon,
        items: [
          { id: "glean-mcp", label: "Knowledge platform", icon: McpIcon,      href: "/knowledge-platform" },
          { id: "genie",     label: "Genie",               icon: AssistantIcon, href: "/genie" },
        ],
      },
      {
        label: "Account",
        icon: OfficeIcon,
        items: [
          { id: "accounts",        label: "Accounts",               icon: OfficeIcon,     href: "/accounts" },
          { id: "custom-url",      label: "Account settings",       icon: OfficeIcon,     href: "/custom-url" },
          { id: "feature-preview", label: "Features & previews",    icon: ChecklistIcon,  href: "/previews" },
          { id: "billing",         label: "Subscription & billing", icon: CreditCardIcon, href: "/billing" },
        ],
      },
    ],
  },
}

export type NavVersionKey = keyof typeof NAV_VERSIONS
export const NAV_VERSION_KEYS = Object.keys(NAV_VERSIONS) as NavVersionKey[]
export const DEFAULT_NAV_VERSION: NavVersionKey = "B"
