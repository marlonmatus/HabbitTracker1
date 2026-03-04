import { cn } from "../../lib/utils"

export function PageHeader({ title, subtitle, rightElement, className }) {
  return (
    <header className={cn("flex flex-row items-center justify-between mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <div className="text-muted-foreground mt-1 text-sm md:text-base flex items-center">{subtitle}</div>}
      </div>
      {rightElement && (
        <div className="flex items-center gap-3">
          {rightElement}
        </div>
      )}
    </header>
  )
}
