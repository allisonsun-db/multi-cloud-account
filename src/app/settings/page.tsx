"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { DatabricksLogo } from "@/components/shell/DatabricksLogo"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ExternalLink, ArrowRight, Check, X, Pencil } from "lucide-react"

// ─── Account Settings Tab ─────────────────────────────────────────────────────

const DEFAULT_ACCOUNT_NAME = "Databricks Bakehouse"

function AccountSettingsTab({ saved, onSave }: { saved: string; onSave: (name: string) => void }) {
  const [accountName, setAccountName] = React.useState(saved)
  const [editing, setEditing] = React.useState(false)
  const [customUrlEnabled, setCustomUrlEnabled] = React.useState(true)
  const [redirectRow1, setRedirectRow1] = React.useState(true)
  const [redirectRow2, setRedirectRow2] = React.useState(false)
  const [multiCloud, setMultiCloud] = React.useState(false)

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* Account name */}
      <section className="flex items-start gap-4">
        <h2 className="text-sm font-semibold text-foreground w-[200px] shrink-0 pt-1.5">Account name</h2>
        <div className="flex flex-col gap-2 flex-1">
          {editing ? (
            <div className="flex items-center gap-1 w-[320px] self-end">
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Save"
                onClick={() => { onSave(accountName); setEditing(false) }}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Cancel"
                onClick={() => { setAccountName(saved); setEditing(false) }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 h-8">
              <span className="text-sm text-foreground">{accountName}</span>
              <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
          {/* Preview */}
          {editing && (
            <div className="flex items-center gap-2.5 rounded-md border border-border bg-muted px-3 h-8 self-end">
              <svg width={13} height={14} viewBox="0 0 105 113" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M98.9 46.5996L52.3 72.8996L2.4 44.7996L0 46.0996V66.4996L52.3 95.8996L98.9 69.6996V80.4996L52.3 106.8L2.4 78.6996L0 79.9996V83.4996L52.3 112.9L104.5 83.4996V63.0996L102.1 61.7996L52.3 89.7996L5.6 63.5996V52.7996L52.3 78.9996L104.5 49.5996V29.4996L101.9 27.9996L52.3 55.8996L8 31.0996L52.3 6.19961L88.7 26.6996L91.9 24.8996V22.3996L52.3 0.0996094L0 29.4996V32.6996L52.3 62.0996L98.9 35.7996V46.5996Z" fill="#FF3621" />
              </svg>
              <span className="text-sm text-foreground truncate">{accountName}</span>
            </div>
          )}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* Custom URL */}
      <section className="flex items-center justify-between gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">Custom URL</h2>
          <p className="text-sm text-muted-foreground">
            Contact your Databricks account team to rename.{" "}
            <a href="#" className="text-primary inline-flex items-center gap-0.5 hover:underline">
              Learn more <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground">{customUrlEnabled ? "On" : "Off"}</span>
            <Switch checked={customUrlEnabled} onCheckedChange={setCustomUrlEnabled} />
          </div>
          <span className="text-sm text-muted-foreground">dogfood.staging.databricks.com</span>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* Multi-cloud */}
      <section className="flex items-center justify-between gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">Multi-cloud</h2>
          <p className="text-sm text-muted-foreground">Enable workspaces across multiple cloud providers under this account.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-foreground">{multiCloud ? "On" : "Off"}</span>
          <Switch checked={multiCloud} onCheckedChange={setMultiCloud} />
        </div>
      </section>

      <div className="border-t border-border" />

      {/* Auto redirect settings */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Auto redirect settings</h2>
        <div className="rounded-md border border-border overflow-hidden">
          {/* Row 1 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <span className="text-sm text-foreground">e2-spog.staging.cloud.databricks.com</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm rounded bg-muted px-2 py-0.5 text-foreground">dogfood.staging.databricks.com</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-foreground">{redirectRow1 ? "On" : "Off"}</span>
              <Switch checked={redirectRow1} onCheckedChange={setRedirectRow1} />
            </div>
          </div>
          {/* Row 2 */}
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-sm text-muted-foreground">All previous workspace URLs</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm rounded bg-muted px-2 py-0.5 text-foreground">dogfood.staging.databricks.com</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-foreground font-semibold">{redirectRow2 ? "On" : "Off"}</span>
              <Switch checked={redirectRow2} onCheckedChange={setRedirectRow2} />
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [accountName, setAccountName] = React.useState(DEFAULT_ACCOUNT_NAME)

  return (
    <AppShell activeItem="settings" workspace={accountName}>
      <div className="flex flex-col p-6 max-w-[800px] mx-auto w-full">

        <h1 className="text-xl font-semibold text-foreground mb-2">Settings</h1>

        <Tabs defaultValue="account-settings">
          <TabsList variant="line" className="w-full justify-start border-b border-border mb-6">
            <TabsTrigger value="subscription" className="flex-none">Subscription &amp; billing</TabsTrigger>
            <TabsTrigger value="feature-enablement" className="flex-none">Feature enablement</TabsTrigger>
            <TabsTrigger value="my-preferences" className="flex-none">My preferences</TabsTrigger>
            <TabsTrigger value="account-settings" className="flex-none">Account settings</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription">
            <p className="text-sm text-muted-foreground">Subscription &amp; billing content.</p>
          </TabsContent>
          <TabsContent value="feature-enablement">
            <p className="text-sm text-muted-foreground">Feature enablement content.</p>
          </TabsContent>
          <TabsContent value="my-preferences">
            <p className="text-sm text-muted-foreground">My preferences content.</p>
          </TabsContent>
          <TabsContent value="account-settings">
            <AccountSettingsTab saved={accountName} onSave={setAccountName} />
          </TabsContent>
        </Tabs>

      </div>
    </AppShell>
  )
}
