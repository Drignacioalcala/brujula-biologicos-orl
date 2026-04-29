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

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-wider text-rsMuted">
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
                  <td className="py-3 pr-3 text-[12px] text-rsMuted">{b.target}</td>
                  <td className="py-3 pr-3 text-[12px] text-rsMuted">{b.dosing}</td>
                  <td className="py-3 pr-3 text-[12px] text-rsInk">{BRILLA[id]}</td>
                  <td className="py-3 pr-3 text-[12px] text-rose-700">{EVITAR[id]}</td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {b.cross.map((c) => (
                        <span key={c} className="inline-block rounded-full bg-rsBlueSoft px-2 py-0.5 text-[10px] font-medium text-rsBlue">
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

      <div className="mt-3 text-[11px] text-rsMuted">
        Las indicaciones cruzadas marcan el camino directo cuando el paciente tiene una de
        ellas: ahí está la financiación y la experiencia clínica acumulada.
      </div>
    </div>
  );
}
