import { useEffect } from 'react'
import { APP_NAME } from '@/utils/constants'

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/** Sadə SEO idarəsi — public səhifələrdə başlıq və təsviri təyin edir. */
export function usePageMeta(input: { title: string; description?: string; canonical?: string }) {
  const { title, description, canonical } = input

  useEffect(() => {
    const fullTitle = title.includes(APP_NAME) ? title : `${title} — ${APP_NAME}`
    document.title = fullTitle
    setMeta('property', 'og:title', fullTitle)

    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
    }

    if (canonical) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = canonical
    }
  }, [title, description, canonical])
}
