// src/components/IntroGate.tsx — 进入首页时的开场动画
// 设计：全屏遮罩 → 名字逐字升起 → 介绍淡入 → 进度条走满 → 上下两半幕布撕开露出主视觉
// 细节：
//   · 每个浏览器会话只播一次（sessionStorage），不会每次切路由都重播
//   · prefers-reduced-motion 直接跳过
//   · 点击 / 按键可立即跳过
//   · 播放期间锁滚动，结束后清理，不影响正常浏览
import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'bigkun-intro-v1'

const NAME = 'Bigkun'

const DURATION = 1900
const HOLD = 260
const LEAVE = 860

export function IntroGate() {
  const [active] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return false
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return false
    }
  })
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  const rafRef = useRef(0)
  const holdTimer = useRef<number | undefined>(undefined)
  const goneTimer = useRef<number | undefined>(undefined)

  const finish = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    window.clearTimeout(holdTimer.current)
    setProgress(100)
    setLeaving(true)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* 隐私模式忽略 */
    }
    window.clearTimeout(goneTimer.current)
    goneTimer.current = window.setTimeout(() => setGone(true), LEAVE)
  }, [])

  // 进度条：走满后停顿一下让人读完介绍，再进入退场
  useEffect(() => {
    if (!active || leaving) return

    const start = performance.now()

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      // ease-out：数字前快后慢
      setProgress(Math.round((1 - Math.pow(1 - p, 2.2)) * 100))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        holdTimer.current = window.setTimeout(finish, HOLD)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.clearTimeout(holdTimer.current)
    }
  }, [active, leaving, finish])

  // 播放期间锁滚动
  useEffect(() => {
    if (!active || gone) return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prev
    }
  }, [active, gone])

  // 点击 / 按键跳过
  useEffect(() => {
    if (!active || leaving) return
    const skip = () => finish()
    window.addEventListener('pointerdown', skip, { passive: true })
    window.addEventListener('keydown', skip)
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [active, leaving, finish])

  // 卸载清理
  useEffect(
    () => () => {
      window.clearTimeout(holdTimer.current)
      window.clearTimeout(goneTimer.current)
    },
    [],
  )

  if (!active || gone) return null

  return (
    <div className={`intro ${leaving ? 'is-leaving' : ''}`} role="presentation" aria-hidden="true">
      {/* 幕布：上下两半，退场时向两侧滑开 */}
      <div className="intro-panel intro-panel-top" />
      <div className="intro-panel intro-panel-bottom" />

      {/* 背景装饰 */}
      <div className="intro-grid" />
      <div className="intro-glow" />

      {/* 中央内容 */}
      <div className="intro-content">
        <p className="intro-kicker">
          <span className="intro-kicker-dot" />
          INITIALIZING · PORTFOLIO
        </p>

        <h1 className="intro-name" aria-label={NAME}>
          {NAME.split('').map((ch, i) => (
            <span key={`${ch}-${i}`} className="intro-char" style={{ ['--i' as string]: String(i) }}>
              {ch}
            </span>
          ))}
          <span className="intro-cursor" />
        </h1>

        <p className="intro-role">全栈开发 · 青岛</p>

        <p className="intro-lede">
          写代码，也写字。
          <br />
          记录思考，展示作品，长期主义地写好每一行代码。
        </p>

        <div className="intro-progress">
          <div className="intro-progress-track">
            <div className="intro-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="intro-progress-meta">
            <span>LOADING</span>
            <span className="intro-progress-num">{String(progress).padStart(3, '0')}%</span>
          </div>
        </div>

        <p className="intro-skip">点击任意处跳过</p>
      </div>

      {/* 上下幕布的接缝高光 */}
      <div className="intro-seam" />
    </div>
  )
}
