import { useState, useEffect, useCallback } from 'react';
import { habitsApi, habitLogsApi, aiApi } from '../services/api';

const USER_ID = import.meta.env.VITE_USER_ID || 'demo-user'

export function useHabits(date, options = {}) {
  const { onContextualEvent } = options
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await habitsApi.daily(USER_ID, date);
      // Map to ensure properties are as expected by UI
      setHabits(data.map(h => ({
        id: h.id,
        title: h.name,
        done: h.done,
        streak: h.streak || 0
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Optimistic UI Toggle
  const toggleHabit = async (habit) => {
    const isCompleted = !habit.done;
    
    // 1. Optimistic Update (Actualización instantánea en UI)
    setHabits(current => 
      current.map(h => {
        if (h.id === habit.id) {
          return { 
            ...h, 
            done: isCompleted,
            streak: isCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
          };
        }
        return h;
      })
    );

    try {
      // 2. Network Request
      if (isCompleted) {
        await habitLogsApi.log(habit.id, USER_ID, date);
      } else {
        await habitLogsApi.remove(habit.id, USER_ID, date);
      }
      await fetchHabits();
      try {
        const data = await aiApi.contextualEvent({
          user_id: USER_ID,
          habit_id: habit.id,
          just_completed: isCompleted,
        });
        if (data.message && onContextualEvent) onContextualEvent(data.message, data.event_type);
      } catch (_) {}
    } catch (err) {
      console.error("Failed to toggle habit:", err);
      // 3. Rollback en caso de error de red
      setHabits(current => 
        current.map(h => {
          if (h.id === habit.id) {
            return { 
              ...h, 
              done: habit.done,
              streak: habit.streak
            };
          }
          return h;
        })
      );
    }
  };

  return { habits, loading, error, toggleHabit, refetch: fetchHabits };
}
