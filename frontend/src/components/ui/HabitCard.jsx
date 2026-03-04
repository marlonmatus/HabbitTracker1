import { CheckCircle2, Circle, MoreVertical } from "lucide-react"
import { BadgeSoft } from "./BadgeSoft"
import { cn } from "../../lib/utils"

export function HabitCard({ habit, onToggle, onMore, className }) {
  const { title, streak, done } = habit

  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group",
        done 
          ? "bg-transparent border border-transparent shadow-none opacity-40 grayscale" 
          : "bg-card border border-border/60 hover:border-border hover:shadow-level-1",
        className
      )}
    >
      <button 
        onClick={() => onToggle && onToggle(habit)}
        className="flex-shrink-0 transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-full"
        aria-label={done ? "Marcar como pendiente" : "Marcar como completado"}
      >
        {done ? (
          <CheckCircle2 className="w-8 h-8 text-primary fill-primary/10 transition-colors duration-300" />
        ) : (
          <Circle className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors duration-300" strokeWidth={1.5} />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-medium truncate transition-all duration-300", 
          done ? "line-through text-muted-foreground" : "text-foreground"
        )}>
          {title}
        </h3>
      </div>
      
      {streak > 0 && (
        <BadgeSoft variant={done ? "muted" : "warning"} className="shrink-0 transition-opacity duration-300">
          <span>🔥</span>
          <span>{streak}</span>
        </BadgeSoft>
      )}

      <button 
        onClick={(e) => {
          e.stopPropagation()
          onMore && onMore(habit)
        }}
        className="p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-full opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Opciones"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  )
}
