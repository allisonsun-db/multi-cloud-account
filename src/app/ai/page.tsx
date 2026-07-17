import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="ai">
      <div className="p-6">
        <PageHeader title="AI" />
      </div>
    </AppShell>
  )
}
