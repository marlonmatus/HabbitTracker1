import { cn } from "../../lib/utils"

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-10 border border-dashed border-border/60 rounded-3xl bg-card/30 animate-in fade-in zoom-in-95 duration-500", 
      className
    )}>
      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground mb-6 transition-transform hover:scale-105 duration-500">
        {Icon && <Icon className="w-10 h-10 opacity-60" strokeWidth={1.5} />}
      </div>
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}
