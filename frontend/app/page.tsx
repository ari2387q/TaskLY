"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FloatingNavbar } from "@/components/landing/floating-navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Code2, Target, BarChart3, Clock } from "lucide-react"

export default function LandingPage() {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Force dark theme for the landing page to match Startathon aesthetic
  useEffect(() => {
    setTheme("dark")
    setMounted(true)
  }, [setTheme])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black selection:bg-[#c2f82b] selection:text-black">
      <FloatingNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c2f82b]/5 via-black to-black"></div>
        </div>
        
        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter leading-none mb-6"
          >
            TaskLY<span className="text-[#c2f82b]">.</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="max-w-2xl text-lg md:text-xl text-zinc-400 mb-10 font-medium tracking-wide"
          >
            Build something extraordinary.
            <br className="hidden md:block" />
            Join creators pushing boundaries and building lasting habits.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
          >
            <Link href="/login">
              <Button className="rounded-full bg-[#c2f82b] hover:bg-[#aee61a] text-black font-extrabold uppercase tracking-widest px-8 py-6 text-sm md:text-base flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(194,248,43,0.3)]">
                Start Your Journey <span>↗</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-black relative">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c2f82b]/30 bg-[#c2f82b]/10 text-[#c2f82b] text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-[#c2f82b]"></span> Why Choose Us
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              Tools b<span className="text-[#c2f82b]">a</span>cking your growth
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Streak Tracking", desc: "Build unshakeable momentum with daily visual streaks." },
              { icon: BarChart3, title: "Smart Analytics", desc: "Understand your learning patterns with deep insights." },
              { icon: Code2, title: "Skill Mastery", desc: "Log practices and elevate your core competencies." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-[#c2f82b]/30 transition-all duration-500 flex flex-col"
              >
                <div className="h-12 w-12 rounded-2xl bg-[#c2f82b]/10 text-[#c2f82b] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-zinc-600 text-xs font-semibold">
            © {new Date().getFullYear()} TaskLY. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
