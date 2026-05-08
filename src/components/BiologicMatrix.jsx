import { BIOLOGICS, BIOLOGIC_ORDER } from '../data/biologics';

const BRILLA = {
  dupilumab:
    'EREA/N-ERD, dermatitis atópica, EoE, prurigo nodular, alergia + asma (EVEREST 2025), olfato muy afectado',
  tezepelumab:
    'T2-low (eos <150, IgE baja, sin alergia), pacientes en los que dupilumab no es opción, casos refractarios',
  omalizumab:
    'Urticaria crónica espontánea concomitante, fenotipo alérgico cuando dupilumab no encaja',
  mepolizumab:
    'Eosinofilia ≥500/µL con asma, hipereosinofilia (>1500), EGPA, síndrome hipereosinofílico',
};

const EVITAR = {
  dupilumab:
    'Cautela con eos >1500/µL (eosinofilia paradójica al inicio); descartar EGPA antes',
  tezepelumab:
    'Cuando otro biológico ya cubre comorbilidad cruzada (DA, EoE, urticaria, EGPA)',
  omalizumab:
    'IgE <30 UI/mL y sin componente alérgico claro (pierde fundamento mecanístico). EVEREST 2025: dupilumab superior en CRSwNP+asma',
  mepolizumab:
    'T2-low (eos <150/µL): eficacia reducida en NPS y olfato',
};

export default function BiologicMatrix() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
        Comparador de los 4 biológicos financiados en España (CRSwNP)
      </div>
      <h3 className="mt-1 text-base font-bold text-rsInk">
        Cuándo brilla cada uno y cuándo evitarlo
      </h3>
      <p className="mt-1 text-xs text-rsMuted">
        Estado AEMPS revisado a 8-mayo-2026. Todos son de prescripción de diagnóstico hospitalario (DH).
      </p>

      {/* Tabla en pantallas medianas y grandes */}
      <div className="mt-4 hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-rsMuted">
              <th className="py-2 pr-3">Biológico</th>
              <th className="py-2 pr-3">Diana</th>
              <th className="py-2 pr-3">Pauta</th>
              <th className="py-2 pr-3">Brilla cuando…</th>
              <th className="py-2 pr-3">Cautela / evitar</th>
              <th className="py-2 pr-3">Financiación SNS</th>
            </tr>
          </thead>
          <tbody>
            {BIOLOGIC_ORDER.map((id) => {
              const b = BIOLOGICS[id];
              return (
                <tr key={id} className="border-b border-slate-100 align-top last:border-b-0">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="font-bold text-rsInk">{b.name}</span>
                    </div>
                    <div className="text-[11px] text-rsMuted">{b.brand}</div>
                  </td>
                  <td className="py-3 pr-3 text-xs text-rsMuted">{b.target}</td>
                  <td className="py-3 pr-3 text-xs text-rsMuted">{b.dosing}</td>
                  <td className="py-3 pr-3 text-xs text-rsInk">{BRILLA[id]}</td>
                  <td className="py-3 pr-3 text-xs text-rose-700">{EVITAR[id]}</td>
                  <td className="py-3 pr-3 text-xs">
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                      desde {prettyDate(b.aemps.since)}
                    </span>
                    <div className="mt-1 text-[11px] text-rsMuted">{b.aemps.conditions}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards apiladas en móvil */}
      <div className="mt-4 space-y-3 md:hidden">
        {BIOLOGIC_ORDER.map((id) => {
          const b = BIOLOGICS[id];
          return (
            <div key={id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                <span className="font-bold text-rsInk">{b.name}</span>
                <span className="text-[11px] text-rsMuted">({b.brand})</span>
                <span className="ml-auto text-xs text-rsMuted">{b.target}</span>
              </div>
              <div className="mt-2 grid gap-2 text-xs">
                <div>
                  <div className="font-semibold uppercase tracking-wider text-rsMuted">Pauta</div>
                  <div className="text-rsInk">{b.dosing}</div>
                </div>
                <div>
                  <div className="font-semibold uppercase tracking-wider text-rsMuted">Brilla cuando…</div>
                  <div className="text-rsInk">{BRILLA[id]}</div>
                </div>
                <div>
                  <div className="font-semibold uppercase tracking-wider text-rsMuted">Cautela / evitar</div>
                  <div className="text-rose-700">{EVITAR[id]}</div>
                </div>
                <div>
                  <div className="font-semibold uppercase tracking-wider text-rsMuted">Financiación SNS</div>
                  <div className="text-rsInk">
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                      desde {prettyDate(b.aemps.since)}
                    </span>
                    <span className="ml-2 text-[11px] text-rsMuted">DH</span>
                  </div>
                  <div className="mt-1 text-[11px] text-rsMuted">{b.aemps.conditions}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-rsMuted">
        Las indicaciones cruzadas marcan el camino directo cuando el paciente tiene una de
        ellas: ahí están la financiación y la experiencia clínica acumulada.
      </div>
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
