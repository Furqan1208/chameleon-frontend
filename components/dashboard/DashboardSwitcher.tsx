"use client"

import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const OPTIONS = [
  { label: "Operational Dashboard", value: "/dashboard" },
  { label: "MITRE ATT&CK Dashboard", value: "/dashboard/mitre" },
]

interface DashboardSwitcherProps {
  currentPath: string
  className?: string
}

export function DashboardSwitcher({ currentPath, className = "" }: DashboardSwitcherProps) {
  const router = useRouter()

  const selectedValue = OPTIONS.some((opt) => opt.value === currentPath)
    ? currentPath
    : "/dashboard"

  return (
    <div className={className}>
      <Select value={selectedValue} onValueChange={(value) => router.push(value)}>
        <SelectTrigger className="h-10 min-w-[210px] px-3 rounded-xl border-[#22262d] bg-[#101214] text-slate-100 hover:border-[#2a2f38] focus-visible:ring-primary/20 focus-visible:border-primary/40">
          <SelectValue placeholder="Switch dashboard" />
        </SelectTrigger>
        <SelectContent className="border-[#22262d] bg-[#101214] text-slate-100">
          {OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
