"use client"

import { useCallback, useRef } from "react"
import type { ComponentType, KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import {
  ArrowRightIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  CloseSmallIcon,
  ColumnIcon,
  DagHorizontalIcon,
  NotebookIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons"

export type GenieMode = "ask" | "search"
export type GenieVariant = "toggle" | "chat" | "compact"
export type GenieSize = "default" | "small"
export type GenieTagKind = "node" | "column" | "notebook"

export interface GenieTag {
  id: string
  label: string
  kind?: GenieTagKind
}

export interface GeniePromptProps {
  mode?: GenieMode
  onModeChange?: (mode: GenieMode) => void
  variant?: GenieVariant
  size?: GenieSize
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string, tags: GenieTag[]) => void
  tags?: GenieTag[]
  onTagRemove?: (id: string) => void
  modelName?: string
  placeholder?: string
  className?: string
}

const tagIcons: Record<GenieTagKind, ComponentType<{ size?: number; className?: string }>> = {
  node: DagHorizontalIcon,
  column: ColumnIcon,
  notebook: NotebookIcon,
}

function TagChip({
  tag,
  onRemove,
}: {
  tag: GenieTag
  onRemove?: (id: string) => void
}) {
  const Icon = tag.kind ? tagIcons[tag.kind] : null

  return (
    <span className="inline-flex h-5 shrink-0 items-center overflow-clip rounded bg-foreground/5">
      <span className="flex items-center gap-1 pl-1 pr-0.5 text-foreground">
        {Icon && <Icon size={12} className="shrink-0" />}
        <span className="whitespace-nowrap text-xs leading-5">{tag.label}</span>
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(tag.id)}
          className="flex items-start rounded-br rounded-tr p-[3px] transition-colors hover:bg-foreground/10"
          aria-label={`Remove ${tag.label}`}
        >
          <CloseSmallIcon size={14} className="text-muted-foreground" />
        </button>
      )}
    </span>
  )
}

function ModelSelector({ modelName = "Mythos 6.7 (max)" }: { modelName?: string }) {
  return (
    <button
      type="button"
      className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="whitespace-nowrap">{modelName}</span>
      <ChevronDownIcon size={16} className="shrink-0" />
    </button>
  )
}

function SegmentedControl({
  mode,
  onChange,
}: {
  mode: GenieMode
  onChange: (mode: GenieMode) => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-px rounded-full bg-secondary p-px">
      {(["ask", "search"] as GenieMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm capitalize leading-5 transition-colors",
            mode === m
              ? "border border-border bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

function SubmitButton({
  mode,
  size = "default",
  onClick,
}: {
  mode: GenieMode
  size?: GenieSize
  onClick?: () => void
}) {
  const Icon = mode === "search" ? ArrowRightIcon : ArrowUpIcon
  const isSmall = size === "small"

  return (
    <button
      type="submit"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center justify-center bg-secondary transition-colors hover:bg-border",
        isSmall ? "h-6 w-6 rounded" : "h-8 w-8 rounded-full",
      )}
      aria-label="Submit"
    >
      <Icon size={16} className="text-foreground" />
    </button>
  )
}

export function GeniePrompt({
  mode = "ask",
  onModeChange,
  variant = "chat",
  size = "default",
  value = "",
  onChange,
  onSubmit,
  tags = [],
  onTagRemove,
  modelName,
  placeholder,
  className,
}: GeniePromptProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isSmall = size === "small"

  const defaultPlaceholder =
    mode === "search"
      ? "Search Dashboards, Genie spaces, and Apps..."
      : "Ask a question..."

  const handleSubmit = useCallback(() => {
    onSubmit?.(value, tags)
  }, [onSubmit, value, tags])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  const outerClassName = cn(
    "w-full overflow-clip border border-border bg-background",
    isSmall ? "rounded-md" : "rounded-[24px]",
    isSmall
      ? "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.05),0px_1px_0px_0px_rgba(0,0,0,0.02)]"
      : "shadow-[0px_3px_6px_0px_rgba(0,0,0,0.05)]",
    className,
  )

  const inputRow = (
    <div
      className="flex w-full items-center gap-1.5"
      onClick={() => textareaRef.current?.focus()}
    >
      {mode === "search" && variant !== "toggle" && (
        <SearchIcon size={16} className="shrink-0 text-muted-foreground" />
      )}
      {tags.map((tag) => (
        <TagChip key={tag.id} tag={tag} onRemove={onTagRemove} />
      ))}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? defaultPlaceholder}
        rows={1}
        className="max-h-32 min-w-0 flex-1 resize-none bg-transparent text-sm leading-5 text-foreground outline-none field-sizing-content placeholder:text-muted-foreground"
      />
    </div>
  )

  const plusButton = (
    <button
      type="button"
      className={cn(
        "flex shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground",
        isSmall ? "h-6 w-6" : "h-8 w-8",
      )}
      aria-label="Add context"
    >
      <PlusIcon size={16} />
    </button>
  )

  if (variant === "toggle") {
    return (
      <form className={outerClassName} onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
        <div className={cn("flex flex-col gap-4", isSmall ? "p-2" : "p-4")}>
          <div className="h-6">{inputRow}</div>
          <div className="flex h-8 items-center gap-2">
            <SegmentedControl mode={mode} onChange={(m) => onModeChange?.(m)} />
            {mode === "ask" && plusButton}
            <div className="flex-1" />
            <ModelSelector modelName={modelName} />
            <SubmitButton mode={mode} size={size} />
          </div>
        </div>
      </form>
    )
  }

  if (variant === "compact") {
    return (
      <form className={outerClassName} onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
        <div className={cn("flex items-center gap-4", isSmall ? "px-3 py-2" : "py-2 pl-4 pr-2")}>
          <div className="min-w-0 flex-1">{inputRow}</div>
          <div className="flex shrink-0 items-center gap-2">
            <ModelSelector modelName={modelName} />
            <SubmitButton mode={mode} size={size} />
          </div>
        </div>
      </form>
    )
  }

  return (
    <form className={outerClassName} onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
      <div className={cn("flex flex-col gap-4", isSmall ? "p-2" : "p-4")}>
        <div className={cn("min-h-6", isSmall && "min-h-5")}>{inputRow}</div>
        <div className="flex items-center gap-2">
          {plusButton}
          <div className="flex-1" />
          <ModelSelector modelName={modelName} />
          <SubmitButton mode={mode} size={size} />
        </div>
      </div>
    </form>
  )
}
