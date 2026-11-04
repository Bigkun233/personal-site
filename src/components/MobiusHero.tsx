// src/components/MobiusHero.tsx — 首页主视觉：全幅莫比乌斯环背景
import { useEffect, useRef, useState } from 'react'
import { createMobius } from '../lib/mobiusGl'

export type HeroVeil = 'split' | 'center' | 'band'

export interface MobiusHeroProps {
  /** 环的水平位置（世界单位，正数向右） */
  offsetX?: number
  /** 环的垂直位置 */
  offsetY?: number
  /** 环在画面中的高度占比 */
  heightRatio?: number
  /** 半带宽 */
  width?: number
  /** 自转速度 */
  speed?: number
  /** 遮罩布局：左文右图 / 居中 / 横向长带 */
  veil?: HeroVeil
  /** 是否跟随指针做轻微视差 */
  parallax?: boolean
}

export function MobiusHero({
  offsetX,
  offsetY,
  heightRatio,
  width = 0.52,
  speed = 0.15,
  veil = 'split',
  parallax = true,
}: MobiusHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const wide = window.innerWidth >= 900

    const instance = createMobius(canvas, {
      twist: 1,
      width,
      offsetX: offsetX ?? (wide ? 1.65 : 0),
      offsetY: offsetY ?? (wide ? 0.05 : 0),
      heightRatio: heightRatio ?? (wide ? 0.98 : 0.86),
      speed,
    })

    if (!instance) {
      setFailed(true)
      return
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let raf = 0
    let visible = true
    let running = true

    const onPointer = (event: PointerEvent) => {
      if (reduceMotion || !parallax) return
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = (event.clientY / window.innerHeight) * 2 - 1
      instance.setPointer(x, y)
    }

    const loop = (now: number) => {
      if (!running) return
      instance.render(now)
      raf = requestAnimationFrame(loop)
    }

    // 首帧先画出来再淡入，避免闪白
    instance.render(0)
    setReady(true)

    if (!reduceMotion) {
      raf = requestAnimationFrame(loop)
      window.addEventListener('pointermove', onPointer, { passive: true })
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting
        if (next === visible) return
        visible = next
        if (reduceMotion) return

        if (visible) {
          running = true
          raf = requestAnimationFrame(loop)
        } else {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { threshold: 0.01 },
    )
    observer.observe(canvas)

    const onVisibility = () => {
      if (reduceMotion) return
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (visible) {
        running = true
        raf = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const resizeObserver = new ResizeObserver(() => {
      instance.resize()
      instance.render(performance.now())
    })
    resizeObserver.observe(canvas)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
      instance.dispose()
    }
    // 首帧参数固定，尺寸变化由 ResizeObserver 处理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="hero-canvas pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-opacity duration-1000 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {veil === 'split' && (
        <>
          <div className="hero-veil hero-veil-split absolute inset-0" />
          <div className="hero-veil-bottom absolute inset-x-0 bottom-0 h-1/2" />
        </>
      )}

      {veil === 'center' && (
        <>
          <div className="hero-veil hero-veil-center absolute inset-0" />
          <div className="hero-veil-bottom absolute inset-x-0 bottom-0 h-1/2" />
        </>
      )}

      {veil === 'band' && (
        <>
          <div className="hero-veil hero-veil-band absolute inset-0" />
          <div className="hero-veil-bottom absolute inset-x-0 bottom-0 h-1/2" />
        </>
      )}

      {failed && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,#0d2b28_0%,#07100f_62%)]" />
      )}
    </div>
  )
}
