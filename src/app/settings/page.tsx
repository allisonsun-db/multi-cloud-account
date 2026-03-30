"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { DatabricksLogo } from "@/components/shell/DatabricksLogo"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ExternalLink, ArrowRight, Check, X, Pencil, CircleCheck } from "lucide-react"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { WorkspacesIcon } from "@/components/icons"

// ─── Account Settings Tab ─────────────────────────────────────────────────────

const DEFAULT_ACCOUNT_NAME = "Databricks Bakehouse"

function AccountSettingsTab({ saved, onSave }: { saved: string; onSave: (name: string) => void }) {
  const [accountName, setAccountName] = React.useState(saved)
  const [editing, setEditing] = React.useState(false)
  const [customUrlEnabled, setCustomUrlEnabled] = React.useState(true)
  const [redirectRow1, setRedirectRow1] = React.useState(true)
  const [redirectRow2, setRedirectRow2] = React.useState(false)
  const [multiCloud, setMultiCloud] = React.useState(false)
  const [multiCloudModal, setMultiCloudModal] = React.useState(false)
  const [cloudProviders, setCloudProviders] = React.useState({ AWS: true, GCP: true, Azure: false })

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* Customization group */}
      <div className="flex flex-col gap-1">
        <h3 className="text-[15px] font-semibold text-foreground mb-3">Customization</h3>
        <div className="rounded-md border border-border overflow-hidden">

          {/* Account name */}
          <div className="flex items-center gap-4 px-4 py-4">
            <span className="text-sm font-semibold text-foreground w-[200px] shrink-0">Account name</span>
            <div className="flex flex-col gap-2 flex-1">
              {editing ? (
                <div className="flex items-start gap-1 self-end">
                  <div className="flex flex-col gap-2 w-[260px]">
                    <Input
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      autoFocus
                    />
                    <div className="flex items-center gap-2.5 rounded-md border border-border bg-muted px-3 h-8">
                      <svg width={13} height={14} viewBox="0 0 105 113" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M98.9 46.5996L52.3 72.8996L2.4 44.7996L0 46.0996V66.4996L52.3 95.8996L98.9 69.6996V80.4996L52.3 106.8L2.4 78.6996L0 79.9996V83.4996L52.3 112.9L104.5 83.4996V63.0996L102.1 61.7996L52.3 89.7996L5.6 63.5996V52.7996L52.3 78.9996L104.5 49.5996V29.4996L101.9 27.9996L52.3 55.8996L8 31.0996L52.3 6.19961L88.7 26.6996L91.9 24.8996V22.3996L52.3 0.0996094L0 29.4996V32.6996L52.3 62.0996L98.9 35.7996V46.5996Z" fill="#FF3621" />
                      </svg>
                      <span className="text-sm text-foreground truncate">{accountName}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" aria-label="Save" onClick={() => { onSave(accountName); setEditing(false) }}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Cancel" onClick={() => { setAccountName(saved); setEditing(false) }}>
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
            </div>
          </div>

          <div className="border-t border-border mx-4" />

          {/* Custom URL */}
          <div className="flex items-center justify-between gap-8 px-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">Custom URL</span>
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
              <span className="text-sm text-accent-foreground">dogfood.staging.databricks.com</span>
            </div>
          </div>

          <div className="border-t border-border mx-4" />

          {/* Auto redirect */}
          <div className="flex flex-col gap-3 px-4 py-4">
            <span className="text-sm font-semibold text-foreground">Auto redirect</span>
            <div className="rounded-md border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <span className="text-sm text-foreground">e2-spog.staging.cloud.databricks.com</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm rounded bg-muted px-2 py-0.5 text-foreground">dogfood.staging.databricks.com</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-foreground">{redirectRow1 ? "On" : "Off"}</span>
                  <Switch checked={redirectRow1} onCheckedChange={setRedirectRow1} />
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm text-accent-foreground">All previous workspace URLs</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm rounded bg-muted px-2 py-0.5 text-foreground">dogfood.staging.databricks.com</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-foreground">{redirectRow2 ? "On" : "Off"}</span>
                  <Switch checked={redirectRow2} onCheckedChange={setRedirectRow2} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Multi-cloud group */}
      <div className="flex flex-col gap-1">
        <h3 className="text-[15px] font-semibold text-foreground mb-3">Multi-cloud</h3>
        <div className="rounded-md border border-border overflow-hidden">
          <div className="flex items-center justify-between gap-8 px-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">Multi-cloud</span>
              <p className="text-sm text-muted-foreground">Enable workspaces across multiple cloud providers under this account.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm text-foreground">{multiCloud ? "On" : "Off"}</span>
              <Switch
                checked={multiCloud}
                onCheckedChange={(v) => {
                  if (v) setMultiCloudModal(true)
                  else setMultiCloud(false)
                }}
              />
            </div>
          </div>

          {/* Cloud providers */}
          {multiCloud && (
          <>
            {([
              { key: "AWS",   name: "Amazon Web Services",  desc: "Deploy workspaces and resources on AWS infrastructure" },
              { key: "Azure", name: "Microsoft Azure",      desc: "Deploy workspaces and resources on Azure infrastructure" },
              { key: "GCP",   name: "Google Cloud Platform", desc: "Deploy workspaces and resources on GCP infrastructure" },
            ] as const).map(({ key, name, desc }) => (
              <React.Fragment key={key}>
                <div className="border-t border-border mx-4" />
                <div className="flex items-center gap-4 px-4 py-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted shrink-0">
                    <img src={CLOUD_LOGO[key]} alt={key} width={24} height={24} className={cn("object-contain", key === "AWS" && "dark:[filter:brightness(0)_invert(1)]")} />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground">{name}</span>
                    <span className="text-sm text-muted-foreground">{desc}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-foreground">{cloudProviders[key] ? "Enabled" : "Disabled"}</span>
                    {(() => {
                      const isLastEnabled = cloudProviders[key] && Object.values(cloudProviders).filter(Boolean).length === 1
                      return isLastEnabled ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Switch checked disabled />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>At least one cloud provider must be enabled</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Switch
                          checked={cloudProviders[key]}
                          onCheckedChange={(v) => setCloudProviders((prev) => ({ ...prev, [key]: v }))}
                        />
                      )
                    })()}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </>
          )}

        </div>
      </div>

      {/* Multi-cloud enable modal */}
      <Dialog open={multiCloudModal} onOpenChange={(o) => { if (!o) setMultiCloudModal(false) }}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
          <VisuallyHidden><DialogTitle>Enable multi-cloud</DialogTitle></VisuallyHidden>
          <div className="flex flex-col items-center gap-5 px-8 pt-10 pb-8 text-center">
            <div className="bg-primary/10 rounded-md p-3">
              <WorkspacesIcon size={32} className="text-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-semibold text-foreground">Enable multi-cloud</h2>
              <p className="text-sm text-muted-foreground">Enterprise management across clouds</p>
            </div>
            <div className="w-full bg-muted rounded-md px-4 py-4 flex flex-col gap-3 text-left">
              {[
                "Unify data and AI across clouds",
                "Shift workloads without moving data",
                "Universal flex, billing, and management",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CircleCheck className="h-4 w-4 text-[var(--success)] shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={() => { setMultiCloud(true); setMultiCloudModal(false) }}
            >
              Get started
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
