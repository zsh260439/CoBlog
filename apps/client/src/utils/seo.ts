import { watchEffect, toValue } from 'vue'
import { siteConfig } from '@/config/site'
import type {  SeoOptions } from '@/types/seo'

const SITE_URL = 'https://coblog.top'
const DEFAULT_DESCRIPTION = siteConfig.description
const DEFAULT_IMAGE = siteConfig.aboutHeroImage

function resolveUrl(path: string) {
  if (!path) {
    return SITE_URL
  }

  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function ensureMeta(selector: string, create: () => HTMLMetaElement) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = create()
    document.head.appendChild(element)
  }
  return element
}

function ensureLink(selector: string, create: () => HTMLLinkElement) {
  let element = document.head.querySelector<HTMLLinkElement>(selector)
  if (!element) {
    element = create()
    document.head.appendChild(element)
  }
  return element
}

function ensureJsonLdScript() {
  let element = document.head.querySelector<HTMLScriptElement>('script[data-seo-json-ld="app"]')
  if (!element) {
    element = document.createElement('script')
    element.type = 'application/ld+json'
    element.dataset.seoJsonLd = 'app'
    document.head.appendChild(element)
  }
  return element
}

function setMetaName(name: string, content: string) {
  const meta = ensureMeta(`meta[name="${name}"]`, () => {
    const element = document.createElement('meta')
    element.name = name
    return element
  })
  meta.content = content
}

function setMetaProperty(property: string, content: string) {
  const meta = ensureMeta(`meta[property="${property}"]`, () => {
    const element = document.createElement('meta')
    element.setAttribute('property', property)
    return element
  })
  meta.content = content
}

export function useSeo(options: SeoOptions) {
  watchEffect(() => {
    const rawTitle = (toValue(options.title) || siteConfig.name).trim()
    const description = (toValue(options.description) || DEFAULT_DESCRIPTION).trim()
    const path = (toValue(options.path) || '/').trim()
    const image = toValue(options.image) || DEFAULT_IMAGE
    const type = toValue(options.type) || 'website'
    const robots = toValue(options.robots) || 'index,follow'
    const structuredData = toValue(options.structuredData)

    const pageTitle = rawTitle === siteConfig.name ? rawTitle : `${rawTitle} - ${siteConfig.name}`
    const canonicalUrl = resolveUrl(path)
    const imageUrl = resolveUrl(image)

    document.title = pageTitle

    setMetaName('description', description)
    setMetaName('robots', robots)
    setMetaProperty('og:title', pageTitle)
    setMetaProperty('og:description', description)
    setMetaProperty('og:type', type)
    setMetaProperty('og:url', canonicalUrl)
    setMetaProperty('og:image', imageUrl)
    setMetaName('twitter:card', 'summary_large_image')
    setMetaName('twitter:title', pageTitle)
    setMetaName('twitter:description', description)
    setMetaName('twitter:image', imageUrl)

    const canonical = ensureLink('link[rel="canonical"]', () => {
      const element = document.createElement('link')
      element.rel = 'canonical'
      return element
    })
    canonical.href = canonicalUrl

    const jsonLd = ensureJsonLdScript()
    if (!structuredData) {
      jsonLd.textContent = ''
      return
    }

    jsonLd.textContent = JSON.stringify(structuredData)
  })
}

export function createWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    description: siteConfig.description,
  }
}

export function createPersonStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.ownerName,
    jobTitle: siteConfig.ownerRole,
    homeLocation: siteConfig.ownerLocation,
    url: siteConfig.siteUrl,
  }
}
