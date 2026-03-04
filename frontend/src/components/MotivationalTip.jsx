/**
 * MotivationalTip
 * ---------------
 * Muestra el consejo motivacional semanal generado por Gemini.
 *
 * Maneja 3 estados:
 *   1. loading → skeleton animado (2 líneas) mientras espera la respuesta inicial.
 *   2. success → icono + texto del consejo con fondo degradado suave.
 *   3. sin tip (null o error) → no renderiza nada.
 *
 * Props:
 *   tip        → string | null  (texto del consejo)
 *   loading    → boolean        (carga inicial)
 *   onRefresh  → function       (fuerza nuevo consejo desde Gemini)
 *   refreshing → boolean        (true mientras se está llamando a Gemini)
 */
export default function MotivationalTip({ tip, loading, onRefresh, refreshing, refreshError }) {
  // Estado 1: carga inicial — skeleton que mantiene el espacio visual
  if (loading) {
    return (
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 animate-pulse">
        <div className="h-3.5 bg-brand-100 rounded w-3/4 mb-2.5" />
        <div className="h-3.5 bg-brand-100 rounded w-1/2" />
      </div>
    )
  }

  // Estado 3: sin consejo — silencio total
  if (!tip) return null

  // Estado 2: consejo disponible
  return (
    <div className="bg-gradient-to-r from-brand-50 to-green-50 border border-brand-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        {/* Contenido del consejo */}
        <div className="flex gap-3 items-start flex-1 min-w-0">
          <span className="text-2xl select-none flex-shrink-0" aria-hidden="true">
            💡
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wide">
              Consejo de la semana
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
          </div>
        </div>

        {/* Botón refresh — solo visible si se pasa onRefresh */}
        {onRefresh && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Pedir nuevo consejo a Gemini"
              className="p-1.5 rounded-lg text-brand-400 hover:text-brand-600 hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Nuevo consejo"
            >
              {refreshing ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
              )}
            </button>
            {refreshError && (
              <p className="text-xs text-red-500 text-right max-w-[120px] leading-tight">{refreshError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
