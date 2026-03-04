# Taller IA-First: MVP Web con Backend en Python

## Habit Tracker con Gemini + Supabase (Versión Detallada para Taller)

---

# 🎯 PROPÓSITO DEL TALLER

Este taller no trata de escribir código rápido.

Trata de aprender a:

- Diseñar antes de implementar
- Controlar el nivel de salida de la IA
- Separar pensamiento arquitectónico de generación automática
- Evitar que la IA “salte” directo al código

⚠️ REGLA FUNDAMENTAL
En todas las fases de diseño debes incluir explícitamente:

"No generes código. No incluyas snippets. No escribas clases ni funciones."

Si no lo indicas, Cursor tenderá a generar implementación automáticamente.

---

# 🧭 STACK DEFINITIVO (SIMPLIFICADO Y ESTABLE)

Frontend:

- React + Vite
- Tailwind CSS (mobile-first)

Backend:

- Python 3.11+
- FastAPI
- SQLAlchemy (modo simple)

Base de datos:

- Supabase en modo local (Supabase CLI)
- PostgreSQL ejecutándose localmente
- Sin configuración avanzada
- Uso de archivo .env para connection string
- Base de datos ligera compatible con equipo local

IA:

- Gemini API
- Llamada desde backend

---

# 🔵 FASE 1 – DISEÑO GENERAL DEL SISTEMA

## 🎯 Objetivo

Definir la arquitectura antes de tocar código.

## 🧠 Qué estamos buscando

- Claridad en responsabilidades
- Flujo completo frontend → backend → DB → Gemini → frontend
- Separación simple pero clara

## 📌 PROMPT PARA COPIAR EN CURSOR

---

Actúa como un arquitecto de software pragmático.

Vamos a construir una aplicación web responsiva para seguimiento de hábitos.

Requerimientos funcionales:

- Crear hábitos
- Marcar hábitos como completados diariamente
- Guardar historial
- Calcular progreso semanal
- Generar consejo motivacional usando Gemini

Stack técnico:

- Frontend: React + Vite + Tailwind
- Backend: Python con FastAPI
- Base de datos: Supabase PostgreSQL

Diseña una arquitectura SIMPLE basada en:

- Routers
- Services
- Models
- database connection

Explica detalladamente:

1. Flujo completo de datos paso a paso
2. Responsabilidad de cada módulo
3. Cómo se integra Gemini
4. Dónde se calcula el progreso semanal
5. Cómo evitar llamadas innecesarias al LLM

## No generes código.
No incluyas snippets.
No escribas clases ni funciones.
Solo diseño estructurado y explicación detallada.

---

# 🔵 FASE 2 – DISEÑO DE BASE DE DATOS EN SUPABASE LOCAL

## 🎯 Objetivo

Diseñar un esquema simple que pueda ejecutarse en Supabase local.

## 🧠 Contexto Importante

Supabase se ejecutará en modo local usando Supabase CLI.
Esto significa:

- PostgreSQL corre en tu máquina
- No dependemos de internet
- No usamos características avanzadas
- Solo SQL estándar

## 📌 PROMPT PARA COPIAR

---

Actúa como diseñador experto en PostgreSQL.

La base de datos se ejecutará en Supabase en modo local (PostgreSQL estándar).

Diseña un esquema simple que incluya:

- Users
- Habits
- HabitLogs
- WeeklyInsights

Requisitos:

- Compatible con PostgreSQL estándar
- Sin extensiones avanzadas
- Sin funciones complejas
- Fácil de ejecutar localmente
- Optimizado para claridad y simplicidad

Explica detalladamente:

1. Propósito de cada tabla
2. Relaciones entre tablas
3. Cómo se calcula progreso semanal con este modelo
4. Cómo evitamos regenerar consejos cada vez
5. Qué índices serían recomendables en entorno local

## No generes código backend.
No generes implementación en Python.
Solo diseño SQL conceptual explicado claramente.

---

Actúa como diseñador experto en PostgreSQL.

Diseña un esquema simple para Supabase que incluya:

- Users
- Habits
- HabitLogs
- WeeklyInsights

Requisitos:

- Compatible con PostgreSQL estándar
- Sin funciones avanzadas
- Fácil de ejecutar desde panel SQL de Supabase
- Optimizado para claridad y simplicidad

Explica:

1. Propósito de cada tabla
2. Relaciones entre tablas
3. Cómo se calculará el progreso semanal con este modelo
4. Cómo evitamos regenerar consejos cada vez

## No generes código de aplicación.
No generes implementación backend.
Puedes describir el SQL conceptualmente, pero no escribas código Python.

---

# 🔵 FASE 3 – ESTRUCTURA DEL BACKEND (ANTES DE GENERAR)

## 🎯 Objetivo

Definir estructura clara antes de crear archivos.

⚠️ La conexión será a Supabase LOCAL.
Usaremos un connection string almacenado en archivo .env.
No se usará Supabase cloud.

## 📌 PROMPT

---

Actúa como un desarrollador senior especializado en FastAPI.

La base de datos es PostgreSQL ejecutándose localmente mediante Supabase CLI.
La conexión se hará usando un connection string almacenado en .env.

Define la estructura mínima del proyecto backend con:

- main.py
- routers/
- services/
- models/
- database.py

Explica detalladamente:

1. Qué vive en cada carpeta
2. Cómo interactúan entre sí
3. Cómo se configura la conexión a PostgreSQL local
4. Cómo se cargan variables de entorno
5. Cómo manejar errores básicos

## No generes código.
No escribas archivos ni ejemplos de implementación.
Solo descripción detallada y justificación.

---

Actúa como un desarrollador senior especializado en FastAPI.

Define la estructura mínima del proyecto backend con:

- main.py
- routers/
- services/
- models/
- database.py

Explica detalladamente:

1. Qué vive en cada carpeta
2. Cómo interactúan entre sí
3. Cómo se inyecta la conexión a Supabase
4. Cómo manejar errores básicos

## No generes código.
No escribas archivos ni ejemplos de implementación.
Solo descripción detallada y justificación.

---

# 🔵 FASE 4 – GENERACIÓN CONTROLADA DE CRUD

⚠️ A partir de aquí sí se permitirá generar código.

## 📌 PROMPT DE IMPLEMENTACIÓN

---

Ahora genera la implementación para:

- Crear hábito
- Obtener hábitos por usuario
- Registrar cumplimiento diario

Usa:

- FastAPI
- SQLAlchemy o cliente simple
- Conexión a PostgreSQL local (Supabase CLI) mediante connection string en .env

## Respeta la estructura definida previamente.  
Mantén el código simple, claro y con comentarios claros y sencillos de leer para entender la logica de la aplicacion

---

# 🔵 FASE 5 – DISEÑO DE INTEGRACIÓN CON GEMINI

## 🎯 Objetivo

Diseñar primero, implementar después.

## 📌 PROMPT DE DISEÑO

---

Diseña una integración simple con Gemini en Python.

Debe incluir:

- Servicio GeminiService
- Uso de httpx o requests
- API key desde variable de entorno
- Manejo básico de errores
- Estrategia para no regenerar consejo si ya existe esta semana

Explica:

1. Flujo de generación de consejo
2. Dónde se calcula progreso semanal
3. Cómo se guarda el consejo
4. Qué pasa si Gemini falla

## No generes código.
No incluyas funciones ni clases.
Solo diseño y explicación detallada.

---

## 📌 PROMPT DE IMPLEMENTACIÓN GEMINI

---

Ahora genera la implementación de:

- Servicio GeminiService
- Endpoint que calcula progreso semanal
- Llamada a Gemini
- Guardado en Supabase
- Respuesta al frontend

## Mantén código claro y mínimo necesario.

---

# 🔵 FASE 6 – DISEÑO FRONTEND RESPONSIVO

## 🎯 Objetivo

Diseñar UX antes de escribir componentes.

## 📌 PROMPT DE DISEÑO

---

Actúa como frontend architect especializado en diseño mobile-first.

Diseña la experiencia de usuario para:

- Lista de hábitos
- Botón marcar completado
- Sección consejo motivacional

Explica:

1. Layout en mobile
2. Layout en desktop
3. Organización de componentes
4. Estrategia de manejo de estado

## No generes código.
No escribas componentes React.
Solo diseño estructural.

---

## 📌 PROMPT DE IMPLEMENTACIÓN FRONTEND

---

Ahora genera los componentes React usando Tailwind.

Requisitos:

- Mobile-first
- Totalmente responsivo
- Llamadas al backend FastAPI
- Código organizado por componentes

---

---

# 🔵 FASE 7 – REVISIÓN GLOBAL

## 📌 PROMPT

---

Actúa como desarrollador senior pragmático.

Revisa el sistema completo y analiza:

- Flujo frontend → backend → Supabase → Gemini
- Puntos frágiles
- Simplificaciones posibles
- Riesgos técnicos

## No generes código nuevo.
Solo análisis detallado.

---

# 🔵 FASE 8 – PENSAMIENTO DE PRODUCCIÓN LIGERO

## 📌 PROMPT

---

Imagina que esta aplicación tiene 5,000 usuarios activos.

Analiza:

- Riesgos de rendimiento
- Optimización del uso de Gemini
- Protección de API key
- Mejoras simples sin sobreingeniería

## No generes código.
Solo análisis estratégico detallado.

---

# 🏁 CIERRE CULTURAL

Preguntas finales:

- ¿Dónde fue más útil la IA?
- ¿Dónde fue necesario criterio humano?
- ¿Qué cambiaremos en nuestra forma de trabajar?

Mensaje final:

La diferencia no está en el lenguaje.
Está en nuestra capacidad de diseñar antes de generar.

---

FIN DEL DOCUMENTO