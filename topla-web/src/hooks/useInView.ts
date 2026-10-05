import { useEffect, useRef, useState } from 'react'

/** Element ekrana yaxınlaşanda `true` olur — kartların lazy data yükləməsi üçün. */
export function useInView<T extends HTMLElement>(rootMargin = '200px') {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || inView) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [inView, rootMargin])

  return { ref, inView }
}
