"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppShell, useAccountScope, useGenieCodePanel } from "@/components/shell"
import { GenieCommandBar } from "@/components/home/GenieCommandBar"
import { SetupChecklist } from "@/components/home/SetupChecklist"
import { Card, CardContent } from "@/components/ui/card"
import { DangerIcon, WarningIcon, DotsCircleIcon, ChevronRightIcon } from "@/components/icons"

const OVERVIEW = [
  { label: "Workspaces", value: "20",     change: "+2",  changeTone: "success", href: "/workspaces" },
  { label: "Users",      value: "1,247",  change: "+23", changeTone: "success" },
  { label: "Spend",      value: "$18.2K", change: "+34%", changeTone: "warning" },
] as const

const CHANGE_TONE_CLASS = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
} as const

type AlertLevel = "urgent" | "warning" | "pending"

const ALERT_ICON: Record<AlertLevel, React.ReactNode> = {
  urgent:  <DangerIcon     width={16} height={16} className="shrink-0 text-destructive" />,
  warning: <WarningIcon    width={16} height={16} className="shrink-0 text-[var(--warning)]" />,
  pending: <DotsCircleIcon width={16} height={16} className="shrink-0 text-muted-foreground" />,
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALERTS: {
  id: string
  level: AlertLevel
  text: string
  href: string
  source: string
}[] = [
  { id: "mfa",     level: "urgent",  text: "12 users have no MFA enrolled",                      href: "/accounts", source: "Account users" },
  { id: "cost",    level: "warning", text: "Prod-west workspace is approaching its budget limit", href: "/settings", source: "Budget alerts" },
  { id: "access",  level: "pending", text: "3 access requests awaiting approval",                 href: "/accounts", source: "Access requests" },
  { id: "tokens",  level: "warning", text: "5 service principals have non-expiring tokens",       href: "/settings", source: "Service principals" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <AppShell workspace="Nike Production" userInitial="A">
      <HomeContent />
    </AppShell>
  )
}

function HomeContent() {
  const router = useRouter()
  const { openGenieCode } = useGenieCodePanel()
  const { scope } = useAccountScope()

  function handleReviewClick(alert: (typeof ALERTS)[number]) {
    openGenieCode({
      input: [
        "Help me review this account issue and suggest next actions.",
        "",
        `Issue: ${alert.text}`,
        `Severity: ${alert.level}`,
        `Source: ${alert.source}`,
        "Account: Nike Production",
      ].join("\n"),
      tags: [
        { id: `review-${alert.id}`, label: "Review item", kind: "node" },
      ],
      autoSubmit: true,
    })
  }

  return (
      <div className="mx-auto flex w-full max-w-[800px] flex-col gap-8 p-6 pt-20 md:pt-24 lg:pt-28">

        {/* ── Greeting ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <h1 className="text-center text-xl font-semibold text-foreground">
            {scope === "org" ? "Manage your organization" : "Manage your account"}
          </h1>

          {/* Genie command bar */}
          <GenieCommandBar />

          {/* Overview cards */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {OVERVIEW.map((m) => (
              <Card
                key={m.label}
                className="cursor-pointer py-3 transition-shadow hover:shadow-[var(--shadow-db-lg)]"
                onClick={() => {
                  if ("href" in m) router.push(m.href)
                }}
              >
                <CardContent className="flex flex-col gap-1 px-4">
                  <div className="text-sm font-semibold text-accent-foreground">{m.label}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[18px] font-semibold text-foreground">{m.value}</span>
                    <span className={`text-xs ${CHANGE_TONE_CLASS[m.changeTone]}`}>{m.change}</span>
                    <span className="text-xs text-muted-foreground">this week</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Review + Getting started (side by side) ───────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <section className="flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold text-foreground">Review</h2>
            <div className="rounded-md border border-border">
              {ALERTS.map((alert, i) => (
                <button
                  type="button"
                  key={alert.id}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 ${
                    i < ALERTS.length - 1 ? "border-b border-border" : ""
                  }`}
                  onClick={() => handleReviewClick(alert)}
                >
                  {ALERT_ICON[alert.level]}
                  <span className="flex-1 text-sm text-foreground">{alert.text}</span>
                  <ChevronRightIcon width={18} height={18} className="shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>

          <SetupChecklist initialCompleted={["sso", "admins"]} />

        </div>

      </div>
  )
}
