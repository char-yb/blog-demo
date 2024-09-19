import { baseUrl } from 'app/sitemap'
import { MetadataRoute } from 'next'

// 검색 엔진 최적화를 위한 크롤링 봇이다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
