import { useState, useEffect } from 'react';
import { insightsService } from '../services/insights';

export function useInsight(date) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      // Caching Ligero: Almacenar en Session Storage por día
      const cacheKey = `insight-${date}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached) {
        setInsight(JSON.parse(cached));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await insightsService.getDailyInsight(date);
        setInsight(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err) {
        // Fallback sutil si falla la API de IA (Tono Zen)
        setInsight({ message: "Sigue construyendo tu camino. Cada pequeño paso cuenta." });
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [date]);

  return { insight, loading };
}
