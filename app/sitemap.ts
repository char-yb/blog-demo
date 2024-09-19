import { getBlogPosts } from 'app/blog/utils'
import { MetadataRoute } from 'next'

export const baseUrl = 'https://portfolio-blog-starter.vercel.app'

// Next에서 정적인 것을 동적으로 만들어준다. 
export default async function sitemap() : Promise<MetadataRoute.Sitemap>{
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let routes = ['', '/blog'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs]
}
