import type { SiteCopy } from '@/lib/copy'

/**
 * FAQ nativo: `<details>/<summary>` funciona sem JavaScript (teclado, leitor de tela e a
 * rotação do "+" para "×" são só CSS reagindo ao atributo `[open]`). O FaqMotion, ao lado,
 * só adiciona a entrada por rolagem quando o motion não está reduzido.
 */
export function Faq({ text }: { text: SiteCopy }) {
  return <section className="editorial-section faq" id="faq">
    <div className="page-grid split-heading">
      <h2>{text.faq.title}</h2>
      <div>
        <ol className="faq-list">
          {text.faq.items.map(([question, answer]) => (
            <li key={question}>
              <details>
                <summary><span>{question}</span><span className="chevron" aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
}
