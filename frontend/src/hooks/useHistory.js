import { useState, useEffect, useCallback } from 'react';
import { habitsService } from '../services/habits';

export function useHistory(weekIndex) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular las fechas reales de la semana según weekIndex.
      // weekIndex=0 es la semana actual, weekIndex=1 es la semana pasada, etc.
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=domingo, 1=lunes…
      // Ajustamos para que la semana empiece el lunes (ISO)
      const diffToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday - weekIndex * 7);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const fmt = (d) => d.toLocaleDateString('sv'); // YYYY-MM-DD en zona local
      const startDate = fmt(monday);
      const endDate = fmt(sunday);

      const res = await habitsService.getWeeklyProgress(startDate, endDate);
      setData(res);

    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [weekIndex]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
}
