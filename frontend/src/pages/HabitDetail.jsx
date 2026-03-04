/**
 * HabitDetail
 * -----------
 * Página de historial de un hábito individual.
 * Se accede desde HabitCard al hacer clic en la tarjeta.
 *
 * Recibe el nombre del hábito via location.state.name (pasado desde HabitCard
 * al navegar con navigate(path, { state: { name } })). Si el usuario accede
 * directamente a la URL, muestra "Hábito" como fallback.
 *
 * El botón "Marcar como completado hoy" sigue el mismo patrón de 4 estados
 * que HabitCard para dar feedback claro al usuario:
 *   idle     → acción disponible
 *   loading  → petición en curso
 *   success  → marcado con éxito (permanente en sesión)
 *   conflict → ya estaba marcado hoy, el servidor devolvió 409 (permanente)
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { habitLogsApi } from '../services/api'
import ProgressBar from '../components/ProgressBar'

const USER_ID = import.meta.env.VITE_USER_ID || 'demo-user'

export default function HabitDetail() {
  const { habitId } = useParams()
  const navigate = useNavigate()

  // Nombre del hábito pasado como state desde HabitCard al navegar
  const { state } = useLocation()
  const habitName = state?.name || 'Hábito'

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estado único del botón; mismo patrón que HabitCard para consistencia
  const [btnState, setBtnState] = useState('idle') // 'idle' | 'loading' | 'success' | 'conflict'
  const [btnError, setBtnError] = useState(null)   // solo para errores recuperables

  // Carga el historial completo de logs al montar la página
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await habitLogsApi.list(habitId)
        setLogs(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [habitId])

  const handleMarkToday = async () => {
    setBtnState('loading')
    setBtnError(null)

    try {
      // toLocaleDateString('sv') → YYYY-MM-DD en hora local del usuario
      // Mismo criterio que useHabits.js para evitar desfase de zona horaria
      const today = new Date().toLocaleDateString('sv')
      const result = await habitLogsApi.log(habitId, USER_ID, today)
      // Añade el nuevo log al principio de la lista (más reciente primero)
      setLogs((prev) => [result, ...prev])
      setBtnState('success')
    } catch (err) {
      if (err.status === 409) {
        // Ya estaba marcado hoy: estado permanente, no tiene sentido reintentar
        setBtnState('conflict')
      } else {
        // Error inesperado: el botón vuelve a idle para permitir reintentar
        setBtnState('idle')
        setBtnError(err.message || 'Error al guardar. Intenta de nuevo.')
      }
    }
  }

  // Calcula el lunes de la semana actual para filtrar los logs de la semana
  const weekStart = (() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1))
    return d.toISOString().split('T')[0]
  })()

  const thisWeekCount = logs.filter((l) => l.log_date >= weekStart).length
  const weeklyPct = Math.round((thisWeekCount / 7) * 100)

  // Configuración visual del botón según su estado actual
  const btnConfig = {
    idle: {
      label: 'Marcar como completado hoy',
      className: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
      disabled: false,
    },
    loading: {
      label: 'Guardando...',
      className: 'bg-brand-500 text-white opacity-60 cursor-not-allowed',
      disabled: true,
    },
    success: {
      label: '¡Completado hoy! ✓',
      className: 'bg-brand-100 text-brand-700 cursor-default',
      disabled: true,
    },
    conflict: {
      label: 'Ya completado hoy',
      className: 'bg-gray-100 text-gray-400 cursor-default',
      disabled: true,
    },
  }[btnState]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header sticky con nombre del hábito ─────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none flex-shrink-0"
            aria-label="Volver al inicio"
          >
            ←
          </button>
          {/* habitName viene de location.state; el usuario sabe inmediatamente qué hábito está viendo */}
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{habitName}</h1>
            <p className="text-xs text-gray-400">Historial completo</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* ── Tarjeta de progreso + botón ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Progreso esta semana</p>
            <ProgressBar percentage={weeklyPct} label={`${thisWeekCount}/7 días`} />
          </div>

          {/* Mensaje de error recuperable (el botón vuelve a idle en estos casos) */}
          {btnError && <p className="text-xs text-red-500">{btnError}</p>}

          {/* Botón principal: zona de toque grande (py-2.5 ≈ 44 px) */}
          <button
            onClick={handleMarkToday}
            disabled={btnConfig.disabled}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${btnConfig.className}`}
          >
            {btnConfig.label}
          </button>
        </div>

        {/* ── Lista de registros ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 text-sm mb-4">Todos los registros</h2>

          {/* Estado: cargando */}
          {loading && (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {/* Estado: error al cargar */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Estado: sin registros */}
          {!loading && !error && logs.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Aún no hay registros para este hábito.
            </p>
          )}

          {/* Estado: lista de registros (más reciente primero) */}
          <ul className="flex flex-col gap-2">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center gap-3 text-sm text-gray-600 bg-brand-50 rounded-xl px-3 py-2"
              >
                {/* Icono de check visual */}
                <span className="text-brand-500 text-base flex-shrink-0">✓</span>
                <span>
                  {/* T00:00:00 fuerza interpretación local para evitar desfase de zona horaria */}
                  {new Date(log.log_date + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
