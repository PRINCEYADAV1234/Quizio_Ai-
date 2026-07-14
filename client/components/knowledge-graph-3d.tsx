'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

interface Node {
  id: string
  label: string
  mastery: number
  connections: string[]
}

interface Edge {
  from: string
  to: string
  strength: number
}

// Sample knowledge graph data
const graphData = {
  nodes: [
    { id: 'photosynthesis', label: 'Photosynthesis', mastery: 0.42, connections: ['light_reactions', 'calvin_cycle', 'chlorophyll'] },
    { id: 'light_reactions', label: 'Light Reactions', mastery: 0.65, connections: ['photosynthesis', 'atp', 'nadph'] },
    { id: 'calvin_cycle', label: 'Calvin Cycle', mastery: 0.58, connections: ['photosynthesis', 'atp', 'co2_fixation'] },
    { id: 'chlorophyll', label: 'Chlorophyll', mastery: 0.72, connections: ['photosynthesis', 'light_absorption'] },
    { id: 'atp', label: 'ATP Production', mastery: 0.81, connections: ['light_reactions', 'calvin_cycle', 'energy_transfer'] },
    { id: 'nadph', label: 'NADPH', mastery: 0.76, connections: ['light_reactions', 'electron_transport'] },
    { id: 'co2_fixation', label: 'CO2 Fixation', mastery: 0.44, connections: ['calvin_cycle', 'rubisco'] },
    { id: 'light_absorption', label: 'Light Absorption', mastery: 0.68, connections: ['chlorophyll', 'photon_energy'] },
    { id: 'energy_transfer', label: 'Energy Transfer', mastery: 0.54, connections: ['atp', 'electron_transport'] },
    { id: 'electron_transport', label: 'Electron Transport', mastery: 0.62, connections: ['nadph', 'energy_transfer'] },
  ],
}

// 3D Node Component
function Node3D({ node, position }: { node: Node; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002
      meshRef.current.rotation.y += 0.003
      meshRef.current.scale.set(
        hovered ? 1.5 : 1,
        hovered ? 1.5 : 1,
        hovered ? 1.5 : 1
      )
    }
  })

  // Color based on mastery level
  const getMasteryColor = (mastery: number) => {
    if (mastery > 0.7) return '#10b981' // emerald
    if (mastery > 0.5) return '#3b82f6' // blue
    return '#ef4444' // red
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <Sphere args={[0.5 + node.mastery * 0.3, 32, 32]}>
        <meshStandardMaterial
          color={getMasteryColor(node.mastery)}
          emissive={getMasteryColor(node.mastery)}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          wireframe={false}
        />
      </Sphere>
    </mesh>
  )
}

// 3D Line/Edge Component
function Edge3D({
  from,
  to,
  strength,
  nodePositions,
}: {
  from: string
  to: string
  strength: number
  nodePositions: Map<string, [number, number, number]>
}) {
  const lineRef = useRef<THREE.Line>(null)

  const fromPos = nodePositions.get(from)
  const toPos = nodePositions.get(to)

  if (!fromPos || !toPos) return null

  useEffect(() => {
    if (lineRef.current) {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array([...fromPos, ...toPos]), 3)
      )
      lineRef.current.geometry = geometry
    }
  }, [fromPos, toPos])

  return (
    <line ref={lineRef as any}>
      <bufferGeometry />
      <lineBasicMaterial
        color={new THREE.Color().setHSL(0.6, 0.5, 0.5 + strength * 0.3)}
        linewidth={strength * 3}
        opacity={0.3 + strength * 0.4}
        transparent
      />
    </line>
  )
}

// Main 3D Canvas
function KnowledgeGraphCanvas() {
  const [nodePositions] = useState<Map<string, [number, number, number]>>(() => {
    const map = new Map()
    graphData.nodes.forEach((node, idx) => {
      const angle = (idx / graphData.nodes.length) * Math.PI * 2
      const radius = 5
      const height = (Math.random() - 0.5) * 4
      map.set(node.id, [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      ])
    })
    return map
  })

  return (
    <Canvas camera={{ position: [0, 0, 15] }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Draw edges */}
      {graphData.nodes.map((node) =>
        node.connections.map((connId) => (
          <Edge3D
            key={`${node.id}-${connId}`}
            from={node.id}
            to={connId}
            strength={0.5}
            nodePositions={nodePositions}
          />
        ))
      )}

      {/* Draw nodes */}
      {graphData.nodes.map((node) => {
        const pos = nodePositions.get(node.id)
        if (!pos) return null
        return <Node3D key={node.id} node={node} position={pos} />
      })}

      <OrbitControls autoRotate autoRotateSpeed={2} />
    </Canvas>
  )
}

// Legend and Stats
function GraphStats() {
  const stats = [
    {
      label: 'Concepts Mapped',
      value: graphData.nodes.length,
      color: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200',
    },
    {
      label: 'Avg Mastery',
      value: `${Math.round(
        (graphData.nodes.reduce((sum, n) => sum + n.mastery, 0) /
          graphData.nodes.length) *
          100
      )}%`,
      color: 'bg-violet-500/20 border-violet-500/30 text-violet-200',
    },
    {
      label: 'Weak Areas',
      value: graphData.nodes.filter((n) => n.mastery < 0.5).length,
      color: 'bg-red-500/20 border-red-500/30 text-red-200',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-3 rounded-lg border ${stat.color}`}
          >
            <div className="text-xs font-medium opacity-80">{stat.label}</div>
            <div className="text-2xl font-extrabold mt-1">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Mastery Legend */}
      <div className="p-4 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
        <h4 className="text-sm font-semibold text-zinc-100 mb-3">Mastery Levels</h4>
        <div className="space-y-2">
          {[
            { range: '70-100%', color: 'bg-emerald-500', label: 'Mastered' },
            { range: '50-70%', color: 'bg-blue-500', label: 'Learning' },
            { range: '0-50%', color: 'bg-red-500', label: 'Weak Areas' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-xs text-zinc-400">
                {item.label} ({item.range})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Concepts */}
      <div className="p-4 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
        <h4 className="text-sm font-semibold text-zinc-100 mb-3">Top Concepts</h4>
        <div className="space-y-2">
          {graphData.nodes
            .sort((a, b) => b.mastery - a.mastery)
            .slice(0, 5)
            .map((node) => (
              <div key={node.id} className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">{node.label}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 bg-zinc-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ width: `${node.mastery * 100}%` }}
                    />
                  </div>
                  <span className="text-zinc-500 w-8 text-right">
                    {Math.round(node.mastery * 100)}%
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export function KnowledgeGraph3D() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 mb-6">
        <h2 className="text-3xl font-extrabold text-zinc-50">Knowledge Graph</h2>
        <p className="text-zinc-400">Interactive 3D visualization of your learning concepts and relationships</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 3D Canvas */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden h-[500px]">
          <KnowledgeGraphCanvas />
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <GraphStats />
        </div>
      </div>

      {/* Concept Details Table */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
        <div className="p-6 border-b border-zinc-800/40">
          <h3 className="font-extrabold text-lg text-zinc-50">Concept Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-900/50 border-b border-zinc-800/40">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Concept
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Mastery
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Related Topics
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {graphData.nodes.map((node) => (
                <tr key={node.id} className="hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-200">
                    {node.label}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-zinc-800/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{ width: `${node.mastery * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 w-10 text-right">
                        {Math.round(node.mastery * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {node.connections.length} connections
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        node.mastery > 0.7
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                          : node.mastery > 0.5
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                            : 'bg-red-500/20 border-red-500/30 text-red-300'
                      }`}
                    >
                      {node.mastery > 0.7
                        ? 'Strong'
                        : node.mastery > 0.5
                          ? 'Developing'
                          : 'Needs Work'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
