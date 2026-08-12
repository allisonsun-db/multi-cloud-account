"use client"

import { AppShell, ManagedByOrganizationBanner, PageHeader, useAccountScope } from "@/components/shell"

function IdentityProviderContent() {
  const { scope, setScope } = useAccountScope()
  const isAccountScope = scope !== "org"

  return (
    <div className="flex flex-col">
      {isAccountScope && <ManagedByOrganizationBanner onSwitchToOrg={() => setScope("org")} />}
      <div className="mx-auto w-full max-w-[1000px] p-6">
        <PageHeader title="Identity provider" />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AppShell activeItem="identity-provider" contentClassName="max-w-none">
      <IdentityProviderContent />
    </AppShell>
  )
}
