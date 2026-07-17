import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="data">
      <div className="p-6">
        <PageHeader title="Data" />
      </div>
    </AppShell>
  )
}
