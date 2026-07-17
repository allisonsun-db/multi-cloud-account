import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="billing">
      <div className="p-6">
        <PageHeader title="Subscription \& billing" />
      </div>
    </AppShell>
  )
}
