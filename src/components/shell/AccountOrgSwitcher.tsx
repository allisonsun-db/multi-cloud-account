"use client"

import * as React from "react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDownIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { useAccountScope } from "./AppShell"
import { setPersona } from "@/components/home/usePersona"

const ORG_NAME = "Nike Organization"

const ACCOUNTS = [
  { id: "main", name: "Nike", isMain: true },
  { id: "emea", name: "Nike EMEA", isMain: false },
  { id: "ds", name: "Nike Data Science", isMain: false },
  { id: "sandbox", name: "Nike Sandbox", isMain: false },
]

function NikeLogo() {
  return (
    <Image
      src="/nike-logo.png"
      alt=""
      width={28}
      height={28}
      className="h-7 w-7 shrink-0 rounded object-cover"
    />
  )
}

export function AccountOrgSwitcher({
  className,
  variant = "full",
}: {
  className?: string
  variant?: "full" | "compact"
}) {
  const { scope, setScope } = useAccountScope()
  const shouldBlurOnCloseRef = React.useRef(false)
  const selectedAccount = ACCOUNTS.find((account) => account.id === scope)
  const label = scope === "org" ? ORG_NAME : selectedAccount?.name
  const compact = variant === "compact"

  function selectScope(nextScope: string) {
    shouldBlurOnCloseRef.current = true
    setScope(nextScope)
    if (nextScope === "org") setPersona("org-admin")
    else setPersona("account-admin")
  }

  return (
    <div className={cn("shrink-0 px-2 pb-1", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center rounded-md bg-transparent text-left text-sm font-normal text-foreground transition-colors hover:bg-muted-foreground/10",
              compact ? "h-12 w-full justify-center px-1.5" : "h-11 w-full gap-2 pl-1.5 pr-2",
            )}
            title={label}
            aria-label={`Switch account or organization, current scope ${label}`}
          >
            <NikeLogo />
            {!compact && (
              <>
                <span className="truncate">{label}</span>
                <ChevronDownIcon className="-ml-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[220px]"
          onCloseAutoFocus={(event) => {
            if (!shouldBlurOnCloseRef.current) return

            event.preventDefault()
            shouldBlurOnCloseRef.current = false
          }}
        >
          <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
            Organization
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => selectScope("org")}>
            {ORG_NAME}
          </DropdownMenuItem>
          <div className="mx-2 my-1 h-px bg-border" />
          <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
            Accounts
          </DropdownMenuLabel>
          {ACCOUNTS.map((account) => (
            <DropdownMenuItem key={account.id} onClick={() => selectScope(account.id)}>
              {account.name}
              {account.isMain && <Badge variant="secondary" className="ml-auto font-normal">Main</Badge>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
