'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Download, Trash2, Plus } from 'lucide-react'

interface Concept {
  id: string
  x: number
  y: number
  label: string
  color: string
}

interface Connection {
  from: string
  to: string
}

export function CanvasConceptMapper() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startNode, setStartNode] = useState<string | null>(null)

  const colors = [
    '#818cf8',
    '#a78bfa',
    '#c084fc',
    '#d946ef',
    '#ec4899',
    '#10b981',
    '#14b8a6',
  ]

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#030303'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#27272a'
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Draw connections
    ctx.strokeStyle = '#818cf8'
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.5
    connections.forEach((conn) => {
      const fromConcept = concepts.find((c) => c.id === conn.from)
      const toConcept = concepts.find((c) => c.id === conn.to)
      if (fromConcept && toConcept) {
        ctx.beginPath()
        ctx.moveTo(fromConcept.x, fromConcept.y)
        ctx.lineTo(toConcept.x, toConcept.y)
        ctx.stroke()
      }
    })
    ctx.globalAlpha = 1

    // Draw concepts
    concepts.forEach((concept) => {
      const isSelected = selectedConcept === concept.id
      const radius = isSelected ? 35 : 30

      // Glow effect
      if (isSelected) {
        ctx.shadowColor = concept.color
        ctx.shadowBlur = 20
      }

      ctx.fillStyle = concept.color
      ctx.globalAlpha = isSelected ? 1 : 0.8
      ctx.beginPath()
      ctx.arc(concept.x, concept.y, radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0

      // Border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(concept.x, concept.y, radius, 0, Math.PI * 2)
      ctx.stroke()

      // Label
      ctx.fillStyle = '#030303'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(concept.label, concept.x, concept.y)
    })
  }, [concepts, connections, selectedConcept])

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if clicked on a concept
      const clickedConcept = concepts.find((c) => {
        const distance = Math.sqrt((c.x - x) ** 2 + (c.y - y) ** 2)
        return distance < 30
      })

      if (clickedConcept) {
        if (startNode && startNode !== clickedConcept.id) {
          // Create connection
          setConnections([...connections, { from: startNode, to: clickedConcept.id }])
          setStartNode(null)
          setSelectedConcept(null)
        } else {
          setSelectedConcept(clickedConcept.id)
          setStartNode(clickedConcept.id)
        }
      } else if (!isDrawing) {
        // Create new concept
        setConcepts([
          ...concepts,
          {
            id: `concept-${Date.now()}`,
            x,
            y,
            label: `Concept ${concepts.length + 1}`,
            color: colors[concepts.length % colors.length],
          },
        ])
        setStartNode(null)
        setSelectedConcept(null)
      }
    },
    [concepts, startNode, isDrawing, colors]
  )

  const addConcept = () => {
    setConcepts([
      ...concepts,
      {
        id: `concept-${Date.now()}`,
        x: 100 + Math.random() * (canvasRef.current?.width || 400 - 200),
        y: 100 + Math.random() * (canvasRef.current?.height || 300 - 200),
        label: `Concept ${concepts.length + 1}`,
        color: colors[concepts.length % colors.length],
      },
    ])
  }

  const clearCanvas = () => {
    setConcepts([])
    setConnections([])
    setSelectedConcept(null)
    setStartNode(null)
  }

  const downloadMap = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = 'concept-map.png'
      link.click()
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-extrabold text-zinc-50">Concept Mapper</h2>
        <p className="text-sm text-zinc-400">
          Click canvas to add concepts, click two concepts to connect them
        </p>
      </div>

      {/* Canvas */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={addConcept}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Concept
        </Button>
        <Button
          onClick={downloadMap}
          disabled={concepts.length === 0}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800/50"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Map
        </Button>
        <Button
          onClick={clearCanvas}
          disabled={concepts.length === 0}
          variant="outline"
          className="border-red-700/50 text-red-400 hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-4 p-4 rounded-lg border border-zinc-800/60 bg-zinc-900/30"
      >
        <div>
          <div className="text-xs text-zinc-500 font-medium uppercase">Concepts</div>
          <div className="text-2xl font-extrabold text-zinc-50 mt-1">{concepts.length}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 font-medium uppercase">Connections</div>
          <div className="text-2xl font-extrabold text-zinc-50 mt-1">{connections.length}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 font-medium uppercase">Density</div>
          <div className="text-2xl font-extrabold text-zinc-50 mt-1">
            {concepts.length > 0 ? Math.round((connections.length / (concepts.length - 1)) * 100) : 0}%
          </div>
        </div>
      </motion.div>
    </div>
  )
}
