import { copy } from '@/lib/copy'
import { DiagnosticForm } from '@/components/DiagnosticForm'
import { Faq } from '@/components/Faq'
import { FaqMotion } from '@/components/FaqMotion'

const t = copy.en

// O template mostra e-mail/telefone/endereço e ícones de redes sociais reais da empresa —
// a Severius não tem nenhum desses publicados ainda, então essa faixa fica de fora em vez
// de inventar contato. O FAQ mora aqui (como no template original), reaproveitando o
// componente real já testado.
export default function ContactPage() {
  return <>
    <section className="nh-page-hero"><h1>{t.form.title}</h1><p>{t.form.body}</p></section>

    <section className="nh-contact-wrap">
      <div>
        <h3>{t.form.nextTitle}</h3>
        <ol>{t.form.next.map(item => <li key={item}>{item}</li>)}</ol>
        <p className="nh-note">{t.form.notice}</p>
      </div>
      <div className="nh-form-shell"><DiagnosticForm locale="en" text={t}/></div>
    </section>

    <div className="nh-faq-wrap"><Faq text={t}/><FaqMotion/></div>
  </>
}
