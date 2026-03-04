import { Sparkles, RefreshCw } from "lucide-react"
import { cn } from "../../lib/utils"

export function MotivationCard({ title = "Gemini Insight", children, className, onRefresh, refreshing, refreshError }) {
  return (
    <section className={cn(
      "bg-secondary/5 border border-secondary/20 rounded-2xl p-5 flex gap-4 items-start transition-all hover:border-secondary/40",
      className
    )}>
      <div className="bg-secondary/10 p-2 rounded-xl text-secondary mt-1 shrink-0">
        <Sparkles className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium text-secondary">{title}</h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Pedir nuevo consejo a Gemini"
              className="p-1 rounded-lg text-secondary/50 hover:text-secondary hover:bg-secondary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Nuevo consejo"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} strokeWidth={2} />
            </button>
          )}
        </div>
        <div className="text-foreground/80 leading-relaxed text-sm md:text-base">
          {children}
        </div>
        {refreshError && (
          <p className="text-xs text-destructive mt-1.5">{refreshError}</p>
        )}
      </div>
    </section>
  )
}
