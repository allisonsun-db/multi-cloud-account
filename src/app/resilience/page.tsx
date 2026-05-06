"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon, XCircleIcon } from "@/components/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CLOUD_ICONS } from "@/components/ui/location-picker"

// ─── Data ─────────────────────────────────────────────────────────────────────

type ReplicationPlan = {
  id: string
  name: string
  primaryWorkspace: string
  primaryCloud: "AWS" | "Azure" | "GCP"
  replicaWorkspace: string
  replicaCloud: "AWS" | "Azure" | "GCP"
  status: "Active" | "Failed"
  lastRun: string
}

const REPLICATION_PLANS: ReplicationPlan[] = [
  { id: "plan-1", name: "my-replication-plan",  primaryWorkspace: "ws-prod-east",    primaryCloud: "AWS",   replicaWorkspace: "ws-prod-dr-west",    replicaCloud: "AWS",   status: "Active", lastRun: "Apr 9, 2026 at 9:45 AM" },
  { id: "plan-2", name: "staging-dr-plan",       primaryWorkspace: "ws-staging-east", primaryCloud: "Azure", replicaWorkspace: "ws-staging-dr-west",  replicaCloud: "Azure", status: "Active", lastRun: "Apr 9, 2026 at 9:30 AM" },
  { id: "plan-3", name: "analytics-backup-plan", primaryWorkspace: "analytics-prod",  primaryCloud: "AWS",   replicaWorkspace: "analytics-dr",        replicaCloud: "AWS",   status: "Active", lastRun: "Apr 8, 2026 at 4:00 PM" },
  { id: "plan-4", name: "ml-platform-dr",        primaryWorkspace: "ml-platform-prod",primaryCloud: "GCP",   replicaWorkspace: "ml-platform-dr-east", replicaCloud: "GCP",   status: "Failed", lastRun: "Apr 8, 2026 at 2:15 PM" },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ResiliencePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("failover-groups")

  return (
    <AppShell activeItem="resilience">
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold text-foreground">Resilience</h1>

        <Tabs defaultValue="failover-groups" onValueChange={setActiveTab}>
          <div className="flex flex-wrap items-center gap-2">
            <TabsList>
              <TabsTrigger value="failover-groups">Failover groups</TabsTrigger>
              <TabsTrigger value="stable-urls">Stable URLs</TabsTrigger>
            </TabsList>
            <div className="ml-auto pb-1">
              {activeTab === "failover-groups" && (
                <Button size="sm" onClick={() => router.push(`/workspaces/1/replication-plan/new`)}>
                  Create failover group
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="failover-groups" className="mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Name</TableHead>
                  <TableHead>Primary workspace</TableHead>
                  <TableHead>Secondary workspace</TableHead>
                  <TableHead>Last run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REPLICATION_PLANS.map((plan) => (
                  <TableRow
                    key={plan.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/workspaces/1/replication-plan/${plan.id}`)}
                  >
                    <TableCell className="w-8">
                      <Tooltip>
                        <TooltipTrigger className="flex items-center">
                          {plan.status === "Active" && <CheckCircleIcon size={14} className="text-[var(--success)]" />}
                          {plan.status === "Failed" && <XCircleIcon size={14} className="text-destructive" />}
                        </TooltipTrigger>
                        <TooltipContent>{plan.status}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {CLOUD_ICONS[plan.primaryCloud]}
                        {plan.primaryWorkspace}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {CLOUD_ICONS[plan.replicaCloud]}
                        {plan.replicaWorkspace}
                      </span>
                    </TableCell>
                    <TableCell>{plan.lastRun}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="stable-urls" className="mt-2">
            <p className="text-sm text-muted-foreground">No stable URLs configured.</p>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
