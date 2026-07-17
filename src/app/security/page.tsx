import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="security">
      <div className="p-6">
        <PageHeader title="Security" />
      </div>
    </AppShell>
  )
}
