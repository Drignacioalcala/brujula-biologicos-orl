import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { BIOLOGICS, BIOLOGIC_ORDER, DOMAINS } from '../data/biologics';

export default function BiologicRadar({ ranking, visible, toggleVisible }) {
  // Recharts espera array de objetos con un campo por serie por dominio.
  const data = DOMAINS.map((d) => {
    const row = { domain: d.label };
    ranking.forEach((r) => {
      row[r.id] = Math.round(r.scores[d.id] * 100);
    });
    return row;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Comparativa visual
          </div>
          <h2 className="mt-1 text-base font-semibold text-ink">
            Perfil de eficacia por dominio
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-md">
            Cada eje representa la probabilidad relativa de mejor respuesta (0–100), basada en SUCRA
            de meta-análisis en red, ajustada al fenotipo del paciente.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BIOLOGIC_ORDER.map((id) => {
            const b = BIOLOGICS[id];
            const on = visible[id];
            return (
              <button
                key={id}
                onClick={() => toggleVisible(id)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  on ? 'border-slate-300 bg-white text-ink' : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: on ? b.color : '#cbd5e1' }}
                />
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 h-[380px] w-full">
        <ResponsiveContainer>
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="domain"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
            />
            {BIOLOGIC_ORDER.map((id) => {
              if (!visible[id]) return null;
              const b = BIOLOGICS[id];
              return (
                <Radar
                  key={id}
                  name={b.name}
                  dataKey={id}
                  stroke={b.color}
                  fill={b.color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot
                />
              );
            })}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
