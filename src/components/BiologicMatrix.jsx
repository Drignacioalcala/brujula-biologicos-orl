import { BIOLOGICS, BIOLOGIC_ORDER } from '../data/biologics';

const BRILLA = {
  dupilumab: 'Eosinofilia moderada-alta (300–1500), anosmia, dermatitis atópica, EoE, prurigo nodular, EREA',
  tezepelumab: 'T2-low (eos <150), asma de cualquier fenotipo, EPOC eosinofílica',
  omalizumab: 'Alergia documentada con IgE alta, asma alérgica grave, urticaria crónica',
  mepolizumab: 'Eosinofilia ≥500, asma eosinofílica grave, EREA',
};

const EVITAR = {
  dupilumab: 'Eosinofilia >1500 (riesgo eosinofilia paradójica) — descartar EGPA primero',
  tezepelumab: 'Cuando otro biológico ya cubre comorbilidad cruzada del paciente',
  omalizumab: 'IgE muy baja (<30) o ausencia de componente alérgico',
  mepolizumab: 'T2-low (eos <150): eficacia reducida en NPS y olfato',
};

export default function BiologicMatrix() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
        Comparador de los 4 biológicos aprobados en CRSwNP
      </div>
      <h3 className="mt-1 text-base font-bold text-rsInk">
        Cuándo brilla cada uno y cuándo evitarlo
      </h3>

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
              <th className="py-2 pr-3">Indicaciones cruzadas</th>
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
                  </td>
                  <td className="py-3 pr-3 text-xs text-rsMuted">{b.target}</td>
                  <td className="py-3 pr-3 text-xs text-rsMuted">{b.dosing}</td>
                  <td className="py-3 pr-3 text-xs text-rsInk">{BRILLA[id]}</td>
                  <td className="py-3 pr-3 text-xs text-rose-700">{EVITAR[id]}</td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {b.cross.map((c) => (
                        <span key={c} className="inline-block rounded-full bg-rsBlueSoft px-2 py-0.5 text-xs font-medium text-rsBlueText">
                          {c}
                        </span>
                      ))}
                    </div>
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
                  <div className="font-semibold uppercase tracking-wider text-rsMuted">Indicaciones cruzadas</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {b.cross.map((c) => (
                      <span key={c} className="inline-block rounded-full bg-rsBlueSoft px-2 py-0.5 font-medium text-rsBlueText">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-rsMuted">
        Las indicaciones cruzadas marcan el camino directo cuando el paciente tiene una de
        ellas: ahí está la financiación y la experiencia clínica acumulada.
      </div>
    </div>
  );
}
