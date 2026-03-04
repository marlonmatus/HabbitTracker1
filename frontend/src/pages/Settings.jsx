import { useState } from "react"
import { Moon, Sun, Monitor, Info, Trash2, Edit2, Check, X, ShieldAlert } from "lucide-react"
import { useTheme } from "../components/ThemeProvider"
import { PageHeader } from "../components/ui/PageHeader"
import { cn } from "../lib/utils"

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState("Alex Developer")
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState("")

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleEditClick = () => {
    setTempName(name)
    setIsEditingName(true)
  }

  const handleSaveName = () => {
    if (tempName.trim()) {
      setName(tempName.trim())
    }
    setIsEditingName(false)
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <PageHeader 
        title="Ajustes" 
        subtitle="Personaliza tu experiencia de bienestar"
      />

      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* --- SECCIÓN: PERFIL --- */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-4">Perfil Personal</h2>
          
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-heading font-bold shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 text-center md:text-left w-full">
              {isEditingName ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 bg-background border border-primary ring-2 ring-primary/20 rounded-xl px-4 py-2.5 focus:outline-none transition-all text-lg font-medium"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={handleSaveName}
                      className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                      aria-label="Guardar nombre"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="p-2.5 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors"
                      aria-label="Cancelar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-1">{name}</h3>
                    <p className="text-muted-foreground text-sm">Miembro desde Octubre 2023</p>
                  </div>
                  <button 
                    onClick={handleEditClick}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-full transition-colors font-medium text-sm w-full md:w-auto"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- SECCIÓN: PREFERENCIAS --- */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-4">Apariencia</h2>
          
          <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm divide-y divide-border/30">
            {/* Tema */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-muted p-2.5 rounded-xl text-foreground shrink-0">
                  <Monitor className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="font-medium block">Tema visual</span>
                  <span className="text-sm text-muted-foreground block mt-0.5">Ajusta el modo de color a tu entorno.</span>
                </div>
              </div>
              
              <div className="flex bg-muted/50 rounded-2xl p-1.5 self-start sm:self-auto border border-border/50">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium",
                    theme === 'light' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className="w-4 h-4" /> <span className="hidden sm:inline">Claro</span>
                </button>
                <button 
                  onClick={() => setTheme('system')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium",
                    theme === 'system' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Monitor className="w-4 h-4" /> <span className="hidden sm:inline">Auto</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium",
                    theme === 'dark' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className="w-4 h-4" /> <span className="hidden sm:inline">Oscuro</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN: ACERCA DE --- */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-4">Sobre la App</h2>
          
          <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm flex items-start gap-4">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary shrink-0 mt-1">
              <Info className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <span className="font-medium block mb-1">HabbitTrack</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Versión 1.0.0 — Un santuario digital para el crecimiento personal. 
                Diseñado para traer claridad a tus días y celebrar tus pequeños logros sin abrumarte.
              </p>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN: ZONA DE PELIGRO --- */}
        <section className="pt-4">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between p-5 rounded-3xl border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-destructive/10 p-2.5 rounded-xl group-hover:bg-destructive/20 transition-colors">
                <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <span className="font-medium block">Reiniciar mi viaje</span>
                <span className="text-xs opacity-80 mt-0.5 block">Borrará todo tu historial y hábitos actuales.</span>
              </div>
            </div>
          </button>
        </section>

      </div>

      {/* --- MODAL CONFIRMACIÓN --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          
          <div className="bg-card border border-border w-full max-w-md rounded-[28px] p-6 md:p-8 relative z-10 animate-in zoom-in-95 duration-300 shadow-level-3">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 mx-auto">
              <ShieldAlert className="w-8 h-8" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-2xl font-semibold text-center mb-3">¿Empezar de cero?</h3>
            <p className="text-muted-foreground text-center mb-8 leading-relaxed">
              Esta acción eliminará permanentemente todos tus hábitos, rachas y el historial de progreso. Es un lienzo completamente en blanco, y esta acción no se puede deshacer.
            </p>
            
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-destructive text-destructive-foreground py-3.5 rounded-xl font-medium hover:bg-destructive/90 transition-all active:scale-[0.98]"
              >
                Sí, reiniciar datos
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-muted text-foreground py-3.5 rounded-xl font-medium hover:bg-muted/80 transition-all active:scale-[0.98]"
              >
                Mantener mi progreso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
