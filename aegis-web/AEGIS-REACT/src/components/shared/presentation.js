export function route(path) {
    return `#/${String(path || '').replace(/^\/+/, '')}`
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
    return `/${path.replace(/^\//, '')}`
}

export function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        maximumFractionDigits: 0,
    }).format(Number(value || 0))
}

export function avatarUrl(user, size = 100) {
    const seed = user?.username || user?.email || user?.nombre || 'aegis'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&size=${size}`
}

export function imageUrl(filename, fallback = 'https://via.placeholder.com/300x230?text=Sin+Imagen') {
    return filename ? asset(`Assets/uploads/products/${filename}`) : fallback
}