import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="knowledge-platform">
      <div className="p-6">
        <PageHeader title="Knowledge platform" />
      </div>
    </AppShell>
  )
}
