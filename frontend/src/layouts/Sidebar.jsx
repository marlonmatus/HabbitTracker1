import { NavLink, useNavigate } from "react-router-dom"
import { Home, CalendarDays, Settings, LogOut, Hexagon } from "lucide-react"
import { cn } from "../lib/utils"

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/history", label: "Historial", icon: CalendarDays },
  { path: "/settings", label: "Ajustes", icon: Settings },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('habittrack-userName')
    navigate('/onboarding')
  }

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card text-card-foreground fixed h-full z-10 left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Hexagon className="w-6 h-6" />
        </div>
        <h1 className="font-heading font-semibold text-xl">HabbitTrack</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors font-medium">
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
