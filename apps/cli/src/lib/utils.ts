import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a URL prefixed with the base path when bullstudio
 * is mounted at a sub-path (e.g. via @bullstudio/express).
 * Falls back to the original path in standalone CLI mode.
 */
export function assetUrl(path: string): string {
  if (typeof window === 'undefined') return path
  const base = window.__BULLSTUDIO_BASE_PATH__ ?? ''
  return `${base}${path}`
}
