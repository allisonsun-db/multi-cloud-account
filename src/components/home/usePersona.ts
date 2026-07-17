"use client"

import * as React from "react"
import {
  DEFAULT_PERSONA,
  PERSONA_CONFIGS,
  type PersonaKey,
} from "./personaConfigs"

const STORAGE_KEY = "proto-persona"
const EVENT_NAME = "proto-persona-change"

function isPersonaKey(v: string | null): v is PersonaKey {
  return v != null && v in PERSONA_CONFIGS
}

/** Broadcast a persona change from the Prototype settings panel. */
export function setPersona(key: PersonaKey) {
  sessionStorage.setItem(STORAGE_KEY, key)
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: key }))
}

/**
 * Reads the mocked persona set in the Prototype settings panel and re-renders
 * when it changes. Mirrors the nav-version sessionStorage + CustomEvent pattern.
 */
export function usePersona(): PersonaKey {
  const [persona, setPersonaState] = React.useState<PersonaKey>(DEFAULT_PERSONA)

  React.useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (isPersonaKey(stored)) setPersonaState(stored)

    const handler = (e: Event) => {
      const key = (e as CustomEvent).detail
      if (isPersonaKey(key)) setPersonaState(key)
    }
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [])

  return persona
}
