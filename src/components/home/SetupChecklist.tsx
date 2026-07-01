"use client"

import * as React from "react"
import { CheckCircleFillIcon, CheckCircleIcon, ChevronRightIcon, MinusSquareIcon, PlusSquareIcon } from "@/components/icons"

type Step = {
  id: string
  label: string
  href: string
}

const STEPS: Step[] = [
  { id: "sso",     label: "Connect identity provider",  href: "/settings" },
  { id: "admins",  label: "Add account admins",         href: "/accounts" },
  { id: "audit",   label: "Enable audit log delivery",  href: "/settings" },
  { id: "network", label: "Configure network access",   href: "/settings" },
  { id: "billing", label: "Add billing contacts",       href: "/settings" },
]

export function SetupChecklist({ initialCompleted = [] }: { initialCompleted?: string[] }) {
  const completed = React.useMemo(() => new Set(initialCompleted), [initialCompleted])
  const [showCompleted, setShowCompleted] = React.useState(false)

  const completedSteps = STEPS.filter((step) => completed.has(step.id))
  const visibleSteps = STEPS.filter((step) => !completed.has(step.id))

  return (
    <section className="flex flex-col gap-3">
      {/* Header */}
      <h2 className="text-[15px] font-semibold text-foreground">Finish setup</h2>

      {/* Rows */}
      <div className="rounded-md border border-border">
        {completedSteps.length > 0 && (
          <>
            <button
              type="button"
              className={`flex w-full items-center bg-muted/40 px-3 py-2 text-left hover:bg-muted/70 ${
                showCompleted || visibleSteps.length > 0 ? "border-b border-border" : ""
              }`}
              aria-expanded={showCompleted}
              onClick={() => setShowCompleted((open) => !open)}
            >
              <span className="flex-1 text-sm text-accent-foreground">{completedSteps.length} items completed</span>
              {showCompleted ? (
                <MinusSquareIcon width={18} height={18} className="shrink-0 text-muted-foreground" />
              ) : (
                <PlusSquareIcon width={18} height={18} className="shrink-0 text-muted-foreground" />
              )}
            </button>
            {showCompleted && completedSteps.map((step, i) => {
              const isLastCompleted = i === completedSteps.length - 1
              const hasRemainingItems = visibleSteps.length > 0

              return (
                <div
                  key={step.id}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50 ${
                    !isLastCompleted ? "border-b border-border" : ""
                  } ${
                    isLastCompleted && hasRemainingItems ? "border-b border-muted-foreground/30" : ""
                  }`}
                >
                  <CheckCircleFillIcon width={16} height={16} className="shrink-0 text-[var(--success)]" />
                  <span className="flex-1 text-sm text-accent-foreground">{step.label}</span>
                  <ChevronRightIcon width={18} height={18} className="shrink-0 text-muted-foreground" />
                </div>
              )
            })}
          </>
        )}
        {visibleSteps.map((step, i) => {
          return (
            <div
              key={step.id}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50 ${
                i < visibleSteps.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <CheckCircleIcon width={16} height={16} className="shrink-0 text-muted-foreground/40" />

              <div className="flex-1">
                <span className="text-sm text-foreground">{step.label}</span>
              </div>

              <ChevronRightIcon width={18} height={18} className="shrink-0 text-muted-foreground" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
