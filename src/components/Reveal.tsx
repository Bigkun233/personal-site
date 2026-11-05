// src/components/Reveal.tsx — 滚动进入视口时淡入上移
// 用 CSS 滚动驱动动画（animation-timeline: view()）实现：
// 支持的浏览器有动画，不支持的浏览器直接显示内容，永远不会出现「白屏等动画」。
import type { CSSProperties, ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** 延迟毫秒，用于列表错落出现 */
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}

export function Reveal({ children, delay = 0, className = '', as = 'div' }: RevealProps) {
  const Tag = as as 'div'

  const style = delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined

  return (
    <Tag className={`reveal ${className}`} style={style}>
      {children}
    </Tag>
  )
}
