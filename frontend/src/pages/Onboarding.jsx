import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Droplet, Brain, BookOpen, Moon, Dumbbell, Plus, X, ArrowRight, Check } from "lucide-react"
import { cn } from "../lib/utils"
import { habitsApi } from "../services/api"

const USER_ID = import.meta.env.VITE_USER_ID || 'demo-user'

// --- Datos Mock ---
const SUGGESTED_HABITS = [
  { id: 'water', category: 'Cuerpo', icon: Droplet, label: 'Beber agua al despertar', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'move', category: 'Cuerpo', icon: Dumbbell, label: '15 min de movimiento', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'meditate', category: 'Mente', icon: Brain, label: 'Meditar en silencio', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'sleep', category: 'Mente', icon: Moon, label: 'Desconexión digital 10pm', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'read', category: 'Foco', icon: BookOpen, label: 'Leer 10 páginas', color: 'text-teal-500', bg: 'bg-teal-500/10' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Perfil, 2: Hábitos, 3: Confirmación
  
  // State
  const [name, setName] = useState("")
  const [selectedHabits, setSelectedHabits] = useState([])
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [customHabitName, setCustomHabitName] = useState("")

  const totalSteps = 3

  const handleNext = () => {
    if (step < totalSteps) setStep(s => s + 1)
  }

  const toggleHabit = (id) => {
    setSelectedHabits(prev => 
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    )
  }

  const handleAddCustomHabit = (e) => {
    e.preventDefault()
    if (!customHabitName.trim()) return
    
    const newId = `custom-${Date.now()}`
    SUGGESTED_HABITS.push({
      id: newId,
      category: 'Personalizado',
      icon: Plus,
      label: customHabitName.trim(),
      color: 'text-primary',
      bg: 'bg-primary/10'
    })
    setSelectedHabits(prev => [...prev, newId])
    setCustomHabitName("")
    setIsCustomModalOpen(false)
  }

  const finishOnboarding = async () => {
    if (name.trim()) {
      localStorage.setItem('habittrack-userName', name.trim())
    }
    
    // Enviar hábitos al backend
    try {
      const habitsToCreate = selectedHabits.map(id => {
        const habit = SUGGESTED_HABITS.find(h => h.id === id)
        return {
          user_id: USER_ID,
          name: habit.label,
          description: habit.category
        }
      })
      
      await Promise.all(habitsToCreate.map(habitData => habitsApi.create(habitData)))
    } catch (error) {
      console.error("Error al crear hábitos:", error)
    }

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Fondo sutil (Mesh Gradient style) */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5 blur-[100px] -z-10 pointer-events-none"></div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-12 pb-8 animate-in fade-in duration-700">
        
        {/* Stepper Header (Oculto en paso final) */}
        {step < 3 && (
          <div className="flex items-center justify-between mb-12">
            <button 
              onClick={() => step > 1 && setStep(s => s - 1)}
              className={cn("text-muted-foreground p-2 -ml-2 rounded-full hover:bg-muted transition-colors", step === 1 && "invisible")}
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500", 
                    i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-border"
                  )}
                />
              ))}
            </div>
            <div className="w-9" /> {/* Spacer for balance */}
          </div>
        )}

        {/* --- PASO 1: PERFIL --- */}
        {step === 1 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-semibold mb-3">Conozcámonos</h1>
              <p className="text-muted-foreground text-lg mb-10">¿Cómo te gustaría que te llamemos durante este viaje?</p>
              
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre o apodo"
                  className="w-full bg-card border-2 border-border/50 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleNext()}
                />
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold text-lg shadow-level-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 group"
              >
                Continuar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* --- PASO 2: SELECCIÓN DE HÁBITOS --- */}
        {step === 2 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 fade-in duration-500">
            <h1 className="text-2xl font-semibold mb-2">Elige tus intenciones</h1>
            <p className="text-muted-foreground mb-8 text-sm">
              Selecciona o crea los hábitos que formarán tu rutina. Menos es más para empezar.
            </p>
            
            <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-8 space-y-6">
              {['Cuerpo', 'Mente', 'Foco', 'Personalizado'].map(category => {
                const habitsInCategory = SUGGESTED_HABITS.filter(h => h.category === category)
                if (habitsInCategory.length === 0) return null

                return (
                  <div key={category} className="space-y-3">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-2">{category}</h3>
                    <div className="space-y-3">
                      {habitsInCategory.map(habit => {
                        const isSelected = selectedHabits.includes(habit.id)
                        return (
                          <label 
                            key={habit.id}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm select-none",
                              isSelected 
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                : "border-border/60 bg-card hover:border-border hover:shadow-level-1"
                            )}
                          >
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              checked={isSelected}
                              onChange={() => toggleHabit(habit.id)}
                            />
                            <div className={cn("p-2.5 rounded-xl transition-colors", habit.bg, habit.color)}>
                              <habit.icon className="w-5 h-5" strokeWidth={2} />
                            </div>
                            <span className={cn("flex-1 font-medium transition-colors", isSelected ? "text-foreground" : "text-foreground/80")}>
                              {habit.label}
                            </span>
                            <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                              isSelected ? "border-primary bg-primary" : "border-muted-foreground/30 group-hover:border-primary/50"
                            )}>
                              {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              <button 
                onClick={() => setIsCustomModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground bg-card hover:bg-muted/50 rounded-2xl transition-colors font-medium border border-border border-dashed shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Crear el mío
              </button>
            </div>
            
            <div className="pt-4 pb-2 bg-background border-t border-border/50 mt-auto">
              <button 
                onClick={handleNext}
                disabled={selectedHabits.length === 0}
                className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold text-lg shadow-level-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {selectedHabits.length === 0 ? "Selecciona al menos 1" : `Continuar con ${selectedHabits.length}`}
              </button>
            </div>
          </div>
        )}

        {/* --- PASO 3: CONFIRMACIÓN --- */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 fade-in duration-700 delay-150">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8 animate-bounce" style={{ animationDuration: '3s' }}>
              <SparklesIcon className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-semibold mb-4">Todo listo, {name}</h1>
            <p className="text-muted-foreground text-lg max-w-xs mx-auto mb-12">
              Tus intenciones han sido registradas. El viaje hacia tu mejor versión comienza hoy.
            </p>
            
            <button 
              onClick={finishOnboarding}
              className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold text-lg shadow-level-2 transition-transform active:scale-[0.98]"
            >
              Ir a mi Dashboard
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL / DRAWER: CREAR HÁBITO --- */}
      {isCustomModalOpen && (
        <div className="absolute inset-0 z-50 flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsCustomModalOpen(false)}
          ></div>
          
          {/* Drawer / Modal Content */}
          <div className="bg-card w-full md:w-96 rounded-t-3xl md:rounded-3xl p-6 relative z-10 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 shadow-level-3">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 md:hidden"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Nuevo hábito</h3>
              <button 
                onClick={() => setIsCustomModalOpen(false)}
                className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCustomHabit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nombre del hábito</label>
                <input 
                  type="text" 
                  value={customHabitName}
                  onChange={(e) => setCustomHabitName(e.target.value)}
                  placeholder="Ej. Escribir en mi diario"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                disabled={!customHabitName.trim()}
                className="w-full bg-foreground text-background py-3.5 rounded-xl font-medium transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                Añadir y seleccionar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  )
}
