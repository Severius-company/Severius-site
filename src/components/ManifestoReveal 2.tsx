'use client'

import type { CSSProperties } from 'react'
import { Container } from '@/components/Container'
import { ScrollProgress, type ScrollPhase } from '@/components/ScrollProgress'
import type { ExperienceCopy } from '@/content/homeExperience'

type WordStyle = CSSProperties & { '--manifesto-word-index': number; '--manifesto-word-count': number }
const PHASES: ScrollPhase[] = [{ name: '--manifesto-details', from: 0.52, to: 0.82 }]

export function ManifestoReveal({ copy }: { copy: ExperienceCopy['manifesto'] }) {
  const words = copy.title.split(' ')
  return (
    <section id="manifesto-flow" className="flow-manifesto" aria-labelledby="manifesto-title">
      <ScrollProgress targetId="manifesto-flow" variable="--manifesto-progress" phases={PHASES} stickyTop={64} />
      <Container className="flow-manifesto-sticky">
        <p className="flow-eyebrow">{copy.eyebrow}</p>
        <h2 id="manifesto-title">
          <span className="sr-only">{copy.title}</span>
          <span aria-hidden="true" className="manifesto-words">
            {words.map((word, index) => (
              <span key={`${word}-${index}`} style={{ '--manifesto-word-index': index, '--manifesto-word-count': words.length } as WordStyle}>{word}&nbsp;</span>
            ))}
          </span>
        </h2>
        <div className="flow-manifesto-foot"><p>{copy.body}</p><ul>{copy.notes.map(note => <li key={note}>{note}</li>)}</ul></div>
      </Container>
    </section>
  )
}
