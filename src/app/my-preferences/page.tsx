"use client"

import * as React from "react"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NewWindowIcon } from "@/components/icons"
import { useTheme } from "next-themes"

export default function Page() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-6">
        <PageHeader title="My preferences" />

        <div className="flex flex-col gap-4">
          <Card className="shadow-none">
            <CardContent className="flex items-center justify-between gap-6 px-4">
              <div className="flex flex-col gap-1">
                <Label>Promotional email communications</Label>
                <p className="text-sm text-muted-foreground">
                  You may receive personalized recommendations based on your use of Databricks services.
                  To manage your promotional email communications, visit the Marketing preference center.
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                Manage
                <NewWindowIcon className="ml-1.5 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardContent className="flex items-center justify-between gap-6 px-4">
              <div className="flex flex-col gap-1">
                <Label>Interface theme</Label>
                <p className="text-sm text-muted-foreground">Select your interface scheme</p>
              </div>
              <Select value={mounted ? theme ?? "system" : "system"} onValueChange={setTheme}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Use system default settings</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardContent className="flex items-center justify-between gap-6 px-4">
              <div className="flex flex-col gap-1">
                <Label>Genie One homepage</Label>
                <p className="text-sm text-muted-foreground">
                  Customize the appearance of the Genie One homepage
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                Edit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
