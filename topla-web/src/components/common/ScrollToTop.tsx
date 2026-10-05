import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Səhifə dəyişəndə yuxarı qayıt — amma eyni səhifədə query dəyişəndə YOX. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
