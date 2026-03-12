"use client"

import type { ReactNode } from "react"
import { MITREProvider } from "@/components/framework/mitre-attack/context"

export default function MITREAttackLayout({ children }: { children: ReactNode }) {
  return <MITREProvider>{children}</MITREProvider>
}
