import { copy } from '@/lib/copy'
import { DiagnosticForm } from '@/components/DiagnosticForm'

const t = copy.en

// O template tem 8 passos numerados; o processo real da Severius tem 4 (Mapear, Desenhar,
// Construir, Evoluir). Mantemos a grade numerada grande do template, sem inventar 4 passos
// a mais só para preencher espaço.
export default function ProcessPage() {
  return <>
    <section className="nh-page-hero"><h1>{t.process.title}</h1><p>{t.process.note}</p></section>

    <section className="nh-process-grid">
      {t.process.steps.map(([title, body, output], index) => (
        <article key={title} className="nh-process-step">
          <span className="nh-step-number">{String(index + 1).padStart(2, '0')}</span>
          <h3>{title}</h3><p>{body}</p><p className="nh-step-output"><strong>{t.process.output}:</strong> {output}</p>
        </article>
      ))}
    </section>

    <section className="nh-contact-wrap">
      <h2>{t.form.title}</h2><p className="nh-lead">{t.form.body}</p>
      <div className="nh-form-shell"><DiagnosticForm locale="en" text={t}/></div>
    </section>
  </>
}
