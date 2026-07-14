import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { HeroSection } from '@/components/hero-section'
import { FadeIn, Stagger, StaggerItem } from '@/components/animations'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Zap,
  Brain,
  Award,
  Check,
  Sparkles,
  ArrowRight,
  Users,
  Shield,
  Rocket,
  ArrowDown,
  BookOpen,
  Target,
  Flame,
  Layout,
  Terminal,
} from 'lucide-react'

// Section 2: Stats data
const stats = [
  { value: '10K+', label: 'Active Learners', desc: 'Accelerating active recall daily' },
  { value: '500K+', label: 'Quizzes Synthesized', desc: 'Semantic vectors mapped' },
  { value: '99.9%', label: 'API Uptime SLA', desc: 'Highly reliable infrastructure' },
]

// Section 4: Bento features data
const bentoFeatures = [
  {
    title: 'Advanced Layout OCR',
    desc: 'Intelligent parsing of layout outlines and complex textual grids from technical articles.',
    span: 'md:col-span-2',
    icon: FileText,
    preview: (
      <div className="mt-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-[9px] text-zinc-550 space-y-1">
        <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1 font-bold text-zinc-400">
          <span>extract_pipeline_v2.log</span>
          <span className="text-amber-500">COMPLETED</span>
        </div>
        <p className="truncate">[OCR] Parsed 45 text elements from page 1...</p>
        <p className="truncate">[EMBED] Generated 1,536-dim vector representation...</p>
      </div>
    ),
  },
  {
    title: 'Semantic pgvector',
    desc: 'Database nodes mapped contextually for target parameters.',
    span: 'md:col-span-1',
    icon: Brain,
    preview: (
      <div className="mt-4 flex items-end justify-center gap-1.5 h-16 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-2">
        {[40, 70, 45, 90, 60, 80].map((h, i) => (
          <div key={i} className="w-2 bg-amber-500 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    ),
  },
  {
    title: 'Latency Calibration',
    desc: 'Gemini 3.5 Flash optimizations stream MCQs instantly.',
    span: 'md:col-span-1',
    icon: Zap,
    preview: (
      <div className="mt-4 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-3">
        <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
        <div>
          <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Stream Delay</div>
          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">145ms / chunks</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Spaced Recall intervals',
    desc: 'Statistical calibration checks accuracy logs and alerts when modules require active focus.',
    span: 'md:col-span-2',
    icon: Award,
    preview: (
      <div className="mt-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-zinc-555">Photosynthesis Mastery</span>
          <span className="text-amber-600 dark:text-amber-450">42% (Focus Required)</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 w-[42%]" />
        </div>
      </div>
    ),
  },
]

// Section 5: How It Works Timeline data
const timelineSteps = [
  { step: '01', title: 'Upload study PDFs', desc: 'Drop articles, notes, or full textbooks into the parser.' },
  { step: '02', title: 'AI Extraction', desc: 'Gemini structures core nodes, identifying definitions and formulas.' },
  { step: '03', title: 'Synthesize MCQs', desc: 'Interactive parameter inputs let you control quantity and loads.' },
  { step: '04', title: 'Automated Repetition', desc: 'Review card intervals update dynamically based on response logs.' },
]

// Section 6: Quiz Types data
const quizTypes = [
  { type: 'Multiple Choice (MCQ)', desc: 'Standard choices designed to test context recognition parameters.', icon: '📋' },
  { type: 'True / False validation', desc: 'Rapid checks configured to evaluate base conceptual claims.', icon: '✓' },
  { type: 'Cloze Deletion (Fill)', desc: 'Sentence completions styled to force active concept recall.', icon: '✍️' },
]

// Section 8: Use Cases data
const useCases = [
  { title: 'Med & Law Students', desc: 'Digest thousands of pages of anatomical details and legal outline drafts.', icon: Users },
  { title: 'Developers', desc: 'Memorize API specifications, syntax blocks, and language standards.', icon: Rocket },
  { title: 'Researchers', desc: 'Parse complex scientific structures, variables, and formulas.', icon: Shield },
]

export default function LandingPage() {
  // Section 3: Interactive Demo State
  const [demoState, setDemoState] = useState<'upload' | 'simulate' | 'evaluate'>('upload')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#f4f5f6] dark:bg-[#050507] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Navigation />
      
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Stats Section */}
      <section className="border-y border-zinc-250 dark:border-zinc-850 bg-white/40 dark:bg-[#0c0c0e]/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <StaggerItem key={i} className="text-center md:text-left space-y-2">
                <div className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-amber-600 dark:text-amber-400">
                  {stat.value}
                </div>
                <h4 className="text-sm font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">{stat.label}</h4>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold">{stat.desc}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 3. Interactive Demo Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-zinc-950 dark:text-zinc-50">Active Recall Simulator</h2>
          <p className="text-zinc-500 dark:text-zinc-450 max-w-xl mx-auto text-sm font-semibold">Test the active extraction engine parameters below.</p>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] shadow-lg overflow-hidden">
          {/* Demo tab bar */}
          <div className="flex border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10">
            {['upload', 'simulate', 'evaluate'].map((tab) => (
              <button
                key={tab}
                onClick={() => setDemoState(tab as any)}
                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border-r border-zinc-150 dark:border-zinc-850 last:border-0 transition-all ${
                  demoState === tab
                    ? 'bg-white dark:bg-[#0c0c0e] text-amber-600 dark:text-amber-400 font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {tab} state
              </button>
            ))}
          </div>

          <div className="p-8 min-h-[220px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {demoState === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center space-y-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Upload sample lecture notes</h3>
                    <p className="text-xs text-zinc-400 font-semibold mt-1">Accepts any formatted research documents</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setDemoState('simulate')} className="text-xs font-bold">
                    Inject mock.pdf
                  </Button>
                </motion.div>
              )}

              {demoState === 'simulate' && (
                <motion.div
                  key="simulate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>Parsed Concept Excerpt</span>
                    <span className="text-amber-500 animate-pulse">Calibrating</span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-zinc-650 dark:text-zinc-300">
                    &quot;Photosynthesis converts solar light into chemical parameters. Glycolysis breaks down glucose molecules to generate ATP matrix.&quot;
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setDemoState('evaluate')} className="text-xs font-bold">
                      Synthesize MCQs
                    </Button>
                  </div>
                </motion.div>
              )}

              {demoState === 'evaluate' && (
                <motion.div
                  key="evaluate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 text-left"
                >
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[8px] font-bold uppercase tracking-wider">Generated MCQ</span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 leading-snug">What process breaks down glucose to yield ATP?</h4>
                  <div className="grid gap-2">
                    {['Photosynthesis', 'Glycolysis', 'Krebs Cycle'].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedOption(i)}
                        className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                          selectedOption === i
                            ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-500/5'
                            : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 hover:border-zinc-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. Bento Feature Grid Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-24 border-t border-zinc-200/80 dark:border-zinc-850">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-zinc-950 dark:text-zinc-50">Engine Parameters</h2>
          <p className="text-zinc-550 dark:text-zinc-400 max-w-xl mx-auto text-sm font-semibold">Minimal, layout-aware vector components built for active recall.</p>
        </div>

        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bentoFeatures.map((feat) => {
            const Icon = feat.icon
            return (
              <StaggerItem key={feat.title} className={feat.span}>
                <motion.div
                  whileHover={{ y: -3 }}
                  className="h-full p-8 rounded-2xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] shadow-sm hover:border-amber-500/20 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-850 mb-6">
                      <Icon className="w-4 h-4 text-zinc-850 dark:text-amber-400" />
                    </div>
                    <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">{feat.title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mt-2 leading-relaxed">{feat.desc}</p>
                  </div>
                  {feat.preview}
                </motion.div>
              </StaggerItem>
            )
          })}
        </Stagger>
      </section>

      {/* 5. How It Works Timeline Section */}
      <section id="working" className="max-w-7xl mx-auto px-6 sm:px-8 py-24 border-t border-zinc-200/80 dark:border-zinc-850">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-zinc-950 dark:text-zinc-50">Working</h2>
          <p className="text-zinc-555 dark:text-zinc-400 max-w-xl mx-auto text-sm font-semibold">Active semantic parsing workflow.</p>
        </div>

        <div className="max-w-xl mx-auto relative border-l border-zinc-200 dark:border-zinc-850 pl-6 space-y-12">
          {timelineSteps.map((step, i) => (
            <div key={i} className="relative space-y-2">
              <span className="absolute -left-10 top-0.5 w-6 h-6 rounded-full bg-zinc-900 dark:bg-amber-500 border border-zinc-200 dark:border-zinc-950 flex items-center justify-center text-[10px] font-bold text-white dark:text-zinc-950 shadow-sm">
                {step.step}
              </span>
              <h4 className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">{step.title}</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Quiz Types Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-24 border-t border-zinc-200/80 dark:border-zinc-850">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-zinc-950 dark:text-zinc-50">Recall Modules</h2>
          <p className="text-zinc-555 dark:text-zinc-400 max-w-xl mx-auto text-sm font-semibold">Custom active recall configurations.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {quizTypes.map((q) => (
            <div key={q.type} className="p-6 rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] shadow-sm space-y-4 hover:border-amber-500/20 transition-all duration-200">
              <div className="text-2xl">{q.icon}</div>
              <h4 className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">{q.type}</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">{q.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Analytics Preview Section */}
      <section id="analytics" className="max-w-7xl mx-auto px-6 sm:px-8 py-24 border-t border-zinc-200/80 dark:border-zinc-850">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left copy (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-zinc-900 dark:text-zinc-50">Recall Analytics</h2>
            <p className="text-sm font-semibold leading-relaxed text-zinc-550 dark:text-zinc-400">
              Review accuracy logs over time. Statistical reports isolate weak conceptual nodes, directing study parameters to target gaps.
            </p>
            <div className="pt-2">
              <Link to="/dashboard">
                <Button size="sm" className="font-bold text-xs">
                  Launch Analytics
                </Button>
              </Link>
            </div>
          </div>

          {/* Right graphics dashboard (Col 7) */}
          <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] p-6 shadow-md space-y-6">
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-150 dark:border-zinc-850 pb-2">
              <span>Historical Accuracy Logs</span>
              <span className="text-emerald-500">Online</span>
            </div>
            
            <div className="flex items-end justify-between h-40 pt-4 px-2">
              {[60, 45, 80, 55, 95, 70, 85].map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-amber-500/10 dark:bg-amber-500/5 hover:bg-amber-500/20 border border-transparent hover:border-amber-500/20 rounded-t transition-all flex items-end justify-center" style={{ height: `${val}%` }}>
                    <div className="w-3 bg-amber-500 rounded-t h-2/3 group-hover:h-full transition-all" />
                  </div>
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550">M0{idx+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Use Cases Section */}
      <section id="use-cases" className="max-w-7xl mx-auto px-6 sm:px-8 py-24 border-t border-zinc-200/80 dark:border-zinc-850">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-zinc-950 dark:text-zinc-50">Target Use Cases</h2>
          <p className="text-zinc-555 dark:text-zinc-400 max-w-xl mx-auto text-sm font-semibold">Active recall mapping calibrated across domains.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((uc) => {
            const Icon = uc.icon
            return (
              <div key={uc.title} className="p-6 rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] shadow-sm space-y-4 hover:border-amber-500/20 transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-850">
                  <Icon className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">{uc.title}</h4>
                <p className="text-xs text-zinc-555 dark:text-zinc-400 font-semibold leading-relaxed">{uc.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 9. Final CTA Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
        <div className="rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] shadow-lg">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" />
          <h2 className="text-5xl font-serif font-black tracking-tight mb-6 text-zinc-900 dark:text-zinc-50">
            Optimize your study parameters
          </h2>
          <p className="text-sm font-semibold text-zinc-550 dark:text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Upload notes, parse outline concepts, and test active recall variables. Sign up to begin.
          </p>
          <Link to="/signup">
            <Button variant="default" className="font-bold text-xs uppercase tracking-wider h-11 px-8 shadow-sm">
              Initiate Free Workspace
            </Button>
          </Link>
        </div>
      </section>

      {/* 10. Footer Section */}
      <footer className="border-t border-zinc-200/85 dark:border-zinc-850 bg-zinc-50/50 dark:bg-[#0c0c0e]/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-zinc-900 dark:bg-amber-500 rounded-lg flex items-center justify-center text-white dark:text-zinc-950 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50">Quizio</h3>
              </div>
              <p className="text-zinc-500 dark:text-zinc-500 text-xs font-semibold uppercase tracking-wider">Active recall generation engine</p>
            </div>
            {[
              { title: 'System', links: ['Model Config', 'pgvector Logs', 'SLA SLA'] },
              { title: 'Company', links: ['Outline', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Contact'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-800 dark:text-zinc-350 mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 text-xs font-semibold transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-200/80 dark:border-zinc-850 pt-8 text-center text-zinc-400 dark:text-zinc-550 text-[9px] font-bold uppercase tracking-widest">
            <p>&copy; 2026 Quizio AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
