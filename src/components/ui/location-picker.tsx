"use client"

import * as React from "react"
import { ChevronRight, ChevronLeft, ChevronDown, X, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export const CLOUD_LOGO: Record<string, string> = {
  AWS: "/aws.png", Azure: "/azure.svg", GCP: "/gcp.svg",
}

export const CLOUD_ICONS: Record<string, React.ReactNode> = {
  AWS:   <img src="/aws.png"   alt="AWS"   width={16} height={16} className="object-contain dark:[filter:brightness(0)_invert(1)]" />,
  Azure: <img src="/azure.svg" alt="Azure" width={16} height={16} className="object-contain" />,
  GCP:   <img src="/gcp.svg"   alt="GCP"   width={16} height={16} className="object-contain" />,
}

export function buildCloudRegions(items: { cloud: string; region: string }[]) {
  const map: Record<string, string[]> = {}
  for (const item of items) {
    if (!map[item.cloud]) map[item.cloud] = []
    if (!map[item.cloud].includes(item.region)) map[item.cloud].push(item.region)
  }
  for (const c of Object.keys(map)) map[c].sort()
  return map
}

export function LocationPicker({ value, onChange, cloudRegions }: {
  value: string[]
  onChange: (v: string[]) => void
  cloudRegions: Record<string, string[]>
}) {
  const [open, setOpen] = React.useState(false)
  const [activeCloud, setActiveCloud] = React.useState<string | null>(null)

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  }

  function toggleAllCloud(cloud: string) {
    const regions = cloudRegions[cloud] ?? []
    const allSelected = regions.every(r => value.includes(`${cloud}:${r}`))
    if (allSelected) {
      onChange(value.filter(v => !v.startsWith(`${cloud}:`)))
    } else {
      const toAdd = regions.filter(r => !value.includes(`${cloud}:${r}`)).map(r => `${cloud}:${r}`)
      onChange([...value, ...toAdd])
    }
  }

  function cloudSelectedCount(cloud: string) {
    return (cloudRegions[cloud] ?? []).filter(r => value.includes(`${cloud}:${r}`)).length
  }

  function isAllCloudSelected(cloud: string) {
    const regions = cloudRegions[cloud] ?? []
    return regions.length > 0 && regions.every(r => value.includes(`${cloud}:${r}`))
  }

  // Trigger label
  let label: string
  let triggerCloud: string | null = null
  if (value.length === 0) {
    label = "Select region"
  } else if (value.length === 1) {
    const v = value[0]
    label = v.includes(":") ? v.split(":")[1] : v
    triggerCloud = v.includes(":") ? v.split(":")[0] : v
  } else {
    label = `${value.length} regions`
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setActiveCloud(null) }}>
      <PopoverTrigger asChild>
        <button className={cn("flex h-8 w-52 items-center justify-between rounded border border-border bg-background px-3 text-sm shadow-xs hover:bg-muted", value.length === 0 ? "text-muted-foreground" : "text-foreground")}>
          <span className="flex items-center gap-1.5 truncate min-w-0">
            {triggerCloud && <img src={CLOUD_LOGO[triggerCloud]} alt={triggerCloud} width={14} height={14} className={cn("object-contain shrink-0", triggerCloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")} />}
            <span className="truncate">{label}</span>
          </span>
          {value.length > 0 ? (
            <span
              role="button"
              aria-label="Clear"
              className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onChange([]) }}
            >
              <X className="h-3.5 w-3.5" />
            </span>
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground ml-2" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1" align="start">
        {activeCloud === null ? (
          <>
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Clouds</div>
            {(["AWS", "Azure", "GCP"] as const).map((c) => {
              const count = cloudSelectedCount(c)
              return (
                <button key={c} onClick={() => setActiveCloud(c)} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted">
                  <span className="flex items-center gap-2">
                    <img src={CLOUD_LOGO[c]} alt={c} width={14} height={14} className={cn("object-contain", c === "AWS" && "dark:[filter:brightness(0)_invert(1)]")} />
                    {c}
                  </span>
                  <span className="flex items-center gap-1">
                    {count > 0 && <span className="text-xs text-primary font-semibold">{count}</span>}
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                </button>
              )
            })}
          </>
        ) : (
          <>
            <button onClick={() => setActiveCloud(null)} className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted">
              <ChevronLeft className="h-3.5 w-3.5" />
              Clouds
            </button>
            <button
              onClick={() => toggleAllCloud(activeCloud)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
            >
              <img src={CLOUD_LOGO[activeCloud]} alt={activeCloud} width={14} height={14} className={cn("object-contain shrink-0", activeCloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")} />
              <span className="flex-1 text-left">All {activeCloud} regions</span>
              {isAllCloudSelected(activeCloud) && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
            {(cloudRegions[activeCloud] ?? []).map((r) => {
              const key = `${activeCloud}:${r}`
              const checked = value.includes(key)
              return (
                <button key={r} onClick={() => toggle(key)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
                  <img src={CLOUD_LOGO[activeCloud]} alt={activeCloud} width={14} height={14} className={cn("object-contain shrink-0", activeCloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")} />
                  <span className="flex-1 text-left">{r}</span>
                  {checked && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              )
            })}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
