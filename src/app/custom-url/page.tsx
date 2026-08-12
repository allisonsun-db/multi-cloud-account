"use client"

import * as React from "react"
import { AccountSettingsContent, DEFAULT_ACCOUNT_NAME } from "@/components/account-settings-content"
import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  const [accountName, setAccountName] = React.useState(DEFAULT_ACCOUNT_NAME)

  return (
    <AppShell activeItem="custom-url" workspace={accountName}>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 p-6">
        <PageHeader title="Account settings" />
        <AccountSettingsContent saved={accountName} onSave={setAccountName} />
      </div>
    </AppShell>
  )
}
