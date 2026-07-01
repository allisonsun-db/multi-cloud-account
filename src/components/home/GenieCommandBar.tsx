"use client"

import * as React from "react"
import { Search, MessageCircleMore, ArrowRight } from "lucide-react"

type Mode = "search" | "ask"

export function GenieCommandBar() {
  const [mode, setMode] = React.useState<Mode>("ask")
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div
      className="w-full rounded-2xl bg-background px-5 py-4 shadow-[var(--shadow-db-lg)]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search or ask anything about your account..."
        className="mb-4 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />

      {/* Bottom row: unified mode toggle + submit */}
      <div className="flex items-center justify-between">
        {/* Search / Ask toggle */}
        <div className="inline-flex items-center rounded-full bg-secondary p-0.5">
          {(["ask", "search"] as Mode[]).map((m) => (
            <button
              key={m}
              className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-sm font-normal leading-none transition-colors ${
                mode === m
                  ? "border border-border bg-background text-foreground shadow-[var(--shadow-db-sm)]"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={(e) => { e.stopPropagation(); setMode(m) }}
            >
              {m === "ask"
                ? <MessageCircleMore className="h-4 w-4" />
                : <Search className="h-4 w-4" />
              }
              {m === "ask" ? "Ask" : "Search"}
            </button>
          ))}
        </div>

        {/* Submit arrow */}
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted"
          onClick={(e) => e.stopPropagation()}
          aria-label="Submit"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
