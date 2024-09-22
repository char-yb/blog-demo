import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { baseUrl } from 'app/sitemap'
import { sql } from '@vercel/postgres'

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export function generateMetadata({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug)
  if (!post) {
    return
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export async function getViewsCount(): Promise<
  { slug: string; count: number }[]
> {
  'use server' // 이 코드는 서버에서만 실행됩니다.
  if (!process.env.POSTGRES_URL) {
    return []
  }

  const { rows } = await sql`
    SELECT slug, count 
    FROM views
  `
  return rows.map((row) => ({
    slug: row.slug,
    count: row.count,
  }))
}

const incrementView = async (slug: string) => {
  'use server' // 이 코드는 서버에서만 실행됩니다.

  await sql`
    INSERT INTO views (slug, count)
    VALUES (${slug}, 1)
    ON CONFLICT (slug)
    DO UPDATE SET count = views.count + 1
  `
}

export default async function Blog({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug)
  await incrementView(params.slug)

  const views = await getViewsCount()
  const count = views.find((view) => view.slug === params.slug)?.count || 0

  if (!post) {
    notFound()
  }

  return (
    <section>
      {/* JSON-LD: 일종의 포맷이며 검색 엔진이 좀 더 이해하기 쉽도록 엔진 최적화에 필요한 요소 */}
      {/* 사용법: 레이아웃이나 Page 파일에 <script> 태그를 첨부하여 데이터를 밀어넣는 방식 */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'My Portfolio',
            },
          }),
        }}
      />
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(post.metadata.publishedAt)}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {/* 조회 수 영역 */}
          {count.toLocaleString()} views
        </p>
      </div>
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
    </section>
  )
}
