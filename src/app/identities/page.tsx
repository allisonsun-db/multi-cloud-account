import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="identities">
      <div className="p-6">
        <PageHeader title="Identities" />
      </div>
    </AppShell>
  )
}
