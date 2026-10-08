export function route(path) {
    let limpio = String(path || '')
    while (limpio.charAt(0) === '/') {
        limpio = limpio.substring(1)
    }
    return `#/${limpio}`
}

// Navegación interna compartida por los layouts: usa el onNavigate de la
// página cuando existe y, si la página aún no lo pasa, navega por hash.
export function navigateTo(path, onNavigate) {
    if (onNavigate) {
        onNavigate(path)
        return
    }
    const target = route(path)
    if (window.location.hash !== target) {
        window.location.hash = target
    }
    window.scrollTo(0, 0)
}

export function asset(path) {
    let limpio = String(path || '')
    if (limpio.charAt(0) === '/') {
        limpio = limpio.substring(1)
    }
    return `/${limpio}`
}

export function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        maximumFractionDigits: 0,
    }).format(Number(value || 0))
}

export function avatarUrl(user, size = 100) {
    return '/avatar-defecto.svg'
}

export function imageUrl(filename, fallback = 'https://via.placeholder.com/300x230?text=Sin+Imagen') {
    if (!filename) return fallback
    if (filename.indexOf('data:') === 0 || filename.indexOf('http') === 0 || filename.indexOf('/') === 0) return filename
    return asset(`Assets/uploads/products/${filename}`)
}