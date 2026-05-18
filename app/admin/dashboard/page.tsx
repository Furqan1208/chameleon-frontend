"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect legacy /admin/dashboard to new /dashboard/admin
    router.replace('/dashboard/admin')
  }, [router])

  return null
}
