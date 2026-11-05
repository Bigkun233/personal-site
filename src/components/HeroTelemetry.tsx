// src/components/HeroTelemetry.tsx — 主视觉右侧的实时遥测读数（HUD）
// 用 ref 直接改 textContent，避免 60fps 触发 React 重渲染
import { useEffect, useRef } from 'react'

interface Field {
  label: string
  /** 返回当前显示值 */
  value: (t: number) => string
}

const FIELDS: Field[] = [
  {
    label: 'TWIST k',
    value: () => '1.000',
  },
  {
    label: 'CHARGE',
    value: () => '半扭转 / 单侧',
  },
  {
    label: 'ROT ω',
    value: (t) => `${(((t * 0.15 * 180) / Math.PI) % 360).toFixed(1)}°`,
  },
  {
    label: 'ELAPSED',
    value: (t) => `${t.toFixed(1)}s`,
  },
  {
    label: 'SIDES',
    value: () => '1 / 1',
  },
]

export function HeroTelemetry() {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = wrapRef.current
    if (!root) return

    const nodes = [...root.querySelectorAll<HTMLElement>('[data-field]')]
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const start = performance.now()

    let raf = 0
    let last = 0

    const tick = (now: number) => {
      // 约 10fps 就够，肉眼读不出来，还能省掉大量文字重排
      if (now - last > 95) {
        last = now
        const t = (now - start) / 1000
        for (const node of nodes) {
          const idx = Number(node.dataset.field)
          const field = FIELDS[idx]
          if (field) node.textContent = field.value(t)
        }
      }
      raf = requestAnimationFrame(tick)
    }

    if (!reduce) raf = requestAnimationFrame(tick)
    else {
      for (const node of nodes) {
        const field = FIELDS[Number(node.dataset.field)]
        if (field) node.textContent = field.value(0)
      }
    }

    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={wrapRef} className="hero-telemetry" aria-hidden="true">
      <div className="hero-telemetry-head">
        <span className="hero-telemetry-dot" />
        LIVE · SURFACE
      </div>

      <dl>
        {FIELDS.map((field, i) => (
          <div key={field.label} className="hero-telemetry-row">
            <dt>{field.label}</dt>
            <dd data-field={i}>—</dd>
          </div>
        ))}
      </dl>

      <div className="hero-telemetry-bar">
        <span />
      </div>
    </div>
  )
}
