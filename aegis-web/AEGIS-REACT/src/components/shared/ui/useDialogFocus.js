import { useEffect } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function visibleWithin(element, container) {
  for (let node = element; node && node !== container; node = node.parentElement) {
    const style = window.getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden') return false
  }
  return true
}

export function useDialogFocus(open, onClose, dialogRef, returnFocusRef) {
  useEffect(() => {
    if (!open) return undefined

    const previousFocus = returnFocusRef?.current || document.activeElement
    const previousOverflow = document.body.style.overflow
    const dialog = dialogRef.current
    const focusableElements = () => Array.from(dialog?.querySelectorAll(FOCUSABLE) || [])
      .filter((element) => element.getAttribute('tabindex') !== '-1' && visibleWithin(element, dialog))
    ;(focusableElements()[0] || dialog)?.focus()
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const focusable = focusableElements()
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
  }, [open, onClose, dialogRef, returnFocusRef])
}
