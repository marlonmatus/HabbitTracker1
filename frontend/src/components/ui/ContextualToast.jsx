import { X } from "lucide-react"

const EVENT_TITLES = {
  racha_rota: "Racha rota",
  nueva_racha: "Nueva racha",
  racha_7: "7 días seguidos",
  mejora_significativa: "Mejora significativa",
  caida_significativa: "Un momento de pausa",
}

export function ContextualToast({ message, eventType, onClose }) {
  if (!message) return null
  const title = EVENT_TITLES[eventType] || "Mensaje"

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-labelledby="contextual-toast-title"
        className="relative z-10 w-full max-w-md bg-card border border-border/60 rounded-2xl p-5 shadow-level-2 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 id="contextual-toast-title" className="text-sm font-semibold text-foreground mb-1.5">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
