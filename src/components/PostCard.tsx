// src/components/PostCard.tsx — 杂志风列表条目（博客区专用）
import { Link } from 'react-router-dom'
import type { PostMeta } from '../types'

export function PostCard({ post, index }: { post: PostMeta; index?: number }) {
  return (
    <article className="post-row group">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="post-row-top">
          <div className="post-row-title">
            {typeof index === 'number' && (
              <span className="post-row-index">{String(index).padStart(2, '0')}</span>
            )}
            <h3 className="post-row-heading">{post.title}</h3>
          </div>
          <time className="post-row-date">{post.date}</time>
        </div>
        <p className="post-row-summary">{post.summary}</p>
        <div className="post-row-meta">
          <span>{post.readingMinutes} 分钟阅读</span>
          {post.tags.length > 0 && <span className="post-row-sep" />}
          <span className="post-row-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="post-row-tag">
                {tag}
              </span>
            ))}
          </span>
          <span className="post-row-arrow" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </Link>
    </article>
  )
}
