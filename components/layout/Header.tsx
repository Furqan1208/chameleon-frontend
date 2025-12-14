"use client"

import { Bell, Settings } from "lucide-react"

export function Header() {
  return (
    <header className="h-16 glass border-b border-border flex items-center justify-between px-6">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
