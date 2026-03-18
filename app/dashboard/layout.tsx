// app/dashboard/layout.tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { apiService } from "@/services/api/api.service"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const verifyOnboarding = async () => {
      try {
        const me = await apiService.getMe()
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(me))
        }

        if (!me?.onboarding_completed) {
          router.replace("/onboarding")
          return
        }

        setReady(true)
      } catch {
        router.replace("/login")
      }
    }

    verifyOnboarding()
  }, [router])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}