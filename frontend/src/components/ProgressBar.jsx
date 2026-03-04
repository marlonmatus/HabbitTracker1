export default function ProgressBar({ percentage, label }) {
  const clamped = Math.min(100, Math.max(0, percentage))
  const color =
    clamped >= 80
      ? 'bg-brand-500'
      : clamped >= 50
      ? 'bg-yellow-400'
      : 'bg-red-400'

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
