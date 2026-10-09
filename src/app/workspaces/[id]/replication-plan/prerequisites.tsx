export const PREREQS_DOCS_URL = "https://docs.databricks.com/aws/en/admin/managed-disaster-recovery#configuration-prerequisites"

export const PREREQS = [
  {
    label: "Secondary workspace and metastore",
    description: "Both are in the secondary region, in the same account and cloud as the primary. The metastore has no catalogs with the same names as replicated catalogs.",
  },
  {
    label: "Identity",
    description: "Account-level SSO is enabled, and users, groups, and service principals are synced to the account. Stable URLs also need a custom URL and account-level OAuth.",
  },
  {
    label: "Storage and data access",
    description: "The secondary region has a matching IAM credential, storage credentials, and external locations. The secondary's IAM roles have ALL PRIVILEGES on those locations.",
  },
  {
    label: "Networking",
    description: "Both workspaces use the same NCC, serverless egress policy, private access settings, and IP access list. Storage allows serverless access in both directions.",
  },
  {
    label: "Cost and governance",
    description: "Both workspaces have the serverless usage policy associated.",
  },
]

export function PrereqsList() {
  return (
    <div className="flex flex-col gap-0">
      {PREREQS.map((prereq, i) => (
        <div key={prereq.label} className="flex items-start gap-3 py-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-grey-100 text-foreground dark:bg-grey-700 mt-0.5 text-xs font-semibold">
            {i + 1}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{prereq.label}</span>
            <span className="text-sm text-muted-foreground">{prereq.description}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
