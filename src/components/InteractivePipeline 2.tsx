'use client'

import { useRef, useState } from 'react'
import type { ExperienceCopy } from '@/content/homeExperience'

type PipelineItem = ExperienceCopy['pipeline']['items'][number]

export function InteractivePipeline({ copy }: { copy: ExperienceCopy['pipeline'] }) {
  const [items, setItems] = useState(copy.items)
  const [dragging, setDragging] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const move = (id: string, direction: -1 | 1) => {
    setItems(current => current.map(item => item.id === id ? { ...item, column: Math.min(2, Math.max(0, item.column + direction)) } : item))
  }

  const dropAt = (id: string, clientX: number) => {
    const board = boardRef.current
    if (!board) return
    const rect = board.getBoundingClientRect()
    const column = Math.min(2, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * 3)))
    setItems(current => current.map(item => item.id === id ? { ...item, column } : item))
  }

  const moveLabel = (item: string, column: string) => copy.moveTo.replace('{item}', item).replace('{column}', column)

  return (
    <section className="flow-section pipeline-section" aria-labelledby="pipeline-title">
      <div className="pipeline-copy">
        <p className="flow-eyebrow">{copy.eyebrow}</p>
        <h2 id="pipeline-title">{copy.title}</h2>
        <p>{copy.body}</p>
        <aside className="pipeline-demo-note"><strong>DEMO</strong>{copy.demo}</aside>
      </div>
      <div className="pipeline-shell">
        <div className="pipeline-toolbar"><span><i />Severius Flow</span><span>{items.length.toString().padStart(2, '0')} items</span></div>
        <p id="pipeline-help" className="sr-only">{copy.instruction}</p>
        <div ref={boardRef} className="pipeline-board" aria-describedby="pipeline-help">
          {copy.columns.map((column, columnIndex) => (
            <section className="pipeline-column" key={column} aria-labelledby={`pipeline-column-${columnIndex}`}>
              <h3 id={`pipeline-column-${columnIndex}`}><span>{column}</span><b>{items.filter(item => item.column === columnIndex).length}</b></h3>
              <div className="pipeline-list">
                {items.filter(item => item.column === columnIndex).map((item: PipelineItem) => (
                  <article
                    className="pipeline-card" key={item.id} data-dragging={dragging === item.id || undefined}
                    draggable
                    onDragStart={() => setDragging(item.id)}
                    onDragEnd={event => { dropAt(item.id, event.clientX); setDragging(null) }}
                  >
                    <span className="pipeline-grip" aria-hidden="true">⠿</span>
                    <div><h4>{item.title}</h4><p>{item.meta}</p></div>
                    <div className="pipeline-card-actions">
                      <button type="button" disabled={columnIndex === 0} onClick={() => move(item.id, -1)} aria-label={moveLabel(item.title, copy.columns[columnIndex - 1] ?? copy.columns[0])}>←</button>
                      <button type="button" disabled={columnIndex === 2} onClick={() => move(item.id, 1)} aria-label={moveLabel(item.title, copy.columns[columnIndex + 1] ?? copy.columns[2])}>→</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
