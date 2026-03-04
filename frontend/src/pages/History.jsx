import { useState } from "react"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity, AlertCircle, CalendarDays } from "lucide-react"
import { PageHeader } from "../components/ui/PageHeader"
import { StatCard } from "../components/ui/StatCard"
import { EmptyState } from "../components/ui/EmptyState"
import { Skeleton } from "../components/ui/LoadingSkeletons"
import { useHistory } from "../hooks/useHistory"

const WEEKS = ["week-1", "week-2", "week-3", "week-4"]
const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function History() {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  
  // Custom Hook: Data fetching, Loading y Error States encapsulados
  const { data, loading, error, refetch } = useHistory(currentWeekIndex)

  const handlePrevWeek = () => {
    if (currentWeekIndex < WEEKS.length - 1) {
      setCurrentWeekIndex(prev => prev + 1)
    }
  }

  const handleNextWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(prev => prev - 1)
    }
  }

  // --- Render Helpers ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl md:col-span-2" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      )
    }

    if (error) {
      return (
        <EmptyState 
          icon={AlertCircle}
          title="Error al cargar"
          description="Hubo un problema al obtener tu historial de esta semana. Por favor, intenta de nuevo."
          action={
            <button 
              onClick={() => refetch()}
              className="bg-secondary/10 text-secondary hover:bg-secondary/20 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Reintentar
            </button>
          }
        />
      )
    }

    if (!data || data.habits.length === 0) {
      return (
        <div className="space-y-6">
          {renderWeekSelector()}
          <EmptyState 
            icon={CalendarDays}
            title="Sin registros"
            description="No hay datos registrados para esta semana. Fue antes de que comenzaras tu viaje o tomaste un descanso."
          />
        </div>
      )
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderWeekSelector()}
        
        {/* Resumen Semanal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard 
            title="Completitud" 
            value={`${data.percentage}%`} 
            icon={Activity}
            color="primary"
          />
          <div className="md:col-span-2 bg-card border border-border/50 shadow-level-1 rounded-2xl p-5 md:p-6 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-success" /> Hábitos Top
                </h4>
                <ul className="space-y-2">
                  {data.topHabits.length > 0 ? data.topHabits.map((h, i) => (
                    <li key={i} className="text-sm font-medium">{h}</li>
                  )) : <li className="text-sm text-muted-foreground">Ninguno destacado</li>}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-warning" /> Áreas de mejora
                </h4>
                <ul className="space-y-2">
                  {data.bottomHabits.length > 0 ? data.bottomHabits.map((h, i) => (
                    <li key={i} className="text-sm font-medium">{h}</li>
                  )) : <li className="text-sm text-muted-foreground">¡Todo excelente!</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla / Grid Semanal */}
        <section className="bg-card border border-border/50 shadow-level-1 rounded-2xl overflow-hidden">
          {/* Cabecera (Desktop) */}
          <div className="hidden md:grid grid-cols-[2fr_repeat(7,1fr)] gap-4 p-4 border-b border-border/50 bg-muted/20">
            <div className="font-medium text-muted-foreground text-sm pl-2">Hábito</div>
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="text-center font-medium text-muted-foreground text-sm">{d}</div>
            ))}
          </div>
          
          {/* Filas */}
          <div className="divide-y divide-border/30">
            {data.habits.map((habit) => {
              const completedDays = habit.days.filter(Boolean).length;
              return (
                <div key={habit.id} className="p-4 md:p-0 md:grid md:grid-cols-[2fr_repeat(7,1fr)] md:gap-4 md:items-center hover:bg-muted/10 transition-colors">
                  
                  {/* Mobile Header / Desktop First Col */}
                  <div className="mb-3 md:mb-0 md:p-4 md:pl-6 flex justify-between items-center">
                    <span className="font-medium text-foreground">{habit.title}</span>
                    <span className="md:hidden text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-full">
                      {completedDays}/7
                    </span>
                  </div>
                  
                  {/* Días */}
                  <div className="flex justify-between md:contents">
                    {habit.days.map((isDone, dayIdx) => (
                      <div key={dayIdx} className="flex flex-col items-center justify-center md:p-4">
                        {/* Label día en móvil */}
                        <span className="md:hidden text-[10px] text-muted-foreground mb-1.5">{DAY_LABELS[dayIdx]}</span>
                        <div 
                          className={`group/day w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${
                            isDone 
                              ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                              : 'bg-muted/50 border border-border/80 hover:bg-muted'
                          }`}
                          title={`${DAY_LABELS[dayIdx]}: ${isDone ? 'Completado' : 'Pendiente'}`}
                        >
                          {isDone && <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-primary rounded-full transition-transform group-hover/day:scale-110" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    )
  }

  const renderWeekSelector = () => (
    <div className="flex items-center justify-between bg-card border border-border/50 p-2 rounded-2xl shadow-sm">
      <button 
        onClick={handlePrevWeek} 
        disabled={currentWeekIndex === WEEKS.length - 1}
        className="p-2 md:p-3 hover:bg-muted rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-muted-foreground"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="font-medium text-sm md:text-base">
        {data?.weekLabel || "Cargando..."}
      </div>
      <button 
        onClick={handleNextWeek}
        disabled={currentWeekIndex === 0}
        className="p-2 md:p-3 hover:bg-muted rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-muted-foreground"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )

  return (
    <div className="pb-8">
      <PageHeader 
        title="Historial" 
        subtitle="Tu constancia a lo largo del tiempo"
      />
      {renderContent()}
    </div>
  )
}
