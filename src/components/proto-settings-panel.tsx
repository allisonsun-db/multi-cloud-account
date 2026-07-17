"use client"

import * as React from "react"
import { Settings, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEFAULT_NAV_VERSION, NAV_VERSIONS, NAV_VERSION_KEYS, type NavVersionKey } from "@/components/shell/navConfigs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PERSONA_KEYS, PERSONA_CONFIGS, DEFAULT_PERSONA, type PersonaKey } from "@/components/home/personaConfigs"
import { setPersona } from "@/components/home/usePersona"
import { setMaturity, DEFAULT_MATURITY, type Maturity } from "@/components/home/useMaturity"
import { setCardCustomization } from "@/components/home/useCardCustomization"

const NAV_DISPLAY_LABELS: Record<string, string> = {
  A: "Current",
  B: "Groupings",
  C: "Nested",
  D: "Rails",
}

export function ProtoSettingsPanel() {
  const [open, setOpen] = React.useState(false)
  const [navVersion, setNavVersionState] = React.useState<NavVersionKey>(DEFAULT_NAV_VERSION)
  const [persona, setPersonaState] = React.useState<PersonaKey>(DEFAULT_PERSONA)
  const [maturity, setMaturityStateLocal] = React.useState<Maturity>(DEFAULT_MATURITY)
  const [cardCustomization, setCardCustomizationState] = React.useState(true)
  React.useEffect(() => {
    const stored = sessionStorage.getItem("proto-nav-version")
    if (stored && stored in NAV_VERSIONS) setNavVersionState(stored as NavVersionKey)
    const storedPersona = sessionStorage.getItem("proto-persona")
    if (storedPersona && storedPersona in PERSONA_CONFIGS) setPersonaState(storedPersona as PersonaKey)
    const storedMaturity = sessionStorage.getItem("proto-maturity")
    if (storedMaturity === "new" || storedMaturity === "established") setMaturityStateLocal(storedMaturity)
    const storedCardCustomization = sessionStorage.getItem("proto-card-customization")
    setCardCustomizationState(storedCardCustomization == null ? true : storedCardCustomization === "true")
  }, [])

  const handleNavChange = (key: NavVersionKey) => {
    setNavVersionState(key)
    sessionStorage.setItem("proto-nav-version", key)
    window.dispatchEvent(new CustomEvent("proto-nav-version-change", { detail: key }))
  }

  const handlePersonaChange = (key: PersonaKey) => {
    setPersonaState(key)
    setPersona(key)
  }

  const handleMaturityChange = (value: Maturity) => {
    setMaturityStateLocal(value)
    setMaturity(value)
  }

  const handleCardCustomizationChange = (enabled: boolean) => {
    setCardCustomizationState(enabled)
    setCardCustomization(enabled)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-2 w-[280px] rounded-md border border-border bg-background shadow-[var(--shadow-db-lg)] overflow-hidden">
          <div className="flex flex-col gap-4 p-4">
            {/* Nav version */}
            <div className="flex flex-col gap-2">
              <Label>Nav style</Label>
              <Select value={navVersion} onValueChange={handleNavChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NAV_VERSION_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {NAV_DISPLAY_LABELS[key] ?? key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-border" />

            {/* Role */}
            <div className="flex flex-col gap-2">
              <Label>Role</Label>
              <Select value={persona} onValueChange={handlePersonaChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSONA_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {PERSONA_CONFIGS[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-border" />

            {/* Account maturity */}
            <div className="flex flex-col gap-2">
              <Label>Account maturity</Label>
              <div className="inline-flex rounded bg-secondary p-0.5">
                {([
                  { id: "new", label: "New" },
                  { id: "established", label: "Established" },
                ] as { id: Maturity; label: string }[]).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleMaturityChange(opt.id)}
                    className={cn(
                      "flex-1 rounded px-3 h-7 text-sm font-normal transition-colors",
                      maturity === opt.id
                        ? "bg-background text-foreground shadow-[var(--shadow-db-sm)]"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Homepage card customization */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="card-customization">Card customization</Label>
                <Switch
                  id="card-customization"
                  checked={cardCustomization}
                  onCheckedChange={handleCardCustomizationChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-md border border-border bg-background px-3 h-8 text-sm shadow-[var(--shadow-db-sm)] transition-colors hover:bg-muted",
          open && "bg-muted"
        )}
      >
        <Settings className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground">Prototype</span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
    </div>
  )
}
