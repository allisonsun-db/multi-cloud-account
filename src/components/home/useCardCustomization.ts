"use client"

import * as React from "react"

const STORAGE_KEY = "proto-card-customization"
const EVENT_NAME = "proto-card-customization-change"
const DEFAULT_CARD_CUSTOMIZATION = true

function isEnabled(value: string | null) {
  return value === "true"
}

export function setCardCustomization(enabled: boolean) {
  sessionStorage.setItem(STORAGE_KEY, String(enabled))
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: enabled }))
}

export function useCardCustomization() {
  const [enabled, setEnabled] = React.useState(DEFAULT_CARD_CUSTOMIZATION)

  React.useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    setEnabled(stored == null ? DEFAULT_CARD_CUSTOMIZATION : isEnabled(stored))

    const handler = (event: Event) => {
      setEnabled((event as CustomEvent).detail === true)
    }

    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [])

  return enabled
}
