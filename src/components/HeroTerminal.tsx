// src/components/HeroTerminal.tsx — 主视觉里的「代码窗口」装饰
// 纯 CSS + 打字机，不依赖任何库；用 CSS 变量控制光标位置
import { useEffect, useRef, useState } from 'react'

const LINES = [
  { prompt: true, text: 'cat mobius.glsl' },
  { prompt: false, text: '// u ∈ [0, 2π]   v ∈ [−w, w]' },
  { prompt: false, text: 'float a = twist * u * 0.5;' },
  { prompt: false, text: 'vec3 p = vec3(' },
  { prompt: false, text: '  (R + v*cos(a)) * cos(u),' },
  { prompt: false, text: '   v*sin(a),' },
  { prompt: false, text: '  (R + v*cos(a)) * sin(u));' },
]

export function HeroTerminal() {
  // 减少动效时直接以「全部展开」的状态初始化
  const reduceInit = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const [visibleCount, setVisibleCount] = useState(reduceInit ? LINES.length : 0)
  const [typed, setTyped] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        observer.disconnect()

        let line = 0
        let char = 0
        const full = LINES[0].text

        const step = () => {
          if (line === 0) {
            char += 1
            setTyped(full.slice(0, char))
            if (char < full.length) {
              window.setTimeout(step, 46)
            } else {
              line = 1
              setVisibleCount(1)
              window.setTimeout(step, 220)
            }
            return
          }

          if (line < LINES.length) {
            setVisibleCount(line + 1)
            line += 1
            window.setTimeout(step, 105)
          }
        }

        window.setTimeout(step, 480)
      },
      { threshold: 0.2 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="hero-term" aria-hidden="true">
      <div className="hero-term-bar">
        <span className="hero-term-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="hero-term-name">mobius.glsl</span>
        <span className="hero-term-lang">GLSL</span>
      </div>

      <pre className="hero-term-body">
        <code>
          {LINES.map((line, i) => {
            const isFirst = i === 0
            const text = isFirst ? typed : line.text
            const shown = isFirst ? text.length > 0 : i < visibleCount

            return (
              <span
                key={i}
                className={`hero-term-line ${line.prompt ? 'is-prompt' : ''} ${shown ? 'is-on' : ''}`}
              >
                {line.prompt && <span className="hero-term-prompt">❯</span>}
                <span>{shown ? text : '\u00A0'}</span>
                {isFirst && text.length > 0 && typed.length < line.text.length && (
                  <span className="hero-term-caret" />
                )}
                {isFirst && typed.length === line.text.length && i + 1 === visibleCount && (
                  <span className="hero-term-caret" />
                )}
              </span>
            )
          })}
        </code>
      </pre>
    </div>
  )
}
