"use client"

import { motion, type Variants } from "framer-motion"
import { type ReactNode } from "react"

import { useUserPreferences } from "@/components/preferences/user-preferences-provider"

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

type PageMotionProps = {
  page: string
  children: ReactNode
  className?: string
  /** Stagger list children (cards, rows) */
  stagger?: boolean
}

export function PageMotion({
  page,
  children,
  className,
  stagger = false,
}: PageMotionProps) {
  const { isAnimationEnabled } = useUserPreferences()

  if (!isAnimationEnabled(page)) {
    return <div className={className}>{children}</div>
  }

  if (stagger) {
    return (
      <motion.div
        className={className}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <motion.div key={i} variants={staggerItem}>
                {child}
              </motion.div>
            ))
          : children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

export function MotionCard({
  page,
  children,
  className,
}: {
  page: string
  children: ReactNode
  className?: string
}) {
  const { isAnimationEnabled } = useUserPreferences()
  if (!isAnimationEnabled(page)) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {children}
    </motion.div>
  )
}
