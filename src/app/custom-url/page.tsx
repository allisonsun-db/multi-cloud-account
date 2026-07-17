import { AppShell, PageHeader } from "@/components/shell"

export default function Page() {
  return (
    <AppShell activeItem="custom-url">
      <div className="p-6">
        <PageHeader title="Custom URL" />
      </div>
    </AppShell>
  )
}
