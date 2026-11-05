// src/pages/Home.tsx — 首页：莫比乌斯环主视觉 + 科技感 HUD + 杂志风正文
import { Link } from 'react-router-dom'
import { site } from '../data/site'
import { projects } from '../data/projects'
import { getAllTags, getPostMetas } from '../lib/posts'
import { PostCard } from '../components/PostCard'
import { ProjectCard } from '../components/ProjectCard'
import { MobiusHero } from '../components/MobiusHero'
import { HeroTelemetry } from '../components/HeroTelemetry'
import { HeroTerminal } from '../components/HeroTerminal'
import { Reveal } from '../components/Reveal'
import { IntroGate } from '../components/IntroGate'

const TICKER = [
  'WEBGL',
  'GLSL',
  'TOPOLOGY',
  'REACT',
  'TYPESCRIPT',
  'VITE',
  'TAILWIND',
  'MÖBIUS',
  'PARAMETRIC SURFACE',
  'SHADER',
]

export function Home() {
  const posts = getPostMetas()
  const latest = posts.slice(0, 3)
  const featured = projects.slice(0, 2)
  const tags = getAllTags()

  const stats = [
    { label: '文章', value: posts.length, unit: '篇' },
    { label: '作品', value: projects.length, unit: '件' },
    { label: '标签', value: tags.length, unit: '个' },
    { label: '半扭转', value: 1, unit: 'k' },
  ]

  return (
    <div>
      {/* 进入首页时的开场动画（每个会话只播一次） */}
      <IntroGate />

      {/* ================= 主视觉 ================= */}
      <section className="hero-shell relative left-1/2 -mt-14 mb-0 flex w-screen -translate-x-1/2 items-center overflow-hidden px-5">
        <MobiusHero />

        <div className="relative z-10 mx-auto w-full max-w-5xl pt-16 pb-20 sm:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            {/* 左：文案 */}
            <div>
              <p className="mobius-eyebrow">
                <span className="mobius-dot" />
                {site.location} · 全栈开发
                <span className="mobius-eyebrow-sep" />
                36.06°N / 120.38°E
              </p>

              <h1 className="mobius-title">
                你好，我是 {site.name}。
                <br />
                <span className="mobius-title-grad">写代码，也写字。</span>
              </h1>

              <p className="mobius-lede">{site.slogan}</p>

              <div className="mobius-actions">
                <Link to="/projects" className="mobius-btn mobius-btn-solid">
                  看看作品
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link to="/blog" className="mobius-btn">
                  读文章
                </Link>
                <a
                  href={`https://github.com/${'Bigkun233'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mobius-btn mobius-btn-ghost"
                >
                  GitHub
                </a>
              </div>

              {/* 拓扑学注脚 */}
              <p className="mobius-note">
                <span className="mobius-note-k">k = 1</span>
                单侧曲面 · 只一条边界 —— 像写代码，绕一圈才发现背面还是自己
              </p>
            </div>

            {/* 右：终端卡片 + 遥测 */}
            <div className="hidden lg:block">
              <div className="hero-panel">
                <HeroTerminal />
                <div className="hero-panel-foot">
                  <HeroTelemetry />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mobius-scroll" aria-hidden="true">
          <span>SCROLL</span>
          <span className="mobius-scroll-bar" />
        </div>
      </section>

      {/* ================= 滚动字带（全幅出血） ================= */}
      <div className="ticker relative left-1/2 w-screen -translate-x-1/2" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <div className="ticker-group" key={copy}>
              {TICKER.map((word) => (
                <span className="ticker-item" key={`${copy}-${word}`}>
                  {word}
                  <i />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 深色字带 → 正文的柔和过渡，避免生硬切边 */}
      <div className="hero-bridge relative left-1/2 w-screen -translate-x-1/2" aria-hidden="true" />

      {/* ================= 正文 ================= */}
      <div className="mx-auto max-w-3xl space-y-20 pt-14">
        {/* 数据条 */}
        <Reveal>
          <dl className="stat-strip">
            {stats.map((s) => (
              <div className="stat-cell" key={s.label}>
                <dt>{s.label}</dt>
                <dd>
                  <span className="stat-value">{String(s.value).padStart(2, '0')}</span>
                  <span className="stat-unit">{s.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* 最新文章 */}
        <Reveal as="section">
          <div className="section-head">
            <div>
              <p className="section-kicker">
                <span>01</span> Writing
              </p>
              <h2 className="section-title">最新文章</h2>
            </div>
            <Link to="/blog" className="section-more">
              全部 {posts.length} 篇
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          {latest.length === 0 ? (
            <p className="text-ink-faint dark:text-night-soft">还没有文章。</p>
          ) : (
            <div className="post-list">
              {latest.map((post, i) => (
                <Reveal key={post.slug} delay={i * 70}>
                  <PostCard post={post} index={i + 1} />
                </Reveal>
              ))}
            </div>
          )}
        </Reveal>

        {/* 精选作品 */}
        <Reveal as="section" className="gh-scope">
          <div className="section-head">
            <div>
              <p className="section-kicker">
                <span>02</span> Selected work
              </p>
              <h2 className="section-title">精选作品</h2>
            </div>
            <Link to="/projects" className="section-more">
              全部 {projects.length} 件
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
          <div className="gh-box">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Reveal>

        {/* 联系 */}
        <Reveal as="section">
          <div className="contact-card">
            <p className="section-kicker">
              <span>03</span> Contact
            </p>
            <h2 className="contact-title">有想法？聊聊。</h2>
            <p className="contact-lede">
              项目合作、技术交流，或者只是想打个招呼，都欢迎。
            </p>
            <div className="contact-links">
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-link"
                >
                  {s.label}
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M5 11L11 5M11 5H6M11 5v5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
