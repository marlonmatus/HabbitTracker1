import { NavLink } from "react-router-dom"
import { Home, CalendarDays, Settings } from "lucide-react"
import { cn } from "../lib/utils"

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/history", label: "Historial", icon: CalendarDays },
  { path: "/settings", label: "Ajustes", icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass pb-safe">
      <div className="flex items-center justify-around h-20 px-6">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[64px] rounded-2xl transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "p-1.5 rounded-xl transition-all", 
                    isActive ? "bg-primary/10" : "bg-transparent"
                  )}>
                    <Icon className={cn("w-6 h-6", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 1.5} />
                  </div>
                  <span className="text-[10px] font-medium font-sans">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
