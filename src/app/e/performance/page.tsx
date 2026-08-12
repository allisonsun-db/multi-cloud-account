"use client"

import { AppShell } from "@/components/shell"

// Performance is a monitoring-only lens across the account's infrastructure — latency,
// utilization, consumption, job health. The things you'd act on (workspaces, cloud
// resources, compute) live under the Infrastructure nav section, not embedded here.
export default function UnifiedPerformancePage() {
  return (
    <AppShell activeItem="performance">
      <div className="flex flex-col gap-5 p-6">
        <h1 className="text-[22px] leading-7 font-semibold text-foreground">Performance</h1>
      </div>
    </AppShell>
  )
}
