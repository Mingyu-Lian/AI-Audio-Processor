// components/AnimatedCollapse.tsx
import React, { useRef, useEffect, useState } from "react"

type Props = {
  isOpen: boolean
  children: React.ReactNode
}

const AnimatedCollapse: React.FC<Props> = ({ isOpen, children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (isOpen) {
      // 展开：先设定实际高度，再设为 auto
      el.style.height = `${el.scrollHeight}px`
      const timeout = setTimeout(() => {
        if (el) el.style.height = "auto"
      }, 300)
      return () => clearTimeout(timeout)
    } else {
      // 收起：从当前高度滑动到 0
      if (el.scrollHeight !== 0) {
        el.style.height = `${el.scrollHeight}px`
        void el.offsetHeight // 强制 reflow
      }
      el.style.height = "0px"
    }
  }, [isOpen])

  return (
    <div
      ref={ref}
      style={{
        overflow: "hidden",
        height: isOpen ? undefined : "0px",
        transition: "height 300ms ease",
      }}
    >
      {children}
    </div>
  )
}

export default AnimatedCollapse
