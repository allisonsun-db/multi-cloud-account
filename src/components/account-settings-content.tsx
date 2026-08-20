"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { LoadingIcon, PencilIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ArrowRight, Check, CircleCheck, Loader2, X } from "lucide-react"
import { toast } from "sonner"

export const DEFAULT_ACCOUNT_NAME = "OmniMart"

function MultiCloudLogosGraphic() {
  const cardBase = "bg-background border border-border flex items-center justify-center rounded-md shadow-[0px_2px_3px_0px_rgba(0,0,0,0.05),0px_1px_0px_0px_rgba(0,0,0,0.02)] size-10 shrink-0"
  return (
    <div className="flex items-center -space-x-1">
      <div className="flex items-center justify-center size-[42px]">
        <div className="-rotate-3">
          <div className={cardBase}>
            <img src={CLOUD_LOGO["AWS"]} alt="AWS" width={24} height={15} className="object-contain dark:[filter:brightness(0)_invert(1)]" />
          </div>
        </div>
      </div>
      <div className={cn(cardBase, "relative z-10")}>
        <img src={CLOUD_LOGO["Azure"]} alt="Azure" width={20} height={20} className="object-contain" />
      </div>
      <div className="flex items-center justify-center size-[42px]">
        <div className="rotate-3">
          <div className={cardBase}>
            <img src={CLOUD_LOGO["GCP"]} alt="GCP" width={24} height={20} className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function AccountSettingsContent({ saved, onSave }: { saved: string; onSave: (name: string) => void }) {
  const [accountName, setAccountName] = React.useState(saved)
  const [editing, setEditing] = React.useState(false)
  const [redirectRow1, setRedirectRow1] = React.useState(true)
  const [redirectRow2, setRedirectRow2] = React.useState(false)
  const [multiCloud, setMultiCloud] = React.useState(false)
  const [multiCloudModal, setMultiCloudModal] = React.useState(false)
  const [multiCloudLoading, setMultiCloudLoading] = React.useState(false)
  const [loadingProgress, setLoadingProgress] = React.useState(0)
  const toastShownRef = React.useRef(false)

  React.useEffect(() => {
    if (!multiCloudLoading) return
    setLoadingProgress(0)
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setMultiCloud(true)
            setMultiCloudModal(false)
            setMultiCloudLoading(false)
            setLoadingProgress(0)
            if (!toastShownRef.current) {
              toastShownRef.current = true
              toast.success("Multi-cloud enabled")
            }
          }, 600)
          return 100
        }
        return prev + 1
      })
    }, 25)
    return () => clearInterval(interval)
  }, [multiCloudLoading])

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h3 className="mb-3 text-[15px] font-semibold text-foreground">Customization</h3>
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-start gap-4 px-4 py-4">
              <span className="w-[200px] shrink-0 pt-[5px] text-sm font-semibold text-foreground">Account name</span>
              <div className="flex flex-1 flex-col gap-2">
                {editing ? (
                  <div className="flex items-start gap-1 self-end">
                    <div className="flex w-[260px] flex-col gap-2">
                      <Input
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        autoFocus
                      />
                      <div className="flex h-8 items-center gap-2.5 rounded-md border border-border bg-muted px-3">
                        <svg width={13} height={14} viewBox="0 0 105 113" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M98.9 46.5996L52.3 72.8996L2.4 44.7996L0 46.0996V66.4996L52.3 95.8996L98.9 69.6996V80.4996L52.3 106.8L2.4 78.6996L0 79.9996V83.4996L52.3 112.9L104.5 83.4996V63.0996L102.1 61.7996L52.3 89.7996L5.6 63.5996V52.7996L52.3 78.9996L104.5 49.5996V29.4996L101.9 27.9996L52.3 55.8996L8 31.0996L52.3 6.19961L88.7 26.6996L91.9 24.8996V22.3996L52.3 0.0996094L0 29.4996V32.6996L52.3 62.0996L98.9 35.7996V46.5996Z" fill="#FF3621" />
                        </svg>
                        <span className="truncate text-sm text-foreground">{accountName}</span>
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
                  <div className="flex h-8 items-center justify-end gap-2">
                    <span className="text-sm text-foreground">{accountName}</span>
                    <Button variant="ghost" size="icon-sm" className="size-7 text-muted-foreground" aria-label="Edit" onClick={() => setEditing(true)}>
                      <PencilIcon size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-center justify-between gap-8 px-4 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Custom URL</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm text-foreground">omnimart.databricks.com</span>
                <Button variant="ghost" size="icon-sm" className="size-7 text-muted-foreground" aria-label="Edit">
                  <PencilIcon size={16} />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex flex-col gap-3 px-4 py-4">
              <span className="text-sm font-semibold text-foreground">Auto redirect</span>
              <div className="overflow-hidden rounded-md border border-border">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <span className="text-sm text-foreground">e2-spog.staging.cloud.databricks.com</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="rounded bg-muted px-2 py-0.5 text-sm text-foreground">omnimart.databricks.com</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-foreground">{redirectRow1 ? "On" : "Off"}</span>
                    <Switch checked={redirectRow1} onCheckedChange={setRedirectRow1} />
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm text-accent-foreground">All previous workspace URLs</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="rounded bg-muted px-2 py-0.5 text-sm text-foreground">omnimart.databricks.com</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-foreground">{redirectRow2 ? "On" : "Off"}</span>
                    <Switch checked={redirectRow2} onCheckedChange={setRedirectRow2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="mb-3 text-[15px] font-semibold text-foreground">Multi-cloud</h3>
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-center justify-between gap-8 px-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">Multi-cloud</span>
              <p className="text-sm text-muted-foreground">Enable management across clouds under your account.</p>
            </div>
            <div className="shrink-0">
              {multiCloud ? (
                <span className="flex items-center gap-1.5 text-sm text-foreground">
                  <CircleCheck className="h-4 w-4 text-[var(--success)]" />
                  Enabled
                </span>
              ) : (
                <Button variant="outline" size="sm" className="shadow-xs" onClick={() => setMultiCloudModal(true)}>Enable</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={multiCloudModal} onOpenChange={(o) => { if (!o) { setMultiCloudModal(false); setMultiCloudLoading(false); setLoadingProgress(0) } }}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-[480px]">
          <VisuallyHidden><DialogTitle>Enable multi-cloud</DialogTitle></VisuallyHidden>

          {multiCloudLoading ? (
            <div className="flex flex-col gap-5 px-8 pb-8 pt-10">
              <div className="flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                  <LoadingIcon size={28} className="animate-spin text-primary" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-center">
                <h2 className="text-lg font-semibold text-foreground">Enabling multi-cloud</h2>
                <p className="text-sm text-muted-foreground">We are configuring your account with multi-cloud capabilities...</p>
              </div>

              <div className="flex flex-col gap-3">
                {([
                  { label: "Setting up your URL", threshold: 25 },
                  { label: "Configuring organization settings", threshold: 50 },
                  { label: "Linking accounts", threshold: 75 },
                  { label: "Finalizing setup", threshold: 100 },
                ] as const).map(({ label, threshold }) => {
                  const done = loadingProgress >= threshold
                  const active = !done && loadingProgress >= threshold - 25
                  return (
                    <div key={label} className="flex items-center gap-3">
                      {done ? (
                        <Check className="h-4 w-4 shrink-0 text-[var(--success)]" />
                      ) : active ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                      ) : (
                        <span className="h-4 w-4 shrink-0" />
                      )}
                      <span className={cn("text-sm", done || active ? "text-foreground" : "text-muted-foreground")}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 px-8 pb-8 pt-10 text-center">
              <MultiCloudLogosGraphic />
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-semibold text-foreground">Enable multi-cloud</h2>
                <p className="text-sm text-muted-foreground">Enterprise management across clouds</p>
              </div>
              <div className="flex w-full flex-col gap-3 rounded-md bg-muted px-4 py-4 text-left">
                {[
                  "Unify data and AI across clouds",
                  "Shift workloads without moving data",
                  "Universal flex, billing, and management",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CircleCheck className="h-4 w-4 shrink-0 text-[var(--success)]" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={() => setMultiCloudLoading(true)}
              >
                Get started
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
