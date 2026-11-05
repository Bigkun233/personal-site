// src/pages/BlogList.tsx — 杂志风：文字标签筛选 + 细下划线搜索
import { useMemo, useState } from 'react'
import { getPostMetas, getAllTags } from '../lib/posts'
import { PostCard } from '../components/PostCard'

export function BlogList() {
  const posts = getPostMetas()
  const tags = getAllTags()
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchTag = !activeTag || p.tags.includes(activeTag)
      const kw = keyword.trim().toLowerCase()
      const matchKw =
        !kw ||
        p.title.toLowerCase().includes(kw) ||
        p.summary.toLowerCase().includes(kw) ||
        p.tags.some((t) => t.toLowerCase().includes(kw))
      return matchTag && matchKw
    })
  }, [posts, activeTag, keyword])

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl text-ink dark:text-night-ink">文章</h1>
        <p className="mt-3 text-ink-soft dark:text-night-soft">
          共 {posts.length} 篇，关于技术、思考与生活。
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-night-line">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`transition-colors ${
              activeTag === null
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-ink-faint hover:text-ink dark:text-night-soft dark:hover:text-night-ink'
            }`}
          >
            全部
          </button>
          {tags.map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag((t) => (t === tag ? null : tag))}
              className={`transition-colors ${
                activeTag === tag
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-ink-faint hover:text-ink dark:text-night-soft dark:hover:text-night-ink'
              }`}
            >
              {tag}
              <span className="ml-1 text-xs opacity-60">{count}</span>
            </button>
          ))}
        </div>

        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索…"
          className="w-full border-b border-line bg-transparent py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-500 sm:w-44 dark:border-night-line dark:text-night-ink dark:placeholder:text-night-soft"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-ink-faint dark:text-night-soft">没有找到匹配的文章。</p>
      ) : (
        <div className="post-list">
          {filtered.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
