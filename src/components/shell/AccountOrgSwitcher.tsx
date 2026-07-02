"use client"

import * as React from "react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckIcon, ChevronDownIcon, OfficeIcon } from "@/components/icons"
import { DbIcon } from "@/components/ui/db-icon"
import { cn } from "@/lib/utils"
import { useAccountScope } from "./AppShell"

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
  const selectedAccount = ACCOUNTS.find((account) => account.id === scope)
  const label = scope === "org" ? ORG_NAME : selectedAccount?.name
  const compact = variant === "compact"

  return (
    <div className={cn("shrink-0 px-2 pb-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center rounded-md border border-border bg-background text-left text-sm font-normal text-foreground transition-colors hover:bg-muted-foreground/10",
              compact ? "h-12 w-full justify-center px-1.5" : "h-11 w-full gap-2 pl-1.5 pr-2",
            )}
            title={label}
            aria-label={`Switch account or organization, current scope ${label}`}
          >
            <NikeLogo />
            {!compact && (
              <>
                <span className="flex-1 truncate">{label}</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          <DropdownMenuItem
            className={cn(scope === "org" && "font-semibold text-primary")}
            onClick={() => setScope("org")}
          >
            <DbIcon icon={OfficeIcon} size={16} color={scope === "org" ? "primary" : "muted"} />
            {ORG_NAME}
            {scope === "org" && <CheckIcon className="ml-auto h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
            Accounts
          </DropdownMenuLabel>
          {ACCOUNTS.map((account) => (
            <DropdownMenuItem key={account.id} onClick={() => setScope(account.id)}>
              {account.name}
              {scope === account.id && <CheckIcon className="ml-auto h-3.5 w-3.5 text-primary" />}
              {account.isMain && scope !== account.id && (
                <span className="ml-auto text-xs text-muted-foreground">Main</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
