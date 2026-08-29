"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

export function FloatingNavbar() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user } = useAuth()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious()
    if (latest > 100) {
      setIsScrolled(true)
      if (previous && latest > previous) {
        setHidden(true)
      } else {
        setHidden(false)
      }
    } else {
      setIsScrolled(false)
      setHidden(false)
    }
  })

  return (
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-150%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-4 inset-x-0 mx-auto max-w-fit z-[100] px-6 py-3 flex items-center justify-between gap-8 rounded-full transition-colors duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-md border border-white/10" : "bg-transparent border border-transparent"
      }`}
    >
      <Link href="/" className="text-xl font-black text-white tracking-tight flex items-center gap-1">
        TaskLY<span className="text-[#c2f82b]">.</span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        <Link href="#features" className="text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors">
          Features
        </Link>
        <Link href="#why-us" className="text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors">
          Why Us
        </Link>
        <Link href="#faq" className="text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors">
          FAQ
        </Link>
      </div>

      <div>
        {user ? (
          <Link href="/dashboard">
            <Button className="rounded-full bg-[#c2f82b] hover:bg-[#aee61a] text-black font-bold uppercase tracking-wider text-xs px-6 py-4 flex items-center gap-2">
              Dashboard <span>↗</span>
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button className="rounded-full bg-[#c2f82b] hover:bg-[#aee61a] text-black font-bold uppercase tracking-wider text-xs px-6 py-4 flex items-center gap-2">
              Get Started <span>↗</span>
            </Button>
          </Link>
        )}
      </div>
    </motion.nav>
  )
}
