/**
 * WeekSummaryBar
 * --------------
 * Muestra el progreso global de la semana en una sola barra.
 *
 * Lógica de cálculo:
 *   - "Completados" = hábitos que tienen al menos 1 día registrado esta semana.
 *   - Porcentaje global = promedio del porcentaje de cada hábito.
 *     Un hábito con 3/7 días aporta 43 % al promedio.
 *
 * Props:
 *   total    → número total de hábitos activos del usuario.
 *   progress → array de { habit_id, days_completed, percentage } del hook useProgress.
 *   loading  → boolean; muestra skeleton mientras los datos cargan.
 */
export default function WeekSummaryBar({ total = 0, progress = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-200 rounded-full w-full" />
      </div>
    )
  }

  // Sin hábitos todavía: no tiene sentido mostrar el resumen
  if (total === 0) return null

  // Cuántos hábitos tienen al menos un día completado esta semana
  const completedCount = progress.filter((p) => p.days_completed > 0).length

  // Promedio de porcentaje entre todos los hábitos activos
  // Si aún no llegó el progreso del backend, usamos 0
  const avgPct =
    progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + (p.percentage ?? 0), 0) / progress.length)
      : 0

  // Color de la barra según el nivel de cumplimiento global
  const barColor =
    avgPct >= 80 ? 'bg-brand-500' : avgPct >= 50 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {/* Encabezado: etiqueta y porcentaje numérico */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progreso esta semana</span>
        <span className="text-sm font-semibold text-gray-800">{avgPct}%</span>
      </div>

      {/* Barra de progreso global */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-3">
        <div
          className={`${barColor} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${avgPct}%` }}
        />
      </div>

      {/* Detalle textual: N de X hábitos activos completados al menos una vez */}
      <p className="text-xs text-gray-400">
        {completedCount} de {total} hábito{total !== 1 ? 's' : ''} con al menos un día completado
      </p>
    </div>
  )
}
