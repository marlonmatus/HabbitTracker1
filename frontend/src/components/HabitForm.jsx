import { useState } from 'react'

export default function HabitForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      await onSubmit(name.trim(), description.trim() || undefined)
      setName('')
      setDescription('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4"
    >
      <h2 className="font-semibold text-gray-800 text-base">Nuevo hábito</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="habit-name" className="text-sm font-medium text-gray-600">
          Nombre <span className="text-red-400">*</span>
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Leer 20 minutos"
          required
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400 transition"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="habit-desc" className="text-sm font-medium text-gray-600">
          Descripción (opcional)
        </label>
        <textarea
          id="habit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Para qué quieres este hábito?"
          rows={2}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400 transition resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex-1 bg-brand-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Guardando...' : 'Crear hábito'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
