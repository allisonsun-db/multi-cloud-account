"use client"

import * as React from "react"
import { CheckCircleFillIcon, CheckCircleIcon, ChevronDownIcon, ChevronRightIcon, ChevronUpIcon } from "@/components/icons"
import type { SetupStep } from "./personaConfigs"

const DEFAULT_STEPS: SetupStep[] = [
  { id: "sso",     label: "Connect identity provider",  href: "/settings", done: true },
  { id: "admins",  label: "Assign admin roles",         href: "/accounts", done: true },
  { id: "audit",   label: "Enable audit log delivery",  href: "/settings" },
  { id: "network", label: "Configure network access",   href: "/settings" },
  { id: "billing", label: "Add billing information",    href: "/settings" },
]

export function SetupChecklist({ steps = DEFAULT_STEPS, onHide }: { steps?: SetupStep[]; onHide?: () => void }) {
  const [showCompleted, setShowCompleted] = React.useState(false)

  const completedSteps = steps.filter((step) => step.done)
  const visibleSteps = steps.filter((step) => !step.done)

  return (
    <section className="flex flex-col gap-3">
      {/* Header */}
      <div className="group/setup-header flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-semibold text-foreground">Finish setup</h2>
        {onHide && (
          <button
            type="button"
            className="pr-4 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-accent-foreground group-hover/setup-header:opacity-100"
            onClick={onHide}
          >
            Hide
          </button>
        )}
      </div>

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
              <span className="flex-1 text-sm text-accent-foreground">{completedSteps.length} of {steps.length} completed</span>
              {showCompleted ? (
                <ChevronUpIcon width={18} height={18} className="shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDownIcon width={18} height={18} className="shrink-0 text-muted-foreground" />
              )}
            </button>
            {showCompleted && completedSteps.map((step, i) => {
              const isLastCompleted = i === completedSteps.length - 1
              const hasRemainingItems = visibleSteps.length > 0

              return (
                <div
                  key={step.id}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50 ${
                    !isLastCompleted ? "relative after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-border" : ""
                  } ${
                    isLastCompleted && hasRemainingItems ? "relative after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-border" : ""
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
                i < visibleSteps.length - 1 ? "relative after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-border" : ""
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
