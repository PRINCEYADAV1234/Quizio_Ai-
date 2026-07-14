'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Zap, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface StreamingQuestion {
  id: string
  question: string
  options: string[]
  confidence: number
  tokensUsed: number
  timeToGenerate: number
}

interface GenerationMetrics {
  totalTokens: number
  questionsGenerated: number
  averageConfidence: number
  elapsedTime: number
  estimatedTimeRemaining: number
}

export function StreamingQuizGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState<StreamingQuestion[]>([])
  const [metrics, setMetrics] = useState<GenerationMetrics>({
    totalTokens: 0,
    questionsGenerated: 0,
    averageConfidence: 0,
    elapsedTime: 0,
    estimatedTimeRemaining: 0,
  })
  const metricsRef = useRef(metrics)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Simulate streaming quiz generation
  const startGeneration = async () => {
    setIsGenerating(true)
    setQuestions([])
    setMetrics({
      totalTokens: 0,
      questionsGenerated: 0,
      averageConfidence: 0,
      elapsedTime: 0,
      estimatedTimeRemaining: 45,
    })

    abortControllerRef.current = new AbortController()
    const startTime = Date.now()
    let totalTokens = 0
    let totalConfidence = 0

    // Simulate 10 questions being generated with streaming
    for (let i = 0; i < 10; i++) {
      if (abortControllerRef.current.signal.aborted) break

      // Simulate variable generation time per question
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

      const tokensForQuestion = 120 + Math.random() * 180
      const confidence = 0.75 + Math.random() * 0.22
      const timeToGenerate = 800 + Math.random() * 1200

      totalTokens += tokensForQuestion
      totalConfidence += confidence

      const newQuestion: StreamingQuestion = {
        id: `q-${i}`,
        question: `Advanced Question ${i + 1}: [Streaming Generated...]`,
        options: [
          `Option A - Generated with ${Math.round(confidence * 100)}% confidence`,
          `Option B - Alternative interpretation`,
          `Option C - Edge case consideration`,
          `Option D - Complex scenario`,
        ],
        confidence: confidence,
        tokensUsed: tokensForQuestion,
        timeToGenerate: timeToGenerate,
      }

      setQuestions((prev) => [...prev, newQuestion])

      const elapsedSeconds = (Date.now() - startTime) / 1000
      const questionsPerSecond = (i + 1) / (elapsedSeconds || 1)
      const remainingQuestions = 10 - (i + 1)
      const estimatedRemaining = remainingQuestions / (questionsPerSecond || 1)

      setMetrics({
        totalTokens: totalTokens,
        questionsGenerated: i + 1,
        averageConfidence: totalConfidence / (i + 1),
        elapsedTime: elapsedSeconds,
        estimatedTimeRemaining: estimatedRemaining,
      })
    }

    setIsGenerating(false)
  }

  const cancelGeneration = () => {
    abortControllerRef.current?.abort()
    setIsGenerating(false)
  }

  return (
    <div className="w-full space-y-8">
      {/* Real-time Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: 'Questions',
            value: metrics.questionsGenerated,
            unit: '/10',
            icon: '📝',
          },
          {
            label: 'Tokens Used',
            value: Math.round(metrics.totalTokens),
            unit: '',
            icon: '⚡',
          },
          {
            label: 'Avg Confidence',
            value: Math.round(metrics.averageConfidence * 100),
            unit: '%',
            icon: '🎯',
          },
          {
            label: 'Time Elapsed',
            value: Math.round(metrics.elapsedTime),
            unit: 's',
            icon: '⏱️',
          },
          {
            label: 'ETA',
            value: Math.round(metrics.estimatedTimeRemaining),
            unit: 's',
            icon: '⏳',
          },
        ].map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40"
          >
            <div className="text-2xl mb-2">{metric.icon}</div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
              {metric.label}
            </div>
            <div className="text-2xl font-extrabold text-zinc-50 mt-1">
              {metric.value}
              <span className="text-sm text-zinc-400 ml-1">{metric.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Generation Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-zinc-50">Generation Progress</h3>
          <span className="text-sm text-zinc-400">
            {metrics.questionsGenerated} of 10 questions
          </span>
        </div>

        {/* Progress Bar with Animation */}
        <div className="relative h-3 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-800/60">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${(metrics.questionsGenerated / 10) * 100}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          />
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-pulse" />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={startGeneration}
            disabled={isGenerating}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 font-semibold disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Start Generation
              </>
            )}
          </Button>
          {isGenerating && (
            <Button
              onClick={cancelGeneration}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800/50"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Streaming Questions Display */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-lg text-zinc-50">Generated Questions</h3>

        <AnimatePresence mode="popLayout">
          {questions.length === 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 rounded-xl border-2 border-dashed border-zinc-800/60 text-center text-zinc-400"
            >
              <Zap className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>Click "Start Generation" to begin AI quiz generation</p>
            </motion.div>
          )}

          {questions.map((question, idx) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="p-5 rounded-xl border border-zinc-800/60 bg-gradient-to-r from-zinc-900/50 to-zinc-900/30 hover:border-indigo-500/30 transition"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Generated in {Math.round(question.timeToGenerate)}ms
                    </span>
                  </div>
                  <p className="font-semibold text-zinc-50 line-clamp-2">
                    {question.question}
                  </p>
                </div>

                {/* Confidence Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-end gap-1 ml-4"
                >
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg
                      className="absolute inset-0 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-zinc-800/60"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 45 * (1 - question.confidence)
                        }`}
                        className="text-emerald-500"
                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                        animate={{
                          strokeDashoffset: 2 * Math.PI * 45 * (1 - question.confidence),
                        }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </svg>
                    <span className="text-xs font-bold text-zinc-100">
                      {Math.round(question.confidence * 100)}%
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">Confidence</span>
                </motion.div>
              </div>

              {/* Question Stats */}
              <div className="flex gap-3 mb-4 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/30 border border-zinc-800/60">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-zinc-400">
                    {Math.round(question.tokensUsed)} tokens
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/30 border border-zinc-800/60">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-zinc-400">High Quality</span>
                </div>
              </div>

              {/* Options Preview */}
              <div className="space-y-2">
                {question.options.map((option, optIdx) => (
                  <div
                    key={optIdx}
                    className="p-3 rounded-lg bg-zinc-800/20 border border-zinc-800/40 text-sm text-zinc-300 hover:border-zinc-700/60 transition"
                  >
                    <span className="font-medium text-indigo-400">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>{' '}
                    {option}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
