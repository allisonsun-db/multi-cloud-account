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
  GlobeIcon,
  UserCircleIcon,
  OfficeIcon,
} from "@/components/icons"
import { Sun as SunIcon, Mail as MailIcon } from "lucide-react"
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
          { id: "data",  label: "Data",  icon: DataIcon },
          { id: "cost",  label: "Cost",  icon: DollarIcon },
        ],
      },
      {
        label: "Admin",
        items: [
          { id: "accounts",         label: "Accounts",         icon: OfficeIcon,      href: "/accounts" },
          { id: "workspaces",       label: "Workspaces",       icon: WorkspacesIcon,  href: "/workspaces" },
          { id: "catalog",          label: "Catalog",          icon: CatalogIcon,     href: "/catalog" },
          { id: "user-management",  label: "User management",  icon: UserGroupIcon,   href: "https://db-ui-mockups.vercel.app/user-management" },
          { id: "security",         label: "Security",         icon: ShieldCheckIcon },
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
          { id: "data",         label: "Data",        icon: DataIcon },
          { id: "cost",         label: "Cost",        icon: DollarIcon },
          { id: "tags",         label: "Tags",        icon: TagIcon },
          { id: "performance",  label: "Performance", icon: SpeedometerIcon },
          { id: "security-gov", label: "Security",    icon: ShieldCheckIcon },
          { id: "ai-gateway",   label: "AI gateway",  icon: SparkleDoubleIcon },
        ],
      },
      {
        label: "Cloud infrastructure",
        items: [
          { id: "workspaces",      label: "Workspaces",      icon: WorkspacesIcon },
          { id: "catalog",         label: "Metastores",      icon: CatalogIcon },
          { id: "resilience",      label: "Resilience",      icon: ShieldIcon },
          { id: "cloud-resources", label: "Cloud resources", icon: CloudIcon },
        ],
      },
      {
        label: "Identity and access",
        items: [
          { id: "identities",        label: "Identities",        icon: UserGroupIcon },
          { id: "identity-provider", label: "Identity provider", icon: UserKeyIconIcon },
        ],
      },
      {
        label: "AI",
        items: [
          { id: "glean-mcp", label: "Knowledge platform", icon: McpIcon },
          { id: "genie",     label: "Genie",     icon: AssistantIcon },
        ],
      },
      {
        label: "Account",
        items: [
          { id: "accounts",        label: "Accounts",               icon: OfficeIcon },
          { id: "custom-url",      label: "Custom URL",             icon: GlobeIcon },
          { id: "feature-preview", label: "Features & previews",    icon: ChecklistIcon },
          { id: "billing",         label: "Subscription & billing", icon: CreditCardIcon },
          { id: "preferences",     label: "Preferences",            icon: GearIcon },
        ],
      },
    ],
  },

  "C": {
    layout: "sections",
    maxItemsPerSection: 2,
    sections: [
      {
        label: "Governance",
        items: [
          { id: "data",         label: "Data",        icon: DataIcon },
          { id: "cost",         label: "Cost",        icon: DollarIcon },
          { id: "tags",         label: "Tags",        icon: TagIcon },
          { id: "performance",  label: "Performance", icon: SpeedometerIcon },
          { id: "security-gov", label: "Security",    icon: ShieldCheckIcon },
          { id: "ai-gateway",   label: "AI gateway",  icon: SparkleDoubleIcon },
        ],
      },
      {
        label: "Cloud infrastructure",
        items: [
          { id: "workspaces",      label: "Workspaces",      icon: WorkspacesIcon },
          { id: "catalog",         label: "Metastores",      icon: CatalogIcon },
          { id: "resilience",      label: "Resilience",      icon: ShieldIcon },
          { id: "cloud-resources", label: "Cloud resources", icon: CloudIcon },
        ],
      },
      {
        label: "Identity and access",
        items: [
          { id: "identities",        label: "Identities",        icon: UserGroupIcon },
          { id: "identity-provider", label: "Identity provider", icon: UserKeyIconIcon },
        ],
      },
      {
        label: "AI",
        items: [
          { id: "glean-mcp", label: "Knowledge platform", icon: McpIcon },
          { id: "genie",     label: "Genie",     icon: AssistantIcon },
        ],
      },
      {
        label: "Account",
        items: [
          { id: "accounts",        label: "Accounts",               icon: OfficeIcon },
          { id: "custom-url",      label: "Custom URL",             icon: GlobeIcon },
          { id: "feature-preview", label: "Features & previews",    icon: ChecklistIcon },
          { id: "billing",         label: "Subscription & billing", icon: CreditCardIcon },
          { id: "preferences",     label: "Preferences",            icon: GearIcon },
        ],
      },
    ],
  },

  "D": {
    layout: "drill-down",
    sections: [
      {
        label: "Monitoring",
        icon: ShieldCheckIcon,
        items: [
          { id: "data",         label: "Data",        icon: DataIcon },
          { id: "cost",         label: "Cost",        icon: DollarIcon },
          { id: "tags",         label: "Tags",        icon: TagIcon },
          { id: "performance",  label: "Performance", icon: SpeedometerIcon },
          { id: "security-gov", label: "Security",    icon: ShieldCheckIcon },
          { id: "ai-gateway",   label: "AI gateway",  icon: SparkleDoubleIcon },
        ],
      },
      {
        label: "Cloud infrastructure",
        icon: CloudIcon,
        items: [
          { id: "workspaces",      label: "Workspaces",      icon: WorkspacesIcon },
          { id: "catalog",         label: "Metastores",      icon: CatalogIcon },
          { id: "resilience",      label: "Resilience",      icon: ShieldIcon },
          { id: "security-cloud",  label: "Security",        icon: ShieldCheckIcon },
          { id: "cloud-resources", label: "Cloud resources", icon: CloudIcon },
        ],
      },
      {
        label: "Identity and access",
        icon: UserGroupIcon,
        items: [
          { id: "identities",        label: "Identities",        icon: UserGroupIcon },
          { id: "identity-provider", label: "Identity provider", icon: UserKeyIconIcon },
        ],
      },
      {
        label: "AI",
        icon: SparkleDoubleIcon,
        items: [
          { id: "glean-mcp", label: "Knowledge platform", icon: McpIcon },
          { id: "genie",     label: "Genie",     icon: AssistantIcon },
        ],
      },
      {
        label: "Account",
        icon: OfficeIcon,
        items: [
          { id: "accounts",        label: "Accounts",               icon: OfficeIcon },
          { id: "custom-url",      label: "Custom URL",             icon: GlobeIcon },
          { id: "feature-preview", label: "Features & previews",    icon: ChecklistIcon },
          { id: "billing",         label: "Subscription & billing", icon: CreditCardIcon },
        ],
      },
      {
        label: "Preferences",
        icon: GearIcon,
        items: [
          { id: "appearance",  label: "Appearance",        icon: SunIcon },
          { id: "notifications",  label: "Notifications", icon: MailIcon },
        ],
      },
    ],
  },

  "E": {
    layout: "rail",
    sections: [
      {
        label: "Monitor",
        icon: ShieldCheckIcon,
        items: [
          { id: "data",         label: "Data",        icon: DataIcon },
          { id: "cost",         label: "Cost",        icon: DollarIcon },
          { id: "tags",         label: "Tags",        icon: TagIcon },
          { id: "performance",  label: "Performance", icon: SpeedometerIcon },
          { id: "security-gov", label: "Security",    icon: ShieldCheckIcon },
          { id: "ai-gateway",   label: "AI gateway",  icon: SparkleDoubleIcon },
        ],
      },
      {
        label: "Cloud",
        icon: CloudIcon,
        items: [
          { id: "workspaces",      label: "Workspaces",      icon: WorkspacesIcon },
          { id: "catalog",         label: "Metastores",      icon: CatalogIcon },
          { id: "resilience",      label: "Resilience",      icon: ShieldIcon },
          { id: "security-cloud",  label: "Security",        icon: ShieldCheckIcon },
          { id: "cloud-resources", label: "Cloud resources", icon: CloudIcon },
        ],
      },
      {
        label: "Identity",
        icon: UserGroupIcon,
        items: [
          { id: "identities",        label: "Identities",        icon: UserGroupIcon },
          { id: "identity-provider", label: "Identity provider", icon: UserKeyIconIcon },
        ],
      },
      {
        label: "AI",
        icon: SparkleDoubleIcon,
        items: [
          { id: "glean-mcp", label: "Knowledge platform", icon: McpIcon },
          { id: "genie",     label: "Genie",     icon: AssistantIcon },
        ],
      },
      {
        label: "Account",
        icon: OfficeIcon,
        items: [
          { id: "accounts",        label: "Accounts",               icon: OfficeIcon },
          { id: "custom-url",      label: "Custom URL",             icon: GlobeIcon },
          { id: "feature-preview", label: "Features & previews",    icon: ChecklistIcon },
          { id: "billing",         label: "Subscription & billing", icon: CreditCardIcon },
        ],
      },
      {
        label: "Preferences",
        icon: GearIcon,
        items: [
          { id: "appearance",    label: "Appearance",    icon: SunIcon },
          { id: "notifications", label: "Notifications", icon: MailIcon },
        ],
      },
    ],
  },
}

export type NavVersionKey = keyof typeof NAV_VERSIONS
export const NAV_VERSION_KEYS = Object.keys(NAV_VERSIONS) as NavVersionKey[]
