// src/pages/Home.tsx — 全幅主视觉（莫比乌斯环）+ 杂志风正文
import { Link } from 'react-router-dom'
import { site } from '../data/site'
import { projects } from '../data/projects'
import { getPostMetas } from '../lib/posts'
import { PostCard } from '../components/PostCard'
import { ProjectCard } from '../components/ProjectCard'
import { MobiusHero } from '../components/MobiusHero'

export function Home() {
  const posts = getPostMetas()
  const latest = posts.slice(0, 3)
  const featured = projects.slice(0, 2)

  return (
    <div>
      {/* ============ 主视觉：莫比乌斯环 ============ */}
      <section className="hero-shell relative left-1/2 -mt-14 mb-16 flex w-screen -translate-x-1/2 items-center overflow-hidden bg-[#07100f] px-5">
        <MobiusHero />

        <div className="relative z-10 mx-auto w-full max-w-3xl pt-14 pb-16 sm:py-16">
          <div className="max-w-[30rem]">
            <p className="mobius-eyebrow">
              <span className="mobius-dot" />
              {site.location} · 全栈开发
            </p>

            <h1 className="mobius-title">
              你好，我是 {site.name}。
              <br />
              <span className="mobius-title-soft">写代码，也写字。</span>
            </h1>

            <p className="mobius-lede">{site.slogan}</p>

            <div className="mobius-actions">
              <Link to="/projects" className="mobius-btn mobius-btn-solid">
                看看作品
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link to="/about" className="mobius-btn">
                关于我
              </Link>
            </div>

            {/* 一条拓扑学注脚，给主视觉一个由头 */}
            <p className="mobius-note">
              <span className="mobius-note-k">k = 1</span>
              单侧曲面 · 只一条边界 —— 像写代码，绕一圈才发现背面还是自己
            </p>
          </div>
        </div>

        <div className="mobius-scroll" aria-hidden="true">
          <span>SCROLL</span>
          <span className="mobius-scroll-bar" />
        </div>
      </section>

      {/* ============ 正文 ============ */}
      <div className="space-y-20">
        {/* 最新文章（杂志风列表） */}
        <section>
          <div className="mb-4 flex items-baseline justify-between border-b border-line pb-3 dark:border-night-line">
            <h2 className="text-lg text-ink dark:text-night-ink">最新文章</h2>
            <Link to="/blog" className="link-underline text-sm text-ink-soft dark:text-night-soft">
              全部文章
            </Link>
          </div>
          {latest.length === 0 ? (
            <p className="text-ink-faint dark:text-night-soft">还没有文章。</p>
          ) : (
            <div className="divide-y divide-line dark:divide-night-line">
              {latest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* 精选作品（GitHub 风） */}
        <section className="gh-scope">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-fg-muted">精选作品</h2>
            <Link to="/projects" className="gh-link text-xs">
              全部
            </Link>
          </div>
          <div className="gh-box">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* 联系（杂志风） */}
        <section className="border-t border-line pt-10 dark:border-night-line">
          <h2 className="text-lg text-ink dark:text-night-ink">保持联系</h2>
          <p className="mt-3 max-w-xl text-ink-soft dark:text-night-soft">
            项目合作、技术交流，或者只是想打个招呼，都欢迎。
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="link-underline text-ink transition-colors hover:text-brand-600 dark:text-night-ink dark:hover:text-brand-400"
              >
                {s.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
