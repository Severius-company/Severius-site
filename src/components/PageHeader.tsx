export function PageHeader({ title, body }: { title: string; body: string }) {
  return (
    <section className="border-b border-line bg-hero">
      <div className="mx-auto flex max-w-[1280px] min-[1800px]:max-w-[1600px] animate-hero-in flex-col items-center gap-[18px] px-[clamp(20px,4vw,48px)] pt-[clamp(56px,8vw,110px)] pb-[clamp(44px,6vw,80px)] text-center">
        <h1 className="m-0 max-w-[20ch] text-[length:clamp(40px,5vw,68px)] leading-[1.06] font-semibold tracking-[-0.01em] text-balance">{title}</h1>
        <p className="m-0 max-w-[60ch] text-lg leading-[1.6] text-hero-muted">{body}</p>
      </div>
    </section>
  )
}
