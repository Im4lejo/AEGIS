import {
  Component,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { formatCurrency, imageUrl, route } from '../presentation'
import './ui.css'
import '../ApiState.css'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function classNames(...values) {
  return values.filter(Boolean).join(' ')
}

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'medium',
    type = 'button',
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      className={classNames(
        'ui-button',
        `ui-button--${variant}`,
        `ui-button--${size}`,
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
})

function Field({
  as: Element = 'input',
  id,
  label,
  hint,
  error,
  className,
  children,
  ...props
}) {
  const generatedId = useId()
  const controlId = id || generatedId
  const hintId = hint ? `${controlId}-hint` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy =
    [props['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={controlId}>
          {label}
        </label>
      )}
      {Element === 'input' ? (
        <input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : props['aria-invalid']}
          className={classNames('ui-control', className)}
          id={controlId}
        />
      ) : (
        <Element
          {...props}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : props['aria-invalid']}
          className={classNames('ui-control', className)}
          id={controlId}
        >
          {children}
        </Element>
      )}
      {hint && (
        <span className="ui-field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="ui-field__error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  )
}

export function Input(props) {
  return <Field {...props} />
}

export function Textarea(props) {
  return <Field {...props} as="textarea" />
}

export function Select({ children, ...props }) {
  return (
    <Field {...props} as="select">
      {children}
    </Field>
  )
}

function useDialogFocus(open, onClose, dialogRef) {
  useEffect(() => {
    if (!open) return undefined

    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const dialog = dialogRef.current
    const firstFocusable = dialog?.querySelector(FOCUSABLE)
    ;(firstFocusable || dialog)?.focus()
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
        return
      }

      if (event.key !== 'Tab' || !dialog) return
      const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE))
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus()
    }
  }, [open, onClose, dialogRef])
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  labelledBy,
}) {
  const generatedId = useId()
  const titleId = labelledBy || generatedId
  const dialogRef = useRef(null)
  useDialogFocus(open, onClose, dialogRef)

  if (!open) return null

  return (
    <div
      className="ui-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={classNames('ui-dialog', className)}
        ref={dialogRef}
        role="dialog"
        tabIndex="-1"
      >
        <header className="ui-dialog__header">
          <h2 id={titleId}>{title}</h2>
          {onClose && (
            <Button
              aria-label="Cerrar diálogo"
              className="ui-dialog__close"
              onClick={onClose}
              variant="quiet"
            >
              <span aria-hidden="true">×</span>
            </Button>
          )}
        </header>
        <div className="ui-dialog__body">{children}</div>
      </section>
    </div>
  )
}

export function Drawer({ side = 'right', ...props }) {
  return (
    <Modal
      {...props}
      className={classNames(`ui-dialog--drawer-${side}`, props.className)}
    />
  )
}

export function Tabs({ tabs, value, onChange, label = 'Secciones' }) {
  const [uncontrolledValue, setUncontrolledValue] = useState(tabs[0]?.id)
  const tabRefs = useRef([])
  const activeId = value ?? uncontrolledValue
  const activeTab = tabs.find((tab) => tab.id === activeId) || tabs[0]
  const tablistId = useId()

  const selectTab = (tab) => {
    if (tab.disabled) return
    if (value === undefined) setUncontrolledValue(tab.id)
    onChange?.(tab.id)
  }

  const handleKeyDown = (event, index) => {
    const enabledTabs = tabs
      .map((tab, tabIndex) => ({ tab, tabIndex }))
      .filter(({ tab }) => !tab.disabled)
    const enabledIndex = enabledTabs.findIndex(
      ({ tabIndex }) => tabIndex === index,
    )
    let nextIndex
    if (event.key === 'ArrowRight')
      nextIndex = (enabledIndex + 1) % enabledTabs.length
    else if (event.key === 'ArrowLeft')
      nextIndex = (enabledIndex - 1 + enabledTabs.length) % enabledTabs.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = enabledTabs.length - 1
    else return
    event.preventDefault()
    const target = enabledTabs[nextIndex]
    tabRefs.current[target.tabIndex]?.focus()
    selectTab(target.tab)
  }

  if (!activeTab) return null

  return (
    <div className="ui-tabs">
      <div aria-label={label} className="ui-tabs__list" role="tablist">
        {tabs.map((tab, index) => (
          <button
            aria-controls={`${tablistId}-panel`}
            aria-selected={tab.id === activeTab.id}
            className="ui-tabs__tab"
            disabled={tab.disabled}
            id={`${tablistId}-${tab.id}`}
            key={tab.id}
            onClick={() => selectTab(tab)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            role="tab"
            tabIndex={tab.id === activeTab.id ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        aria-labelledby={`${tablistId}-${activeTab.id}`}
        className="ui-tabs__panel"
        id={`${tablistId}-panel`}
        role="tabpanel"
        tabIndex="0"
      >
        {activeTab.content}
      </div>
    </div>
  )
}

export function Toast({
  open = true,
  message,
  tone = 'info',
  onClose,
  duration = 0,
}) {
  useEffect(() => {
    if (!open || !duration || !onClose) return undefined
    const timer = window.setTimeout(onClose, duration)
    return () => window.clearTimeout(timer)
  }, [open, duration, onClose])

  if (!open || !message) return null

  return (
    <div
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={classNames('ui-toast', `ui-toast--${tone}`)}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <span>{message}</span>
      {onClose && (
        <Button
          aria-label="Cerrar notificación"
          onClick={onClose}
          variant="quiet"
        >
          ×
        </Button>
      )}
    </div>
  )
}

export function Dropdown({ label, items, className }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const triggerId = useId()
  const menuId = useId()

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const itemsInMenu = Array.from(
      menuRef.current?.querySelectorAll('[role="menuitem"]:not(:disabled)') ||
        [],
    )
    if (!itemsInMenu.length) return
    event.preventDefault()
    const currentIndex = itemsInMenu.indexOf(document.activeElement)
    let nextIndex = currentIndex
    if (event.key === 'ArrowDown')
      nextIndex = (currentIndex + 1) % itemsInMenu.length
    if (event.key === 'ArrowUp')
      nextIndex = (currentIndex - 1 + itemsInMenu.length) % itemsInMenu.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = itemsInMenu.length - 1
    itemsInMenu[nextIndex]?.focus()
  }

  return (
    <div
      className={classNames('ui-dropdown', className)}
      onKeyDown={handleKeyDown}
    >
      <Button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        id={triggerId}
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        variant="secondary"
      >
        {label}
      </Button>
      {open && (
        <div
          aria-labelledby={triggerId}
          className="ui-dropdown__menu"
          id={menuId}
          ref={menuRef}
          role="menu"
        >
          {items.map((item) => (
            <button
              className="ui-dropdown__item"
              disabled={item.disabled || !item.onSelect}
              key={item.id || item.label}
              onClick={() => {
                item.onSelect?.()
                setOpen(false)
              }}
              role="menuitem"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Skeleton({ width, height = '1rem', className, ...props }) {
  return (
    <span
      aria-hidden="true"
      className={classNames('ui-skeleton', className)}
      style={{ width, height, ...props.style }}
      {...props}
    />
  )
}

export function Avatar({ name = 'Usuario', src, size = 'medium', className }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const image = src && !failed

  return image ? (
    <img
      alt={name}
      className={classNames('ui-avatar', `ui-avatar--${size}`, className)}
      onError={() => setFailed(true)}
      src={src}
    />
  ) : (
    <span
      aria-label={name}
      className={classNames(
        'ui-avatar',
        `ui-avatar--${size}`,
        'ui-avatar--fallback',
        className,
      )}
      role="img"
    >
      {initials || 'U'}
    </span>
  )
}

export function Badge({ children, tone = 'neutral', className }) {
  return (
    <span className={classNames('ui-badge', `ui-badge--${tone}`, className)}>
      {children}
    </span>
  )
}

export function Card({
  as: Element = 'section',
  className,
  children,
  ...props
}) {
  return (
    <Element className={classNames('ui-card', className)} {...props}>
      {children}
    </Element>
  )
}

export function ProductCard({ product, onSelect }) {
  const name = product?.titulo || product?.nombre || 'Producto'
  const content = (
    <>
      <img
        alt={name}
        className="ui-product-card__image"
        loading="lazy"
        src={imageUrl(product?.imagen_principal || product?.imagen)}
      />
      <span className="ui-product-card__body">
        <strong>{name}</strong>
        {product?.categoria?.nombre && <span>{product.categoria.nombre}</span>}
        <span className="ui-product-card__price">
          COP {formatCurrency(product?.precio)}
        </span>
      </span>
    </>
  )

  if (!product?.id)
    return <article className="ui-card ui-product-card">{content}</article>
  const href = route(`/productos/detalle?id=${encodeURIComponent(product.id)}`)
  return (
    <a
      aria-label={`${name}, COP ${formatCurrency(product?.precio)}`}
      className="ui-card ui-product-card"
      href={href}
      onClick={
        onSelect
          ? (event) => {
              event.preventDefault()
              onSelect(product)
            }
          : undefined
      }
    >
      {content}
    </a>
  )
}

export function PostCard({ post, children }) {
  const author = post?.usuario?.username || post?.autor || 'Usuario'
  return (
    <article className="ui-card ui-post-card">
      <header className="ui-post-card__header">
        <Avatar
          name={author}
          src={post?.usuario?.foto_perfil || post?.avatar}
        />
        <div>
          <strong>{author}</strong>
          {post?.fecha && <time>{post.fecha}</time>}
        </div>
      </header>
      {post?.titulo && <h2>{post.titulo}</h2>}
      {post?.contenido && <p>{post.contenido}</p>}
      {children}
    </article>
  )
}

export function ConfirmDialog({
  open,
  title = '¿Confirmas esta acción?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onClose,
}) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')

  const confirm = async () => {
    setConfirming(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (requestError) {
      setError(requestError?.message || 'No se pudo completar la acción.')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Modal onClose={onClose} open={open} title={title}>
      {message && <p>{message}</p>}
      {error && (
        <p className="ui-field__error" role="alert">
          {error}
        </p>
      )}
      <div className="ui-dialog__actions">
        <Button disabled={confirming} onClick={onClose} variant="secondary">
          {cancelLabel}
        </Button>
        <Button disabled={confirming || !onConfirm} onClick={confirm}>
          {confirming ? 'Procesando...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="ui-error-boundary" role="alert">
          <h1>Algo salió mal</h1>
          <p>Esta pantalla no pudo mostrarse. Intenta recargarla.</p>
        </main>
      )
    }
    return this.props.children
  }
}

const ERROR_TITLES = {
  0: 'Sin conexión',
  401: 'Inicia sesión para continuar',
  403: 'Acceso restringido',
  404: 'No encontrado',
  409: 'Conflicto',
  422: 'Revisa los datos',
  429: 'Demasiadas solicitudes',
}

export function LoadingState({ message = 'Cargando...', compact = false }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={classNames(
        'api-state',
        'api-state--loading',
        compact && 'api-state--compact',
      )}
      role="status"
    >
      {message}
    </div>
  )
}

export function EmptyState({
  title = 'Sin resultados',
  message,
  compact = false,
}) {
  return (
    <div
      aria-live="polite"
      className={classNames(
        'api-state',
        'api-state--empty',
        compact && 'api-state--compact',
      )}
      role="status"
    >
      <strong>{title}</strong>
      {message && <p>{message}</p>}
    </div>
  )
}

export function FeedbackMessage({ message, tone = 'info', className = '' }) {
  if (!message) return null
  const role = tone === 'error' ? 'alert' : 'status'
  return (
    <div
      className={classNames('api-feedback', `api-feedback--${tone}`, className)}
      role={role}
    >
      {message}
    </div>
  )
}

export function AccessRestrictedState({
  message = 'No tienes permiso para ver este contenido.',
}) {
  return (
    <section
      aria-live="assertive"
      className="api-state api-state--error"
      role="alert"
    >
      <strong>Acceso restringido</strong>
      <p>{message}</p>
    </section>
  )
}

export function ErrorState({ error, onRetry, compact = false }) {
  const status = error?.status
  const message =
    typeof error === 'string'
      ? error
      : error?.message || 'No se pudo completar la solicitud.'
  if (status === 403) return <AccessRestrictedState message={message} />

  return (
    <section
      aria-live="assertive"
      className={classNames(
        'api-state',
        'api-state--error',
        compact && 'api-state--compact',
      )}
      role="alert"
    >
      <strong>
        {ERROR_TITLES[status] ||
          (status >= 500 ? 'Servicio no disponible' : 'No se pudo completar')}
      </strong>
      <p>{message}</p>
      {onRetry && (
        <Button
          className="api-state__retry"
          onClick={onRetry}
          variant="secondary"
        >
          Reintentar
        </Button>
      )}
    </section>
  )
}
