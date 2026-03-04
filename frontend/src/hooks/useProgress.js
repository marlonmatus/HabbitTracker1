import { useState, useEffect, useCallback } from 'react'
import { progressApi, tipsApi } from '../services/api'

export function useProgress(userId) {
  const [progress, setProgress] = useState([])
  const [tip, setTip] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [loadingTip, setLoadingTip] = useState(true)
  const [refreshingTip, setRefreshingTip] = useState(false)
  const [error, setError] = useState(null)
  const [refreshError, setRefreshError] = useState(null)

  const fetchProgress = useCallback(async () => {
    if (!userId) return
    setLoadingProgress(true)
    setError(null)
    try {
      const data = await progressApi.weekly(userId)
      setProgress(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingProgress(false)
    }
  }, [userId])

  const fetchTip = useCallback(async () => {
    if (!userId) return
    setLoadingTip(true)
    try {
      const data = await tipsApi.get(userId)
      setTip(data.tip)
    } catch {
      setTip(null)
    } finally {
      setLoadingTip(false)
    }
  }, [userId])

  // Fuerza una nueva llamada a Gemini ignorando el caché TTL.
  // Usa refreshingTip (no loadingTip) para distinguir la carga inicial
  // del refresh manual y evitar que el skeleton reemplace el consejo existente.
  const refreshTip = useCallback(async () => {
    if (!userId) return
    setRefreshingTip(true)
    setRefreshError(null)
    try {
      const data = await tipsApi.refresh(userId)
      setTip(data.tip)
    } catch (err) {
      const msg = err?.status === 429
        ? 'Demasiadas solicitudes. Espera un momento.'
        : 'No se pudo obtener un nuevo consejo.'
      setRefreshError(msg)
    } finally {
      setRefreshingTip(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProgress()
    fetchTip()
  }, [fetchProgress, fetchTip])

  return {
    progress,
    tip,
    loadingProgress,
    loadingTip,
    refreshingTip,
    refreshError,
    error,
    refetchProgress: fetchProgress,
    refetchTip: fetchTip,
    refreshTip,
  }
}
