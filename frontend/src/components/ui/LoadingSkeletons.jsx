import { cn } from "../../lib/utils"

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 dark:before:via-white/5 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <Skeleton className="w-40 h-40 rounded-full shrink-0" />
        <div className="flex-1 space-y-5 w-full">
          <Skeleton className="h-6 w-40 mx-auto md:mx-0 rounded-md" />
          <Skeleton className="h-4 w-full max-w-[280px] mx-auto md:mx-0 rounded-md" />
          <div className="flex gap-3 justify-center md:justify-start pt-4 h-16">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="w-3 h-full rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <Skeleton className="h-28 w-full rounded-2xl" />

      <div className="space-y-4">
        <Skeleton className="h-6 w-20 mb-6 rounded-md" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 bg-card/50 border border-border/40 p-4 rounded-xl">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <Skeleton className="h-5 w-48 flex-1 rounded-md" />
            <Skeleton className="h-6 w-14 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function HistorySkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-4 w-28 rounded-md" />
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={`head-${i}`} className="h-4 w-4 mx-auto rounded-sm mb-4" />
          ))}
          
          {[...Array(31)].map((_, i) => (
            <Skeleton key={`day-${i}`} className="aspect-square rounded-md md:rounded-lg" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col items-center justify-center">
            <Skeleton className="w-12 h-12 rounded-full mb-4" />
            <Skeleton className="h-8 w-16 mb-3 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
