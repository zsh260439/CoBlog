import { Injectable } from '@nestjs/common'
import { ArticlesService } from '../articles/article.service'
import { TaxonomyService } from '../taxonomy/taxonomy.service'

const SITE_URL = 'https://coblog.top'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

@Injectable()
export class SeoService {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly taxonomyService: TaxonomyService,
  ) {}

  async getSitemapData() {
    const [articles, categories, tags] = await Promise.all([
      this.articlesService.findAll(),
      this.taxonomyService.listCategories(),
      this.taxonomyService.listTags(),
    ])

    return {
      articles,
      categories: categories.map((item) => ({
        label: item.label,
        slug: item.slug,
      })),
      tags: tags.map((item) => ({
        label: item.label,
        slug: item.slug,
      })),
    }
  }

  async getSitemapXml() {
    const data = await this.getSitemapData()
    const staticUrls = ['/', '/blog', '/archive', '/message', '/about']
    const articleUrls = (data.articles as Array<{ slug?: string } | null>)
      .filter((article) => typeof article?.slug === 'string' && article.slug.length > 0)
      .map((article) => `/article/${article!.slug}`)
    const categoryUrls = data.categories.map((category) => `/category/${category.slug}`)
    const tagUrls = data.tags.map((tag) => `/tag/${encodeURIComponent(tag.slug)}`)

    const urls = [...new Set([...staticUrls, ...articleUrls, ...categoryUrls, ...tagUrls])]
    const entries = urls.map((path) => `  <url>\n    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>\n  </url>`)

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`
  }
}
