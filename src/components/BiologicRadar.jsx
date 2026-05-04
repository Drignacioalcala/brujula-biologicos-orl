import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
            Perfil de eficacia por dominio
          </div>
          <p className="mt-1 text-xs text-rsMuted max-w-md">
            Cada eje representa la probabilidad relativa de mejor respuesta (SUCRA, escala 20–100),
            basada en meta-análisis en red y ajustada al fenotipo del paciente.{' '}
            <strong>No es eficacia absoluta:</strong> un valor bajo significa menor probabilidad de
            ser el mejor, no ineficacia frente a placebo.
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
                aria-pressed={on}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  on ? 'border-slate-300 bg-white text-rsInk' : 'border-slate-200 bg-slate-50 text-rsMuted'
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
              tick={{ fill: '#363B47', fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              domain={[20, 100]}
              tickCount={5}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
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
