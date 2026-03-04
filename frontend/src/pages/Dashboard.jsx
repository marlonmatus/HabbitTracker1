import { useState, useEffect, useCallback } from "react"
import { Moon, Sun, Flame, Award, CalendarDays, RefreshCw, ChevronLeft, ChevronRight, MessageCircle, Lightbulb } from "lucide-react"
import { useTheme } from "../components/ThemeProvider"
import { PageHeader } from "../components/ui/PageHeader"
import { HabitCard } from "../components/ui/HabitCard"
import { MotivationCard } from "../components/ui/MotivationCard"
import { StatCard } from "../components/ui/StatCard"
import { EmptyState } from "../components/ui/EmptyState"
import { DashboardSkeleton } from "../components/ui/LoadingSkeletons"
import { ContextualToast } from "../components/ui/ContextualToast"
import { useHabits } from "../hooks/useHabits"
import { useProgress } from "../hooks/useProgress"
import { aiApi, habitsApi } from "../services/api"

const USER_ID = import.meta.env.VITE_USER_ID || 'demo-user'

// Mock de la semana (L, M, X, J, V, S, D) en porcentajes
const MOCK_WEEK = [40, 70, 100, 30, 80, 60]

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const userName = localStorage.getItem('habittrack-userName') || 'Alex'

  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const formattedDate = selectedDate.toLocaleDateString('sv')
  const [contextualToast, setContextualToast] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const [coachOpen, setCoachOpen] = useState(false)
  const [coachMessages, setCoachMessages] = useState([])
  const [coachInput, setCoachInput] = useState("")
  const [coachLoading, setCoachLoading] = useState(false)

  const handleContextualEvent = useCallback((message, eventType) => {
    setContextualToast({ message, eventType })
  }, [])

  const { habits, loading, toggleHabit, refetch: refetchHabits } = useHabits(formattedDate, { onContextualEvent: handleContextualEvent })
  const { tip, insight, loadingTip, loadingInsight, refreshingTip, refreshError, refreshTip, errorInsight } = useProgress(USER_ID)

  useEffect(() => {
    let cancelled = false
    aiApi.contextualEvent({ user_id: USER_ID, trigger: "dashboard" }).then((data) => {
      if (!cancelled && data?.message) setContextualToast({ message: data.message, eventType: data.event_type })
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleSuggestHabit = async () => {
    setLoadingSuggest(true)
    setSuggestion(null)
    try {
      const data = await aiApi.suggestHabit(USER_ID)
      setSuggestion(data)
    } catch {
      setSuggestion(null)
    } finally {
      setLoadingSuggest(false)
    }
  }

  const handleAddSuggestedHabit = async () => {
    if (!suggestion?.name) return
    try {
      await habitsApi.create({
        user_id: USER_ID,
        name: suggestion.name,
        description: [suggestion.reason, suggestion.first_step].filter(Boolean).join(" — ") || undefined,
      })
      setSuggestion(null)
      refetchHabits()
    } catch (_) {}
  }

  const handleSendCoach = async () => {
    const text = coachInput.trim()
    if (!text || coachLoading) return
    setCoachInput("")
    setCoachMessages((prev) => [...prev, { role: "user", content: text }])
    setCoachLoading(true)
    try {
      const history = coachMessages.map((m) => ({ role: m.role, content: m.content }))
      const data = await aiApi.coach({ user_id: USER_ID, message: text, history })
      setCoachMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch {
      setCoachMessages((prev) => [...prev, { role: "assistant", content: "No pude responder ahora. Intenta en un momento." }])
    } finally {
      setCoachLoading(false)
    }
  }

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handlePrevDay = () => {
    setSelectedDate(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 1)
      return d
    })
  }

  const handleNextDay = () => {
    setSelectedDate(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 1)
      return d
    })
  }

  const isTodayDate = new Date().toLocaleDateString('sv') === formattedDate
  const displayDate = isTodayDate ? "Hoy" : selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) {
    return <DashboardSkeleton />
  }

  const completedCount = habits.filter(h => h.done).length
  const totalCount = habits.length
  const todayPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  const weeklyData = [...MOCK_WEEK, todayPercentage]

  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (circumference * todayPercentage) / 100

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-8">

      <PageHeader
        title={`Buenos días, ${userName}`}
        subtitle={
          <span className="flex items-center gap-2 mt-1">
            <button onClick={handlePrevDay} className="p-1 hover:bg-muted rounded-full text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
            <span className="capitalize">{displayDate}</span>
            <button onClick={handleNextDay} disabled={isTodayDate} className="p-1 hover:bg-muted rounded-full text-muted-foreground disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </span>
        }
        rightElement={
          <button
            onClick={handleToggleTheme}
            className="p-3 bg-card border border-border/60 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all active:scale-95 shadow-sm"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

        {/* --- Columna Principal (Izquierda en Desktop) --- */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">

          {/* Card Hero: Progreso Semanal */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both bg-card border border-border/60 shadow-level-1 hover:shadow-level-2 transition-shadow rounded-[28px] p-6 md:p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

              {/* Donut Chart */}
              <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary/10" />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl md:text-5xl font-bold font-heading">{completedCount}/{totalCount}</span>
                </div>
              </div>

              {/* Textos y Mini Gráfico */}
              <div className="flex-1 text-center md:text-left w-full">
                <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                  {todayPercentage === 100 ? "¡Día Perfecto!" : "¡Vas excelente!"}
                </h2>
                <p className="text-muted-foreground mb-8 text-base">
                  {todayPercentage === 100
                    ? "Has completado todos tus hábitos de hoy. Tómate un respiro, te lo has ganado."
                    : "Sigue así, estás construyendo tu mejor versión paso a paso."}
                </p>

                <div className="flex items-end justify-center md:justify-start gap-3 h-20">
                  {weeklyData.map((h, i) => {
                    const selectedDayIndex = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;
                    const isSelectedDay = i === selectedDayIndex;
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                        <div className={`w-3.5 md:w-4 rounded-full overflow-hidden h-14 flex items-end ${isSelectedDay ? 'bg-primary/20' : 'bg-muted'}`}>
                          <div className={`w-full rounded-full transition-all duration-1000 delay-300 ease-out ${isSelectedDay ? 'bg-primary' : 'bg-muted-foreground/40 group-hover:bg-muted-foreground/60'}`} style={{ height: `${h}%` }} />
                        </div>
                        <span className={`text-[11px] font-medium ${isSelectedDay ? 'text-primary' : 'text-muted-foreground'}`}>
                          {['L','M','X','J','V','S','D'][i]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Lista de Hábitos */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Tareas de hoy</h2>
              <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {completedCount} de {totalCount}
              </span>
            </div>

            {habits.length > 0 ? (
              <div className="space-y-3">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={toggleHabit}
                    onMore={(h) => console.log('Opciones para', h.title)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="Tu lienzo está en blanco"
                description="¿Qué pequeño paso daremos hoy? Añade un hábito para comenzar a registrar tu progreso."
                action={
                  <button className="bg-foreground text-background hover:bg-foreground/90 px-6 py-3 rounded-xl font-medium transition-colors">
                    Crear mi primer hábito
                  </button>
                }
              />
            )}
          </section>

        </div>

        {/* --- Columna Secundaria (Derecha en Desktop) --- */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">

          {/* Gemini Insight */}
          <MotivationCard
            title="Consejo de la semana"
            onRefresh={refreshTip}
            refreshing={refreshingTip}
            refreshError={refreshError}
          >
            {loadingTip ? (
              <span className="opacity-50 animate-pulse">Analizando tus patrones...</span>
            ) : (
              tip || "Cada pequeño esfuerzo suma. Sigue adelante."
            )}
          </MotivationCard>

          <MotivationCard title="Insight de tu progreso" className="border-primary/20 bg-primary/5">
            {loadingInsight ? (
              <span className="opacity-50 animate-pulse">Generando insight...</span>
            ) : errorInsight ? (
              <span className="text-muted-foreground text-sm">No se pudo cargar el insight.</span>
            ) : (
              insight || "Completa hábitos esta semana para ver un insight personalizado."
            )}
          </MotivationCard>

          <button
            type="button"
            onClick={handleSuggestHabit}
            disabled={loadingSuggest}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/50 text-sm font-medium text-foreground transition-colors disabled:opacity-50"
          >
            <Lightbulb className="w-4 h-4" />
            {loadingSuggest ? "Generando..." : "Sugerir hábito para mí"}
          </button>

          {suggestion && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-primary">Hábito sugerido</h3>
              <p className="font-medium text-foreground">{suggestion.name}</p>
              <p className="text-xs text-muted-foreground">Frecuencia: {suggestion.frequency}</p>
              {suggestion.reason && <p className="text-sm text-foreground/80">{suggestion.reason}</p>}
              {suggestion.first_step && <p className="text-xs text-muted-foreground">Primer paso: {suggestion.first_step}</p>}
              <button
                type="button"
                onClick={handleAddSuggestedHabit}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Agregar
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCoachOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/50 text-sm font-medium text-foreground transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Hablar con mi coach
          </button>

          {/* Panel de Estadísticas (Grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <StatCard icon={Flame} color="orange" title="Racha actual" value="14 días" />
            <StatCard icon={Award} color="blue" title="Último logro" value="Madrugador" />
          </div>

        </div>

      </div>

      {contextualToast && (
        <ContextualToast
          message={contextualToast.message}
          eventType={contextualToast.eventType}
          onClose={() => setContextualToast(null)}
        />
      )}

      {coachOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setCoachOpen(false)} aria-hidden />
          <div className="relative z-10 w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-level-2 flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Coach zen</h3>
              <button type="button" onClick={() => setCoachOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted" aria-label="Cerrar">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px]">
              {coachMessages.length === 0 && (
                <p className="text-sm text-muted-foreground">Escribe cuando quieras. Respuestas breves y calmadas.</p>
              )}
              {coachMessages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <span className={m.role === "user" ? "inline-block px-3 py-2 rounded-2xl bg-primary/20 text-foreground text-sm" : "inline-block px-3 py-2 rounded-2xl bg-muted text-foreground text-sm"}>
                    {m.content}
                  </span>
                </div>
              ))}
              {coachLoading && <p className="text-sm text-muted-foreground animate-pulse">Pensando...</p>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendCoach(); }} className="p-4 border-t border-border/50 flex gap-2">
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="Escribe aquí..."
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={coachLoading}
              />
              <button type="submit" disabled={coachLoading || !coachInput.trim()} className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
