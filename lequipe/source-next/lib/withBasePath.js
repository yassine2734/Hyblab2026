const PROD_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/nantes2026/lequipe'

/**
 * Prefixes local static URLs with the production basePath.
 * Leaves absolute URLs (http/https/data/blob) untouched.
 */
export function withBasePath(path) {
    if (!path || typeof path !== 'string') return path

    if (
        path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('//') ||
        path.startsWith('data:') ||
        path.startsWith('blob:')
    ) {
        return path
    }

    const normalized = path.startsWith('/') ? path : `/${path}`
    const basePath = process.env.NODE_ENV === 'production' ? PROD_BASE_PATH : ''

    if (!basePath) return normalized
    if (normalized === basePath || normalized.startsWith(`${basePath}/`)) return normalized

    return `${basePath}${normalized}`
}
