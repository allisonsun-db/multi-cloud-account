"use client"

import * as React from "react"

export type Maturity = "new" | "established"

export const DEFAULT_MATURITY: Maturity = "established"

const STORAGE_KEY = "proto-maturity"
const EVENT_NAME = "proto-maturity-change"

function isMaturity(v: string | null): v is Maturity {
  return v === "new" || v === "established"
}

/** Broadcast an account-maturity change from the Prototype settings panel. */
export function setMaturity(value: Maturity) {
  sessionStorage.setItem(STORAGE_KEY, value)
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }))
}

/**
 * Reads the mocked account maturity ("new" vs "established") set in the
 * Prototype settings panel. New accounts show a setup checklist; established
 * accounts show quick actions instead. Mirrors the persona hook pattern.
 */
export function useMaturity(): Maturity {
  const [maturity, setMaturityState] = React.useState<Maturity>(DEFAULT_MATURITY)

  React.useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (isMaturity(stored)) setMaturityState(stored)

    const handler = (e: Event) => {
      const value = (e as CustomEvent).detail
      if (isMaturity(value)) setMaturityState(value)
    }
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [])

  return maturity
}
