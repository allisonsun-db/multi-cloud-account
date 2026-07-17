import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="tags">
      <div className="p-6">
        <PageHeader title="Tags" />
      </div>
    </AppShell>
  )
}
