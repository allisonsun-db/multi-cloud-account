import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="identity-provider">
      <div className="p-6">
        <PageHeader title="Identity provider" />
      </div>
    </AppShell>
  )
}
