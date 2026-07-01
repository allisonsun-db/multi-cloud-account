"use client"

import * as React from "react"
import type { ComponentProps, ReactNode } from "react"
import { CheckCircle2Icon, ChevronDownIcon, DotIcon, LoaderCircleIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChainOfThoughtContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const ChainOfThoughtContext = React.createContext<ChainOfThoughtContextValue | null>(null)

function useChainOfThought() {
  const context = React.useContext(ChainOfThoughtContext)

  if (!context) {
    throw new Error("ChainOfThought components must be used within ChainOfThought")
  }

  return context
}

export type ChainOfThoughtProps = ComponentProps<"div"> & {
  defaultOpen?: boolean
}

export function ChainOfThought({
  className,
  defaultOpen = false,
  children,
  ...props
}: ChainOfThoughtProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const value = React.useMemo(() => ({ isOpen, setIsOpen }), [isOpen])

  return (
    <ChainOfThoughtContext.Provider value={value}>
      <div className={cn("not-prose w-full space-y-3", className)} {...props}>
        {children}
      </div>
    </ChainOfThoughtContext.Provider>
  )
}

export type ChainOfThoughtHeaderProps = ComponentProps<"button"> & {
  isStreaming?: boolean
}

export function ChainOfThoughtHeader({
  className,
  children,
  isStreaming = false,
  ...props
}: ChainOfThoughtHeaderProps) {
  const { isOpen, setIsOpen } = useChainOfThought()

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        className,
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {isStreaming ? (
        <LoaderCircleIcon className="size-4 shrink-0 animate-spin" />
      ) : (
        <CheckCircle2Icon className="size-4 shrink-0" />
      )}
      <span>{children ?? "Thinking"}</span>
      <ChevronDownIcon
        className={cn(
          "size-3.5 shrink-0 transition-transform",
          isOpen ? "rotate-180" : "rotate-0",
        )}
      />
    </button>
  )
}

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: LucideIcon
  label: ReactNode
  description?: ReactNode
  status?: "complete" | "active" | "pending"
}

const stepStatusStyles = {
  active: "text-foreground",
  complete: "text-muted-foreground",
  pending: "text-muted-foreground/50",
}

export function ChainOfThoughtStep({
  className,
  icon: Icon = DotIcon,
  label,
  description,
  status = "complete",
  children,
  ...props
}: ChainOfThoughtStepProps) {
  return (
    <div
      className={cn(
        "flex gap-2 text-sm",
        stepStatusStyles[status],
        "fade-in-0 slide-in-from-top-2 animate-in",
        className,
      )}
      {...props}
    >
      <div className="relative mt-0.5">
        <Icon className="size-4" />
        <div className="absolute bottom-0 left-1/2 top-7 -mx-px w-px bg-border" />
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div>{label}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
        {children}
      </div>
    </div>
  )
}

export type ChainOfThoughtContentProps = ComponentProps<"div">

export function ChainOfThoughtContent({
  className,
  children,
  ...props
}: ChainOfThoughtContentProps) {
  const { isOpen } = useChainOfThought()

  if (!isOpen) return null

  return (
    <div className={cn("mt-2 space-y-3 pl-3 text-popover-foreground outline-none", className)} {...props}>
      {children}
    </div>
  )
}
