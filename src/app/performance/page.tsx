import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="performance">
      <div className="p-6">
        <PageHeader title="Performance" />
      </div>
    </AppShell>
  )
}
