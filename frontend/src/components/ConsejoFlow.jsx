import { useState } from 'react'
import { X, Send, Sparkles } from 'lucide-react'
import { aiApi } from '../services/api'
import { ConsejoFormatted } from './ui/ConsejoFormatted'
import { cn } from '../lib/utils'

/**
 * Flujo de consejo personalizado: preguntas una por una, luego muestra el consejo
 * formateado (secciones, negritas, emojis).
 */
export default function ConsejoFlow({ userId, onClose }) {
  const [sessionId, setSessionId] = useState(null)
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [consejo, setConsejo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const start = async () => {
    setError(null)
    setConsejo(null)
    setQuestion(null)
    setAnswer('')
    setLoading(true)
    try {
      const data = await aiApi.consejoStart(userId)
      setSessionId(data.session_id)
      setQuestion(data.question)
    } catch (e) {
      setError(e?.message || 'No se pudo iniciar el consejo.')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    const text = answer.trim()
    if (!text || !sessionId || loading) return
    setError(null)
    setLoading(true)
    try {
      const data = await aiApi.consejoAnswer(sessionId, text)
      setAnswer('')
      if (data.done && data.consejo) {
        setConsejo(data.consejo)
        setQuestion(null)
        setSessionId(null)
      } else if (data.question) {
        setQuestion(data.question)
      }
    } catch (e) {
      setError(e?.message || 'No se pudo enviar la respuesta.')
    } finally {
      setLoading(false)
    }
  }

  const step = consejo ? 'consejo' : question ? 'question' : 'start'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-level-2 flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            Consejo personalizado
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 min-h-[200px]">
          {step === 'start' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Te haré unas preguntas cortas, una por una. Con tus respuestas prepararé un consejo solo para ti, con secciones claras e ideas destacadas.
              </p>
              <button
                type="button"
                onClick={start}
                disabled={loading}
                className={cn(
                  "w-full py-3 rounded-xl font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                )}
              >
                {loading ? 'Preparando...' : 'Comenzar'}
              </button>
            </div>
          )}

          {step === 'question' && (
            <div className="space-y-4">
              <p className="text-base font-medium text-foreground">{question}</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escribe aquí..."
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={submitAnswer}
                disabled={loading || !answer.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Enviando...' : 'Siguiente'}
              </button>
            </div>
          )}

          {step === 'consejo' && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-secondary mb-3">Tu consejo</p>
              <ConsejoFormatted text={consejo} className="text-foreground/90" />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive mt-3">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
