// components/ui/Logo.tsx
"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  type?: "full" | "icon" | "text"
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  className?: string
  noRotation?: boolean
}

export function Logo({ type = "full", size = "md", className, noRotation = false }: LogoProps) {
  const getDimensions = () => {
    switch (size) {
      case "xs": return { width: 20, height: 20 }
      case "sm": return { width: 32, height: 32 }
      case "md": return { width: 48, height: 48 }
      case "lg": return { width: 64, height: 64 }
      case "xl": return { width: 96, height: 96 }
      case "2xl": return { width: 128, height: 128 }
      default: return { width: 48, height: 48 }
    }
  }

  const getLogoPath = () => {
    if (type === "text") return "/text_wo_bg.png"
    return "/Logo_wo_bg.png"
  }

  const { width, height } = getDimensions()
  
  return (
    <div className={cn("relative inline-block", className)}>
      <Image
        src={getLogoPath()}
        alt="Chameleon Security Platform"
        width={width}
        height={height}
        className={cn(
          "object-contain",
          type === "text" && "h-auto",
          noRotation && "transform-none"
        )}
        priority={size === "xl" || size === "2xl"}
      />
    </div>
  )
}