import React from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = {
  default: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  ghost: "hover:bg-gray-100 text-gray-900",
  link: "text-primary underline-offset-4 hover:underline"
}

const sizeVariants = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-lg"
}

export function Button({ 
  children, 
  variant = "default", 
  size = "md", 
  className, 
  disabled,
  ...props 
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}