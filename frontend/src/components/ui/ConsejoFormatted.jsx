/**
 * Renderiza el texto del consejo con ## como secciones, ** como negrita y emojis.
 * Sin dependencias de markdown; solo divisiones y resaltado.
 */
export function ConsejoFormatted({ text, className = '' }) {
  if (!text || typeof text !== 'string') return null

  const parts = []
  const lines = text.split('\n')
  let key = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      parts.push(<br key={key++} />)
      continue
    }
    if (trimmed.startsWith('## ')) {
      parts.push(
        <h4 key={key++} className="text-sm font-semibold text-foreground mt-4 mb-1 first:mt-0">
          {formatInline(trimmed.slice(3))}
        </h4>
      )
      continue
    }
    parts.push(
      <p key={key++} className="text-sm text-foreground/85 leading-relaxed mb-2">
        {formatInline(trimmed)}
      </p>
    )
  }

  return <div className={className}>{parts}</div>
}

/** Convierte **texto** en <strong> y deja el resto (incl. emojis) igual. */
function formatInline(str) {
  const out = []
  let i = 0
  let k = 0
  while (i < str.length) {
    if (str.slice(i, i + 2) === '**') {
      const end = str.indexOf('**', i + 2)
      if (end === -1) {
        out.push(<span key={k++}>{str.slice(i)}</span>)
        break
      }
      out.push(<strong key={k++} className="font-semibold text-foreground">{str.slice(i + 2, end)}</strong>)
      i = end + 2
    } else {
      const next = str.indexOf('**', i)
      const chunk = next === -1 ? str.slice(i) : str.slice(i, next)
      out.push(<span key={k++}>{chunk}</span>)
      i = next === -1 ? str.length : next
    }
  }
  return out
}
