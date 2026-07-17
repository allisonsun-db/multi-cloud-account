import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="genie">
      <div className="p-6">
        <PageHeader title="Genie" />
      </div>
    </AppShell>
  )
}
