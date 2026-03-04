// Archivo para mantener los fallbacks mientras el backend no esté disponible
export const MOCK_HABITS = [
  { id: '1', title: "Beber 2L de agua", streak: 3, done: true },
  { id: '2', title: "Meditar 10 min", streak: 5, done: false },
  { id: '3', title: "Leer 15 páginas", streak: 1, done: false },
  { id: '4', title: "Desconexión digital 10pm", streak: 0, done: false },
];

export const MOCK_WEEKLY_PROGRESS = {
  weekLabel: "Esta semana",
  percentage: 65,
  topHabits: ["Meditar 10 min", "Beber 2L de agua"],
  bottomHabits: ["Leer 15 páginas"],
  dailyStats: [40, 70, 100, 30, 80, 60, 50],
  habits: [
    { id: '1', title: "Beber 2L de agua", days: [true, true, true, false, true, true, true] },
    { id: '2', title: "Meditar 10 min", days: [true, true, true, true, true, true, false] },
    { id: '3', title: "Leer 15 páginas", days: [false, false, true, false, false, false, false] },
    { id: '4', title: "Desconexión digital", days: [false, true, false, false, true, true, false] },
  ]
};

export const MOCK_INSIGHT = {
  message: "Tu patrón sugiere que tu nivel de energía es más alto por las mañanas. Has logrado mantener tu racha de meditación durante 5 días seguidos al despertar."
};
