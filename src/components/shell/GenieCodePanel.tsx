"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { ChevronsLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DbIcon } from "@/components/ui/db-icon"
import { SuggestionPill } from "@/components/ui/suggestion-pill"
import { cn } from "@/lib/utils"
import {
  ArrowRightIcon,
  CloseIcon,
  CopyIcon,
  GenieCodeIcon,
  OverflowIcon,
  PlusIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@/components/icons"
import { GeniePrompt, type GenieTag } from "@/components/ai-elements/genie-prompt"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageToolbar,
} from "@/components/ai-elements/message"
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought"

interface GenieCodePanelProps {
  open: boolean
  onClose: () => void
  className?: string
  initialInput?: string
  initialTags?: GenieTag[]
  initialAutoSubmit?: boolean
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  thinking?: string
  actions?: string[]
}

const DEFAULT_SUGGESTION_CHIPS = [
  "Summarize this page",
  "Find issues that need attention",
  "Suggest next steps",
]

const PAGE_SUGGESTION_CHIPS: { prefix: string; chips: string[] }[] = [
  {
    prefix: "/home",
    chips: [
      "Review account health",
      "Prioritize setup tasks",
      "Explain this week's changes",
    ],
  },
  {
    prefix: "/workspaces",
    chips: [
      "Compare workspace usage",
      "Find risky workspaces",
      "Plan a new workspace",
    ],
  },
  {
    prefix: "/accounts",
    chips: [
      "Review account settings",
      "Find users needing attention",
      "Draft approval guidance",
    ],
  },
  {
    prefix: "/catalog",
    chips: [
      "Review catalog access",
      "Find workspace bindings",
      "Plan metastore changes",
    ],
  },
  {
    prefix: "/cloud-resources",
    chips: [
      "Review cloud resources",
      "Find configuration gaps",
      "Suggest cleanup actions",
    ],
  },
  {
    prefix: "/resilience",
    chips: [
      "Assess failover readiness",
      "Review replication plans",
      "Identify resilience gaps",
    ],
  },
  {
    prefix: "/settings",
    chips: [
      "Review account policies",
      "Find security gaps",
      "Explain this setting",
    ],
  },
  {
    prefix: "/previews",
    chips: [
      "Review enabled previews",
      "Assess rollout risk",
      "Summarize preview impact",
    ],
  },
  {
    prefix: "/dashboards",
    chips: [
      "Summarize dashboard usage",
      "Find stale dashboards",
      "Suggest dashboard improvements",
    ],
  },
  {
    prefix: "/jobs",
    chips: [
      "Review job health",
      "Find failed runs",
      "Suggest reliability fixes",
    ],
  },
  {
    prefix: "/org-nav",
    chips: [
      "Explain this navigation",
      "Find account-level tasks",
      "Suggest org governance actions",
    ],
  },
]

type MockResponse = {
  thinking: string
  answer: string
  actions: string[]
}

const DEFAULT_MOCK_RESPONSE: MockResponse = {
    thinking: "Analyzing the request and checking available data pipelines...",
    answer:
      "I recommend reviewing the affected resource, confirming ownership, and applying the required policy or configuration change before the end of the week. Say \"walk me through\" for remediation steps, or ask me to draft the exact changes to make.",
    actions: [
      "Walk me through remediation steps",
      "Draft the policy update",
      "Open the owner review checklist",
    ],
}

function getMockResponse(prompt: string): MockResponse {
  if (prompt.includes("12 users have no MFA enrolled")) {
    return {
      ...DEFAULT_MOCK_RESPONSE,
      actions: [
        "Walk me through MFA remediation",
        "Draft an MFA enrollment message",
        "Show users without MFA",
      ],
    }
  }

  if (prompt.includes("budget limit")) {
    return {
      ...DEFAULT_MOCK_RESPONSE,
      actions: [
        "Walk me through budget remediation",
        "Draft a spend reduction plan",
        "Show prod-west budget details",
      ],
    }
  }

  if (prompt.includes("access requests awaiting approval")) {
    return {
      ...DEFAULT_MOCK_RESPONSE,
      actions: [
        "Walk me through access review",
        "Draft approval criteria",
        "Show pending access requests",
      ],
    }
  }

  if (prompt.includes("non-expiring tokens")) {
    return {
      ...DEFAULT_MOCK_RESPONSE,
      actions: [
        "Walk me through token rotation",
        "Draft token expiration policy",
        "Show non-expiring tokens",
      ],
    }
  }

  return DEFAULT_MOCK_RESPONSE
}

let msgCounter = 0
function uid() {
  return `msg-${++msgCounter}`
}

export function GenieCodePanel({
  open,
  onClose,
  className,
  initialInput,
  initialTags,
  initialAutoSubmit = false,
}: GenieCodePanelProps) {
  const pathname = usePathname()
  const initialSubmittedText = initialAutoSubmit ? initialInput?.trim() : ""
  const [messages, setMessages] = useState<ChatMessage[]>(() => (
    initialSubmittedText
      ? [{ id: uid(), role: "user", content: initialSubmittedText }]
      : []
  ))
  const [input, setInput] = useState(initialAutoSubmit ? "" : initialInput ?? "")
  const [tags, setTags] = useState<GenieTag[]>(initialAutoSubmit ? [] : initialTags ?? [])
  const [isThinking, setIsThinking] = useState(Boolean(initialSubmittedText))
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  useEffect(() => {
    if (!initialSubmittedText) return

    const response = getMockResponse(initialSubmittedText)
    const timer = window.setTimeout(() => {
      setIsThinking(false)
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: response.answer,
          thinking: response.thinking,
          actions: response.actions,
        },
      ])
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [initialSubmittedText])

  const handleSubmit = (value: string) => {
    const text = value.trim()
    if (!text) return

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setTags([])
    setIsThinking(true)

    const response = getMockResponse(text)
    window.setTimeout(() => {
      setIsThinking(false)
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: response.answer,
          thinking: response.thinking,
          actions: response.actions,
        },
      ])
    }, 1800)
  }

  const handleSuggestion = (label: string) => {
    handleSubmit(label)
  }

  const handleNewConversation = () => {
    setMessages([])
    setInput("")
    setTags([])
    setIsThinking(false)
  }

  const isEmpty = messages.length === 0 && !isThinking
  const suggestionChips =
    PAGE_SUGGESTION_CHIPS.find((page) => pathname.startsWith(page.prefix))?.chips ??
    DEFAULT_SUGGESTION_CHIPS

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col overflow-hidden bg-background",
        open ? "w-[360px]" : "w-0",
        className,
      )}
    >
      {open && (
        <>
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
            <div className="flex flex-1 items-center gap-2">
              <ChevronsLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-[13px] font-semibold leading-5 text-foreground">
                Genie Code
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-xs" aria-label="New conversation" onClick={handleNewConversation}>
                <PlusIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-xs" aria-label="More options">
                <OverflowIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-xs" aria-label="Close Genie Code" onClick={onClose}>
                <CloseIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-3 pt-3">
            {isEmpty ? (
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="flex w-full flex-col items-center gap-4 px-6">
                  <DbIcon icon={GenieCodeIcon} color="ai" size={48} />
                  <div className="flex w-full flex-col items-center gap-2 text-center">
                    <p className="text-xl font-semibold leading-7 text-foreground">
                      Genie Code
                    </p>
                    <p className="text-[13px] leading-5 text-muted-foreground">
                      Manage account tasks faster
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap justify-center gap-2">
                    {suggestionChips.map((label) => (
                      <SuggestionPill key={label} onClick={() => handleSuggestion(label)}>
                        {label}
                      </SuggestionPill>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-3">
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <Message key={msg.id} from="user">
                      <MessageContent>{msg.content}</MessageContent>
                    </Message>
                  ) : (
                    <Message key={msg.id} from="assistant">
                      {msg.thinking && (
                        <ChainOfThought>
                          <ChainOfThoughtHeader isStreaming={false}>
                            Thought for a moment
                          </ChainOfThoughtHeader>
                          <ChainOfThoughtContent>
                            <ChainOfThoughtStep label={msg.thinking} />
                          </ChainOfThoughtContent>
                        </ChainOfThought>
                      )}
                      <MessageContent className="pl-3">{msg.content}</MessageContent>
                      {msg.actions && (
                        <div className="flex flex-col items-start gap-2 pl-3">
                          {msg.actions.map((action) => (
                            <button
                              key={action}
                              type="button"
                              className="inline-flex max-w-full items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                              onClick={() => handleSuggestion(action)}
                            >
                              <DbIcon icon={ArrowRightIcon} color="ai" size={16} />
                              <span className="truncate">{action}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      <MessageToolbar className="pl-3">
                        <MessageActions>
                          <MessageAction tooltip="Copy">
                            <CopyIcon className="h-4 w-4" />
                          </MessageAction>
                          <MessageAction tooltip="Helpful">
                            <ThumbsUpIcon className="h-4 w-4" />
                          </MessageAction>
                          <MessageAction tooltip="Not helpful">
                            <ThumbsDownIcon className="h-4 w-4" />
                          </MessageAction>
                        </MessageActions>
                      </MessageToolbar>
                    </Message>
                  )
                )}

                {isThinking && (
                  <Message from="assistant">
                    <ChainOfThought>
                      <ChainOfThoughtHeader isStreaming>
                        Thinking
                      </ChainOfThoughtHeader>
                    </ChainOfThought>
                  </Message>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 p-3">
            <GeniePrompt
              variant="chat"
              size="small"
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              tags={tags}
              onTagRemove={(id) => setTags((prev) => prev.filter((t) => t.id !== id))}
              placeholder="Ask Genie Code..."
            />
            <p className="mt-2 text-center text-[12px] leading-4 text-muted-foreground">
              Only use the agent with code and data you trust
            </p>
          </div>
        </>
      )}
    </div>
  )
}
