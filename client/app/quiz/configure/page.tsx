import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  Sparkles,
  Settings,
  BookOpen,
  Flame,
  Timer,
  FileText,
  Dot,
} from 'lucide-react'

export default function QuizConfigPage() {
  const [quizType, setQuizType] = useState('mixed')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(20)
  const [expandedSettings, setExpandedSettings] = useState(false)
  const [enableTimer, setEnableTimer] = useState(true)
  const [negativeMarking, setNegativeMarking] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f4f5f6] dark:bg-[#050507] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Sidebar userInitial="J" userName="John Doe" />

      {/* Main Workspace Container */}
      <div className="flex-1 ml-60 flex flex-col min-w-0">
        {/* Top Header Panel */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0c0c0e]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/60">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-lg font-extrabold tracking-[-0.03em] text-zinc-900 dark:text-zinc-50">Quiz Config</h1>
          </div>
        </header>

        {/* Workspace Wrap */}
        <main className="max-w-7xl w-full mx-auto px-8 py-8 space-y-8 flex-1">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left: Document Info (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-xl border border-zinc-200/85 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] p-6 shadow-sm space-y-6">
                <div className="space-y-4">
                  <div className="w-full h-28 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg border border-zinc-200 dark:border-zinc-850 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">Advanced Biology Notes.pdf</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mt-1">145 Pages • Added Jan 2024</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-850 pt-6">
                  <h4 className="font-bold text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-550">Retrieved Outline</h4>
                  <ul className="space-y-1.5 text-xs font-semibold text-zinc-650 dark:text-zinc-400">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>Mitochondria structures and functions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>Respiration cycles & glycolysis pathways</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: Flat Code Parameter Config Grid (Col 8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Type Selectors - Flat Borderless Card Matrices */}
              <div className="rounded-xl border border-zinc-200/85 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2 tracking-tight">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  Recall Parameter Formats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'mcq', label: 'Multiple Choice', desc: 'Standard choice layouts', icon: '📋' },
                    { value: 'truefalse', label: 'True / False', desc: 'Concept accuracy checks', icon: '✓' },
                    { value: 'fill', label: 'Cloze Deletion', desc: 'Fill-in-the-blank logs', icon: '✍️' },
                    { value: 'mixed', label: 'Mixed Simulation', desc: 'Randomized formats', icon: '🎲' },
                  ].map((type) => {
                    const isSelected = quizType === type.value
                    return (
                      <button
                        key={type.value}
                        onClick={() => setQuizType(type.value)}
                        className={`p-4 rounded-lg border text-left flex gap-3 relative transition-all duration-200 ${
                          isSelected
                            ? 'bg-zinc-900 text-white dark:bg-[#18181b] border-amber-500'
                            : 'bg-zinc-50/50 dark:bg-zinc-900/20 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/40'
                        }`}
                      >
                        <span className="text-xl">{type.icon}</span>
                        <div>
                          <span className="font-bold text-xs block text-zinc-800 dark:text-zinc-200 tracking-tight">{type.label}</span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">{type.desc}</span>
                        </div>
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Difficulty Level Selectors */}
              <div className="rounded-xl border border-zinc-200/85 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2 tracking-tight">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Cognitive Target Load
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'easy', label: 'Recall basic facts' },
                    { value: 'medium', label: 'Analytical synthesis' },
                    { value: 'hard', label: 'Conceptual mastery' },
                  ].map((level) => {
                    const isSelected = difficulty === level.value
                    return (
                      <button
                        key={level.value}
                        onClick={() => setDifficulty(level.value)}
                        className={`p-4 rounded-lg border text-left relative transition-all duration-200 ${
                          isSelected
                            ? 'bg-zinc-900 text-white dark:bg-[#18181b] border-amber-500'
                            : 'bg-zinc-50/50 dark:bg-zinc-900/20 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/40'
                        }`}
                      >
                        <span className="font-bold text-xs block text-zinc-800 dark:text-zinc-200 capitalize tracking-tight">{level.value}</span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-550 font-semibold block mt-1 leading-tight">{level.label}</span>
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Slider & Numerical Display (No visible background track line) */}
              <div className="rounded-xl border border-zinc-200/85 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 tracking-tight">Quantity parameters</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Selected:</span>
                    <span className="text-xl font-extrabold text-amber-500 tracking-tight">{questionCount} MCQs</span>
                  </div>
                </div>
                
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full h-1.5 appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-800 rounded-full accent-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Advanced Customizations */}
              <div className="rounded-xl border border-zinc-200/85 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpandedSettings(!expandedSettings)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                >
                  <h3 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-50 flex items-center gap-2 tracking-tight">
                    <Settings className="w-4 h-4 text-amber-500" />
                    Recall Customization logs
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                      expandedSettings ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedSettings && (
                  <div className="px-6 py-4 border-t border-zinc-150 dark:border-zinc-850 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <label className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-amber-500" />
                        <span>Enable Session Timer</span>
                      </label>
                      <input
                        type="checkbox"
                        checked={enableTimer}
                        onChange={(e) => setEnableTimer(e.target.checked)}
                        className="w-4 h-4 accent-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <label className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-500" />
                        <span>Evaluate Negative Marks</span>
                      </label>
                      <input
                        type="checkbox"
                        checked={negativeMarking}
                        onChange={(e) => setNegativeMarking(e.target.checked)}
                        className="w-4 h-4 accent-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <Link to="/quiz/attempt" className="block">
                <Button variant="default" className="w-full h-11 justify-center shadow-md font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Compile Recall Parameters
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
