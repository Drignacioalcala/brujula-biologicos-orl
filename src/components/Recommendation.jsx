import { useEffect, useState } from 'react';
import { Loader2, Trophy, FileDown } from 'lucide-react';
import { BIOLOGICS } from '../data/biologics';

export default function Recommendation({ ranking, patient, criteria, onExport }) {
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/.netlify/functions/clinical-narrative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient, ranking, criteria }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setNarrative(data.text || '');
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = setTimeout(run, 600); // debounce ante cambios rápidos
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [patient, ranking, criteria]);

  const podium = ranking.slice(0, ranking.length);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recomendación priorizada
          </div>
          <h2 className="mt-1 flex items-center gap-2 text-base font-semibold text-ink">
            <Trophy className="h-4 w-4 text-amber-500" />
            Ranking adaptado al fenotipo
          </h2>
        </div>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-slate-50"
        >
          <FileDown className="h-3.5 w-3.5" />
          Exportar PDF
        </button>
      </div>

      <ol className="mt-4 space-y-2">
        {podium.map((r, i) => {
          const b = BIOLOGICS[r.id];
          const pct = Math.round(r.overall * 100);
          return (
            <li
              key={r.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                i === 0 ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold text-ink">{b.name}</span>
                  <span className="text-xs text-slate-500">{b.target}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: b.color }}
                  />
                </div>
              </div>
              <div className="tabular-nums text-sm font-semibold text-ink">{pct}</div>
            </li>
          );
        })}
      </ol>

      <div className="mt-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Razonamiento clínico
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
        </div>
        <div className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap min-h-[100px]">
          {error ? (
            <span className="text-rose-600">
              No se ha podido generar la narrativa ({error}). Verifica la API key en Netlify.
            </span>
          ) : narrative ? (
            narrative
          ) : loading ? (
            'Generando razonamiento clínico personalizado…'
          ) : (
            'Modifica el fenotipo para generar la narrativa.'
          )}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-slate-500">
        Apoyo a la decisión, no sustituto del juicio clínico. Verifica indicación, financiación
        local y contraindicaciones antes de prescribir.
      </div>
    </div>
  );
}
