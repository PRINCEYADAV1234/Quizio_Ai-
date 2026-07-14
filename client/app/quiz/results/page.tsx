import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import {
  Download,
  Share2,
  ChevronDown,
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Lightbulb,
  Terminal,
  Layers,
} from 'lucide-react'

interface Question {
  id: number
  question: string
  userAnswer: string
  correctAnswer: string
  explanation: string
  isCorrect: boolean
}

export default function ResultsPage() {
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<'review' | 'flashcards'>('review')
  const [cardFlipped, setCardFlipped] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  const score = 85
  const totalQuestions = 20
  const timeSpent = 28 // minutes
  const correctAnswers = Math.round((score / 100) * totalQuestions)

  const questions: Question[] = [
    {
      id: 1,
      question: 'What is the primary function of mitochondria?',
      userAnswer: 'ATP production through cellular respiration',
      correctAnswer: 'ATP production through cellular respiration',
      explanation:
        'Mitochondria are the powerhouse of the cell, responsible for generating ATP through the process of cellular respiration. This occurs in the cristae of the inner mitochondrial membrane.',
      isCorrect: true,
    },
    {
      id: 2,
      question: 'Photosynthesis occurs in the mitochondria.',
      userAnswer: 'True',
      correctAnswer: 'False',
      explanation:
        'Photosynthesis takes place in chloroplasts, not mitochondria. The chloroplasts contain chlorophyll and other pigments necessary for light-dependent reactions.',
      isCorrect: false,
    },
    {
      id: 3,
      question: 'Which enzyme unwinds DNA during replication?',
      userAnswer: 'DNA Helicase',
      correctAnswer: 'DNA Helicase',
      explanation:
        'DNA Helicase is responsible for breaking hydrogen bonds between complementary base pairs, unwinding the double helix structure to allow replication machinery access.',
      isCorrect: true,
    },
    {
      id: 4,
      question: 'Asexual reproduction produces genetically identical offspring.',
      userAnswer: 'True',
      correctAnswer: 'True',
      explanation:
        'Asexual reproduction involves mitosis and produces offspring that are genetically identical to the parent organism. This is in contrast to sexual reproduction which involves meiosis.',
      isCorrect: true,
    },
  ]

  const flashcards = [
    {
      front: 'What is ATP?',
      back: 'Adenosine Triphosphate - the primary energy currency of the cell. It is produced in mitochondria through cellular respiration.',
    },
    {
      front: 'Define photosynthesis',
      back: 'The process by which plants convert light energy into chemical energy stored in glucose, occurring in chloroplasts.',
    },
    {
      front: 'What is the role of DNA Polymerase?',
      back: 'DNA Polymerase catalyzes the formation of phosphodiester bonds between nucleotides during DNA replication.',
    },
    {
      front: 'Difference between mitosis and meiosis',
      back: 'Meiosis produces 4 non-identical haploid cells, while mitosis generates 2 identical diploid somatic cells.',
    },
  ]

  const toggleReview = (id: number) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedReviews(newExpanded)
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f6] dark:bg-[#050507] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Sidebar userInitial="J" userName="John Doe" />

      {/* Main Content Workspace */}
      <div className="flex-1 ml-60 flex flex-col min-w-0">
        {/* Top Header Panel */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0c0c0e]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/60">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-lg font-extrabold tracking-[-0.03em] text-zinc-900 dark:text-zinc-550">Recall Analysis Report</h1>
          </div>
        </header>

        {/* Workspace Wrap */}
        <main className="max-w-7xl w-full mx-auto px-8 py-8 space-y-8 flex-1">
          {/* Bento Score Metric Summary */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] p-6 shadow-sm grid md:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Mastery Index</span>
              
              {/* Score gauge circle */}
              <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 shadow-inner">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-zinc-200 dark:text-zinc-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                  <circle className="text-amber-500 transition-all duration-1000" strokeWidth="6" strokeDasharray={251} strokeDashoffset={251 - (251 * score) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                </svg>
                <span className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{score}%</span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/50">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">Accuracy</span>
                  <span className="text-base font-extrabold text-zinc-850 dark:text-zinc-200 block mt-1">{correctAnswers} / {totalQuestions}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/50">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">Duration</span>
                  <span className="text-base font-extrabold text-zinc-850 dark:text-zinc-200 block mt-1">{timeSpent} Mins</span>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/50">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">Avg Time</span>
                  <span className="text-base font-extrabold text-zinc-850 dark:text-zinc-200 block mt-1">{Math.round((timeSpent * 60) / totalQuestions)}s</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="font-bold text-xs">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline" className="font-bold text-xs">
                  <Share2 className="w-3.5 h-3.5 mr-1.5" />
                  Share Recall
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-850">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'review'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-zinc-450 hover:text-zinc-900'
              }`}
            >
              Recall Review Analysis
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'flashcards'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-zinc-450 hover:text-zinc-900'
              }`}
            >
              Active Recall Tools
            </button>
          </div>

          {/* Review Tab: RAG Terminal style logs */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleReview(q.id)}
                    className="w-full px-6 py-4.5 flex items-start justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1 text-left">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px] border ${
                          q.isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}
                      >
                        {q.isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">Question {q.id}</p>
                        <p className="font-extrabold text-zinc-850 dark:text-zinc-200 tracking-tight leading-snug">{q.question}</p>
                        <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold pt-1">
                          <div>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Your Response</span>
                            <span className={q.isCorrect ? 'text-emerald-600' : 'text-red-550'}>{q.userAnswer}</span>
                          </div>
                          {!q.isCorrect && (
                            <div>
                              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Correct Concept</span>
                              <span className="text-emerald-650 dark:text-emerald-400">{q.correctAnswer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${
                        expandedReviews.has(q.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedReviews.has(q.id) && (
                    <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-3">
                      <div className="flex items-center gap-1.5 text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                        <Terminal className="w-3.5 h-3.5 text-amber-500" />
                        <span>rag_explanation_logs.sh</span>
                      </div>
                      {/* Terminal code-block syntax style explanation */}
                      <div className="font-mono text-[10px] bg-zinc-50 dark:bg-[#121215]/50 border border-zinc-150 dark:border-zinc-850 p-4 rounded-lg text-zinc-650 dark:text-zinc-400 leading-relaxed space-y-2">
                        <div className="text-zinc-450">$ cat ocr_retrieval_log.txt</div>
                        <p>&quot;{q.explanation}&quot;</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Active Recall Stacked Cards */}
          {activeTab === 'flashcards' && (
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Stacked Deck Visual Canvas (Col 8) */}
              <div className="lg:col-span-8 space-y-6">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 tracking-tight">Active Repetition Stack</h3>
                
                {/* 3D Stacked Deck Visual Effect */}
                <div className="relative h-64 w-full flex items-center justify-center">
                  
                  {/* Underlapping Background Card 2 (Bottom Stack) */}
                  <div className="absolute w-[92%] h-56 bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-850 translate-y-6 scale-[0.92] -z-10 shadow-sm opacity-50" />
                  
                  {/* Underlapping Background Card 1 (Middle Stack) */}
                  <div className="absolute w-[96%] h-56 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-850 translate-y-3 scale-[0.96] -z-5 shadow-sm opacity-80" />
                  
                  {/* Active Foreground Card */}
                  <div
                    onClick={() => setCardFlipped(!cardFlipped)}
                    className="absolute w-full h-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-md p-10 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.01] z-10"
                  >
                    <div className="text-center space-y-4">
                      {!cardFlipped ? (
                        <>
                          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block">Recall Query</span>
                          <p className="text-xl font-extrabold tracking-tight text-zinc-850 dark:text-zinc-50">
                            {flashcards[currentCardIndex].front}
                          </p>
                          <span className="text-[9px] font-semibold text-zinc-400 block mt-8">Click card to reveal answer</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-sans">Active Answer</span>
                          <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-350 leading-relaxed max-w-sm mx-auto">
                            {flashcards[currentCardIndex].back}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">Card {currentCardIndex + 1} of {flashcards.length}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                        setCardFlipped(false)
                      }}
                      disabled={currentCardIndex === 0}
                      className="font-bold text-xs"
                    >
                      Prev Card
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1))
                        setCardFlipped(false)
                      }}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="font-bold text-xs"
                    >
                      Next Card
                    </Button>
                  </div>
                </div>
              </div>

              {/* Revision Side Panel (Col 4) */}
              <div className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] p-6 shadow-sm space-y-6 h-fit">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2 tracking-tight">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  Concept Summary
                </h3>
                <div className="space-y-4 text-xs font-semibold text-zinc-650 dark:text-zinc-400">
                  <div>
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Mitochondrial Matrix</h4>
                    <p className="leading-relaxed">
                      Aerobic stages occur in the inner matrix. Generates high-efficiency proton gradients across ATP-synthase complexes.
                    </p>
                  </div>
                  <div className="border-t border-zinc-150 dark:border-zinc-850 pt-4">
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Respiration Equation</h4>
                    <p className="font-mono bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/40 text-center">
                      C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-850 space-y-3">
                  <Link to="/dashboard" className="block">
                    <Button variant="default" className="w-full justify-center shadow-sm">
                      Return to Workspace
                    </Button>
                  </Link>
                  <Link to="/quiz/configure" className="block">
                    <Button variant="outline-glow" className="w-full justify-center">
                      Reconfigure Studio
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
