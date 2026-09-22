export function route(path) {
    return path
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