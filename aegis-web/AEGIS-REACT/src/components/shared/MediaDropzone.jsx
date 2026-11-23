import { useRef, useState } from 'react'
import './MediaDropzone.css'

export default function MediaDropzone({
  value = [],
  onChange,
  maxFiles = 5,
  accept = 'image/jpeg,image/png,image/webp,video/mp4,video/webm',
  altText,
  onAltTextChange,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  const addFiles = (files) => {
    const selected = Array.from(files)
    const available = Math.max(0, maxFiles - value.length)
    if (selected.length > available) {
      setError(`Solo puedes añadir ${available} archivo(s) más.`)
      return
    }
    setError('')
    onChange?.([...value, ...selected].slice(0, maxFiles))
  }

  const remove = (index) => {
    setError('')
    onChange?.(value.filter((_, itemIndex) => itemIndex !== index))
  }

  const move = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange?.(next)
  }

  return (
    <section className="media-dropzone" aria-label="Gestión de archivos multimedia">
      <button
        type="button"
        className="media-dropzone__target"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          addFiles(event.dataTransfer.files)
        }}
      >
        <strong>Añadir imágenes o video</strong>
        <span>Máximo {maxFiles} archivos · imágenes 5 MB · video 25 MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        hidden
        disabled={disabled}
        onChange={(event) => {
          addFiles(event.target.files)
          event.target.value = ''
        }}
      />
      {error && <p className="media-dropzone__error" role="alert">{error}</p>}
      {value.length > 0 && (
        <div className="media-dropzone__gallery" aria-label="Galería multimedia">
          {value.map((file, index) => (
            <article className="media-dropzone__item" key={`${file.name}-${index}`}>
              {file.type?.startsWith('video/') ? (
                <video src={URL.createObjectURL(file)} muted controls aria-label={altText || `Video ${index + 1}`} />
              ) : (
                <img src={URL.createObjectURL(file)} alt={altText || `Archivo multimedia ${index + 1}`} />
              )}
              <div className="media-dropzone__controls">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Mover ${file.name} antes`}>←</button>
                <span>{index + 1}</span>
                <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label={`Mover ${file.name} después`}>→</button>
                <button type="button" onClick={() => remove(index)} aria-label={`Eliminar ${file.name}`}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {onAltTextChange && (
        <label className="media-dropzone__alt">
          Texto alternativo
          <input
            type="text"
            value={altText || ''}
            maxLength={255}
            onChange={(event) => onAltTextChange(event.target.value)}
            disabled={disabled}
          />
        </label>
      )}
    </section>
  )
}
