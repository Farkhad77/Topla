/**
 * Token saxlanması tək yerdədir ki, strategiyanı dəyişmək asan olsun.
 * Yalnız access/refresh token saxlanılır — heç bir şəxsi məlumat yazılmır.
 */
const memory = new Map<string, string>()

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

export const storage = {
  get(key: string): string | null {
    if (hasLocalStorage()) {
      try {
        return window.localStorage.getItem(key)
      } catch {
        /* private mode */
      }
    }
    return memory.get(key) ?? null
  },
  set(key: string, value: string): void {
    memory.set(key, value)
    if (hasLocalStorage()) {
      try {
        window.localStorage.setItem(key, value)
      } catch {
        /* kvota */
      }
    }
  },
  remove(key: string): void {
    memory.delete(key)
    if (hasLocalStorage()) {
      try {
        window.localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
    }
  },
}
