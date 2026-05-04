import { Check, X, AlertCircle } from 'lucide-react';

export default function GuideCheck({ evaluation, guideId }) {
  const { guide, surgeryReq, criteria, metCount, indicated } = evaluation;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
            Criterios de indicación · {guide.name}
          </div>
          <h2 className="mt-1 text-base font-bold text-rsInk">
            {guide.label}
          </h2>
        </div>
      </div>

      {/* Banderín indicación */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-rsCanvas px-4 py-3">
        <div>
          <div className="text-sm font-bold text-rsInk">
            {metCount} de 5 criterios cumplidos
            {guideId === 'POLINA' && (
              <span className="ml-2 text-xs font-normal text-rsMuted">
                (T2 obligatorio en POLINA)
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-rsMuted">
            {surgeryReq.met ? '✓' : '✗'} {surgeryReq.label}
          </div>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            indicated
              ? 'bg-emerald-500 text-white'
              : metCount >= 2 && surgeryReq.met
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {indicated ? 'CUMPLE INDICACIÓN' : metCount >= 2 ? 'CASI' : 'NO INDICADO'}
        </div>
      </div>

      {/* Requisito previo de cirugía */}
      <div
        className={`mt-3 flex items-start gap-2.5 rounded-lg border px-3 py-2 ${
          surgeryReq.met ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'
        }`}
      >
        <div
          className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${
            surgeryReq.met ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {surgeryReq.met ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-rsInk">{surgeryReq.label}</div>
          <div className="text-xs text-rsMuted">{surgeryReq.detail}</div>
        </div>
      </div>

      {/* 5 criterios */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {criteria.map((c) => (
          <div
            key={c.id}
            className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${
              c.met
                ? 'border-emerald-200 bg-emerald-50/50'
                : c.mandatory
                ? 'border-rose-200 bg-rose-50/40'
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
              <div className={`flex items-center gap-2 text-sm font-medium ${c.met ? 'text-rsInk' : 'text-rsMuted'}`}>
                {c.label}
                {c.mandatory && (
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                    obligatorio
                  </span>
                )}
              </div>
              <div className="text-xs text-rsMuted">{c.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-rsMuted">
        {guideId === 'POLINA'
          ? 'POLINA exige inflamación T2 confirmada + 2 cirugías endoscópicas adecuadas previas + ≥3 criterios. SNOT-22 ≥50 como umbral de gravedad.'
          : 'EUFOREA/EPOS 2023: ≥3 criterios + cirugía adecuada previa o contraindicación. SNOT-22 ≥40 como umbral.'}
      </div>
    </div>
  );
}
