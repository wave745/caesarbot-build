"use client"

import { cn } from "@/lib/utils"

export interface BadgeProps {
  variant?: "READY" | "PENDING" | "BLOCKER" | "INFO" | "secondary" | "default"
  className?: string
  children?: React.ReactNode
}

export const Badge = ({ variant = "PENDING", className, children }: BadgeProps) => {
  const variantClasses = {
    READY: "cb-ok",
    PENDING: "cb-warn", 
    BLOCKER: "cb-err",
    INFO: "cb-info",
    secondary: "px-2 py-1 text-xs font-medium rounded-full border",
    default: "px-2 py-1 text-xs font-medium rounded-full bg-zinc-800 text-zinc-300"
  } as const

  return (
    <span className={cn("cb-badge", variantClasses[variant], className)}>
      {children || variant}
    </span>
  )
}