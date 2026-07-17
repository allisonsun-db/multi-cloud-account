import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="cost">
      <div className="p-6">
        <PageHeader title="Cost" />
      </div>
    </AppShell>
  )
}
