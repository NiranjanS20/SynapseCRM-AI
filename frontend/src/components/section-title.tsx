export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p> : null}
    </div>
  );
}
