"use client"

import { cn } from "@/lib/utils"

export interface BadgeProps {
  variant?: "READY" | "PENDING" | "BLOCKER" | "INFO"
  className?: string
  children?: React.ReactNode
}

export const Badge = ({ variant = "PENDING", className, children }: BadgeProps) => {
  const variantClasses = {
    READY: "cb-ok",
    PENDING: "cb-warn", 
    BLOCKER: "cb-err",
    INFO: "cb-info"
  } as const

  return (
    <span className={cn("cb-badge", variantClasses[variant], className)}>
      {children || variant}
    </span>
  )
}