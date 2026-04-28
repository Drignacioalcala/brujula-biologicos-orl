import { Check, X } from 'lucide-react';

export default function EuforeaCheck({ criteria }) {
  const metCount = criteria.filter((c) => c.met).length;
  const indicated = metCount >= 3;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Criterios EPOS / EUFOREA 2023
          </div>
          <div className="mt-1 text-base font-semibold text-ink">
            {metCount} de 5 criterios cumplidos
          </div>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            indicated
              ? 'bg-emerald-100 text-emerald-700'
              : metCount === 2
              ? 'bg-amber-100 text-amber-700'
              : 'bg-rose-100 text-rose-700'
          }`}
        >
          {indicated ? 'Cumple indicación' : metCount === 2 ? 'Casi indicado' : 'No indicado'}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {criteria.map((c) => (
          <div
            key={c.id}
            className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${
              c.met
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div
              className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${
                c.met ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'
              }`}
            >
              {c.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${c.met ? 'text-ink' : 'text-slate-500'}`}>
                {c.label}
              </div>
              <div className="text-[11px] text-slate-500">{c.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[11px] text-slate-500">
        Se requieren al menos 3 criterios además de cirugía previa adecuada (o contraindicación)
        y enfermedad no controlada con tratamiento médico óptimo.
      </div>
    </div>
  );
}
