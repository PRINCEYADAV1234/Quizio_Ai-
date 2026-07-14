import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Upload, ArrowRight, Play, FileText, Brain, HelpCircle, BookOpen, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const steps = [
    { title: 'Upload PDF', desc: 'Drag-and-drop notes or books', icon: FileText },
    { title: 'AI Reads Document', desc: 'Gemini models extract contexts', icon: Brain },
    { title: 'Generate Quiz', desc: 'Formulate active recalls', icon: HelpCircle },
    { title: 'Take Quiz', desc: 'Interactive practice mode', icon: BookOpen },
    { title: 'Track Progress', desc: 'Observe recall curves', icon: BarChart3 },
  ]

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center max-w-7xl mx-auto px-6 sm:px-8 py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-20 opacity-30" />
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent opacity-50 pointer-events-none -z-10" />

      <div className="relative z-10 space-y-6 max-w-4xl mx-auto flex flex-col items-center">
        {/* Animated chip badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-[#0c0c0e]/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Powered by Gemini 3.5 Flash
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-[1.05] text-zinc-950 dark:text-zinc-50 max-w-3xl">
          Turn any PDF into quizzes that <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500 bg-clip-text text-transparent italic">actually</span> help you learn.
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-semibold">
          Upload notes, books and study materials to instantly generate quizzes, flashcards and summaries.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/signup">
            <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6 py-5.5 rounded-xl shadow-lg flex items-center gap-2 text-xs uppercase tracking-wider">
              <Upload className="w-4.5 h-4.5" /> Upload PDF
            </Button>
          </Link>
          <a href="#demo">
            <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 font-bold px-6 py-5.5 rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider">
              <Play className="w-3.5 h-3.5" /> Try Demo
            </Button>
          </a>
        </div>

        {/* Animated workflow timeline below CTA */}
        <div className="w-full mt-16 pt-8 border-t border-zinc-200/50 dark:border-zinc-850/50">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Interactive Study Workflow</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={idx} className="relative flex flex-col items-center">
                  {/* Floating Glassmorphism card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="w-full p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-[#0c0c0e]/70 backdrop-blur-md shadow-sm hover:border-amber-500/30 transition flex flex-col items-center text-center space-y-2 relative z-10"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-250 block">{step.title}</span>
                    <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-semibold">{step.desc}</span>
                  </motion.div>

                  {/* Connected line for desktop */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 left-[calc(50%+45px)] w-[calc(100%-90px)] h-0.5 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 z-0 transform -translate-y-1/2" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
