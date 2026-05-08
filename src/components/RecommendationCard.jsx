import { FileDown, Trophy, ShieldAlert, ArrowRight, ExternalLink, Pill, BadgeCheck, Ban } from 'lucide-react';
import { BIOLOGICS } from '../data/biologics';

export default function RecommendationCard({ decision, onExport }) {
  if (!decision || !decision.eligible) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-soft">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
          <ShieldAlert className="h-3.5 w-3.5" />
          Aún no procede biológico
        </div>
        <h2 className="mt-1 text-base font-bold text-rsInk">
          El paciente no cumple criterios para iniciar biológico en este momento
        </h2>
        <p className="mt-2 text-sm text-rsInk">
          Revisa el primer paso del árbol para ver qué falta. Optimiza tratamiento estándar
          (corticoides intranasales con buena adherencia, lavados, valoración de cirugía
          endoscópica adecuada según guía) antes de plantear de nuevo la indicación de biológico.
        </p>
      </div>
    );
  }

  const primary = BIOLOGICS[decision.primary.id];
  const alternative = decision.alternative ? BIOLOGICS[decision.alternative.id] : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
            Recomendación priorizada
          </div>
          <h2 className="mt-1 flex items-center gap-2 text-base font-bold text-rsInk">
            <Trophy className="h-4 w-4 text-rsBlue" />
            {primary.name}
            <span
              className="ml-1 inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: primary.color }}
              aria-hidden
            />
          </h2>
          <div className="mt-0.5 text-xs text-rsMuted">{primary.target}</div>
        </div>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rsInk hover:bg-slate-50"
        >
          <FileDown className="h-3.5 w-3.5" />
          Exportar PDF
        </button>
      </div>

      {/* Razones activas */}
      <Section title="Por qué este biológico" Icon={BadgeCheck}>
        <ul className="space-y-1.5 text-sm text-rsInk">
          {decision.primary.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-rsBlue" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Alternativa */}
      {alternative && (
        <Section title={`Alternativa válida · ${alternative.name}`} Icon={ArrowRight}>
          <div className="text-sm text-rsInk">
            <div className="mb-1.5 flex items-center gap-2 text-xs text-rsMuted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: alternative.color }} />
              {alternative.target}
            </div>
            <ul className="space-y-1.5">
              {decision.alternative.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-slate-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {/* Evitar / cautela */}
      {decision.avoid.length > 0 && (
        <Section title="Cautela o evitar en este caso" Icon={Ban} accent="rose">
          <ul className="space-y-1.5 text-sm">
            {decision.avoid.map((a) => {
              const b = BIOLOGICS[a.id];
              return (
                <li key={a.id} className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-rose-500" />
                  <span>
                    <span className="font-semibold text-rose-800">{b.name}:</span>{' '}
                    <span className="text-rsInk">{a.reason}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* Ficha AEMPS del primary */}
      <Section title={`Ficha AEMPS · ${primary.brand}`} Icon={Pill}>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Diana">{primary.target}</Field>
          <Field label="Pauta">{primary.dosing}</Field>
          <Field label="Financiación SNS">
            {primary.aemps.financed
              ? `Financiado desde ${prettyDate(primary.aemps.since)}`
              : 'No financiado en CRSwNP'}
          </Field>
          <Field label="Prescripción">
            {primary.aemps.prescriptionType === 'DH' ? 'Diagnóstico hospitalario (DH)' : primary.aemps.prescriptionType}
          </Field>
        </div>
        <div className="mt-3 rounded-lg border border-slate-200 bg-rsCanvas px-3 py-2 text-xs text-rsInk">
          <span className="font-semibold">Condiciones AEMPS: </span>
          {primary.aemps.conditions}
        </div>
        {primary.aemps.cima && (
          <a
            href={primary.aemps.cima}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rsBlueText hover:underline"
          >
            Buscar ficha técnica en CIMA
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </Section>

      <div className="mt-5 text-[11px] text-rsMuted">
        Apoyo a la decisión clínica. No sustituye juicio clínico, indicación oficial ni unidad
        multidisciplinar (UINS). Verifica financiación local, contraindicaciones y restricciones
        AEMPS antes de prescribir. Estado AEMPS revisado a 8-mayo-2026.
      </div>
    </div>
  );
}

function Section({ title, Icon, accent, children }) {
  const ring =
    accent === 'rose'
      ? 'border-rose-200 bg-rose-50/40'
      : 'border-slate-200 bg-white';
  return (
    <div className={`mt-4 rounded-xl border ${ring} p-4`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rsMuted">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-rsMuted">{label}</div>
      <div className="text-rsInk">{children}</div>
    </div>
  );
}

function prettyDate(iso) {
  if (!iso) return '';
  if (iso.length === 4) return iso;
  const [y, m, d] = iso.split('-');
  if (!m) return iso;
  if (!d) return `${m}-${y}`;
  return `${d}-${m}-${y}`;
}
