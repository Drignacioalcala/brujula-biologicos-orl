import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Workflow,
  Target,
  Sparkles,
} from 'lucide-react';
import { BIOLOGICS } from '../data/biologics';

const STEP_ICON = {
  eligibility: Workflow,
  crossIndication: Target,
  phenotype: Sparkles,
  recommendation: CheckCircle2,
};

const STATUS_STYLE = {
  met:       { ring: 'ring-emerald-300', bg: 'bg-emerald-50',  bullet: 'bg-emerald-500',  badge: 'bg-emerald-100 text-emerald-800',  Icon: CheckCircle2 },
  unmet:     { ring: 'ring-rose-300',    bg: 'bg-rose-50',     bullet: 'bg-rose-500',     badge: 'bg-rose-100 text-rose-800',        Icon: XCircle },
  triggered: { ring: 'ring-rsBlue/40',   bg: 'bg-rsBlueSoft',  bullet: 'bg-rsBlue',       badge: 'bg-rsBlue/15 text-rsBlueText',     Icon: CheckCircle2 },
  none:      { ring: 'ring-slate-200',   bg: 'bg-slate-50',    bullet: 'bg-slate-300',    badge: 'bg-slate-100 text-slate-600',       Icon: ChevronRight },
  resolved:  { ring: 'ring-rsBlue/40',   bg: 'bg-rsBlueSoft',  bullet: 'bg-rsBlue',       badge: 'bg-rsBlue/15 text-rsBlueText',     Icon: CheckCircle2 },
  final:     { ring: 'ring-rsBlue/60',   bg: 'bg-white',       bullet: 'bg-rsBlue',       badge: 'bg-rsBlue text-white',              Icon: CheckCircle2 },
};

export default function DecisionTree({ decision }) {
  const [open, setOpen] = useState(() => decision.steps.map(() => true));

  const toggle = (i) => setOpen((arr) => arr.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rsMuted">
        <Workflow className="h-3.5 w-3.5" />
        Árbol de decisión paso a paso
      </div>
      <h2 className="mt-1 text-base font-bold text-rsInk">
        Cómo se llega a la recomendación
      </h2>
      <p className="mt-1 text-xs text-rsMuted">
        Reglas determinísticas ancladas en POLINA 2.0, EPOS/EUFOREA 2023 y los ensayos head-to-head más recientes.
        Sin IA generativa: el camino es trazable y reproducible.
      </p>

      {decision.alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          {decision.alerts.map((a, i) => (
            <Alert key={i} severity={a.severity} text={a.text} />
          ))}
        </div>
      )}

      <ol className="mt-4">
        {decision.steps.map((step, i) => {
          const isLast = i === decision.steps.length - 1;
          const style = STATUS_STYLE[step.status] || STATUS_STYLE.none;
          const StepIconCmp = STEP_ICON[step.id] || ChevronRight;
          const isOpen = open[i];

          return (
            <li key={step.id} className="relative pl-10">
              {/* Línea conectora vertical */}
              {!isLast && (
                <span className="absolute left-[15px] top-7 bottom-0 w-px bg-slate-200" aria-hidden />
              )}

              {/* Bullet circular */}
              <span
                className={`absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full ${style.bullet} text-white shadow-sm`}
                aria-hidden
              >
                <StepIconCmp className="h-4 w-4" />
              </span>

              {/* Tarjeta del paso */}
              <div className={`mb-4 rounded-xl border border-slate-200 ${style.bg} ring-1 ${style.ring} transition`}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
                        Paso {i + 1}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
                        {labelStatus(step.status)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-rsInk">{step.title}</div>
                    <div className="mt-0.5 text-xs text-rsMuted">{step.summary}</div>
                  </div>
                  <ChevronDown
                    className={`mt-1 h-4 w-4 flex-none text-rsMuted transition ${isOpen ? '' : '-rotate-90'}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 px-4 py-3">
                    <p className="text-sm text-rsInk">{step.detail}</p>

                    {step.id === 'eligibility' && (
                      <EligibilityDetail evaluation={step.evaluation} />
                    )}

                    {step.id === 'recommendation' && step.primaryId && (
                      <RecommendationBadge id={step.primaryId} />
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function labelStatus(status) {
  switch (status) {
    case 'met':       return 'Cumple';
    case 'unmet':     return 'No cumple';
    case 'triggered': return 'Activado';
    case 'none':      return 'No aplica';
    case 'resolved':  return 'Resuelto';
    case 'final':     return 'Recomendación';
    default:          return '';
  }
}

function EligibilityDetail({ evaluation }) {
  if (!evaluation) return null;
  const { surgeryReq, criteria } = evaluation;
  return (
    <ul className="mt-3 space-y-1.5 text-xs">
      <li className="flex items-start gap-2">
        <span className={`mt-0.5 inline-block h-1.5 w-1.5 flex-none rounded-full ${surgeryReq.met ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <span className={surgeryReq.met ? 'text-rsInk' : 'text-rose-700'}>
          {surgeryReq.met ? '✓' : '✗'} {surgeryReq.label}
        </span>
      </li>
      {criteria.map((c) => (
        <li key={c.id} className="flex items-start gap-2">
          <span className={`mt-0.5 inline-block h-1.5 w-1.5 flex-none rounded-full ${c.met ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className={c.met ? 'text-rsInk' : 'text-rsMuted'}>
            {c.met ? '✓' : '○'} {c.label}{c.mandatory && !c.met ? ' (obligatorio)' : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RecommendationBadge({ id }) {
  const b = BIOLOGICS[id];
  if (!b) return null;
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
      <span className="text-sm font-bold text-rsInk">{b.name}</span>
      <span className="text-xs text-rsMuted">· {b.target}</span>
    </div>
  );
}

function Alert({ severity, text }) {
  const styles =
    severity === 'warn'
      ? 'border-amber-300 bg-amber-50 text-amber-900'
      : 'border-slate-200 bg-slate-50 text-rsInk';
  const Icon = severity === 'warn' ? AlertTriangle : ChevronRight;
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${styles}`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 flex-none" />
      <span>{text}</span>
    </div>
  );
}
