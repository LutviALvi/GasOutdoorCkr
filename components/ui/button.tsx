import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes } from "react"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive" | "ghost"
  size?: "icon" | "sm" | "md" | "lg"
  asChild?: boolean
}

const buttonSizes = {
  icon: "h-8 w-8 p-0",
  sm: "h-9 px-3 rounded-lg",
  md: "h-10 px-4 rounded-lg",
  lg: "h-11 px-8 rounded-lg",
  default: "h-10 px-4 rounded-lg", // Alias for md
}

const buttonVariants = (options?: { variant?: string; size?: string }) => {
  const variant = options?.variant || "default"
  const size = options?.size || "md"
  
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  }

  const sizes: Record<string, string> = {
    ...buttonSizes,
    default: buttonSizes.md,
  }

  return cn(
    variants[variant] || variants.default,
    sizes[size as keyof typeof sizes] || sizes.default
  )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants({ variant, size }),
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants, buttonSizes }
