import { cn } from "../../lib/utils"

export function StatCard({ title, value, icon: Icon, color = "primary", className }) {
  const colorStyles = {
    primary: "bg-primary/10 text-primary dark:bg-primary/20",
    secondary: "bg-secondary/10 text-secondary dark:bg-secondary/20",
    orange: "bg-orange-500/10 text-orange-500 dark:bg-orange-500/20",
    blue: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20",
  }

  return (
    <div className={cn("bg-card border border-border/50 shadow-level-1 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all hover:shadow-level-2 group", className)}>
      {Icon && (
        <div className={cn("p-3 rounded-full mb-3 transition-transform group-hover:scale-110 duration-300", colorStyles[color])}>
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-2xl md:text-3xl font-bold font-heading mb-1">{value}</h3>
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
    </div>
  )
}
