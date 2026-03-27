import * as React from "react"

export function AwsBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <img src="/aws.png" alt="AWS" width={16} height={16} className="object-contain dark:[filter:brightness(0)_invert(1)]" />
      AWS
    </span>
  )
}

export function AzureBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <img src="/azure.svg" alt="Azure" width={16} height={16} className="object-contain" />
      Azure
    </span>
  )
}

export function GcpBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <img src="/gcp.svg" alt="GCP" width={16} height={16} className="object-contain" />
      GCP
    </span>
  )
}
