import { cn } from "../../lib/utils"

export function BadgeSoft({ children, variant = 'primary', className }) {
  const variants = {
    primary: "bg-primary/10 text-primary dark:bg-primary/20",
    secondary: "bg-secondary/10 text-secondary dark:bg-secondary/20",
    success: "bg-success/10 text-success dark:bg-success/20",
    warning: "bg-orange-500/10 text-orange-500 dark:bg-orange-500/20",
    destructive: "bg-destructive/10 text-destructive dark:bg-destructive/20",
    muted: "bg-muted text-muted-foreground",
  }

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-colors", 
      variants[variant], 
      className
    )}>
      {children}
    </span>
  )
}
