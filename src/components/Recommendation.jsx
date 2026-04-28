import { useEffect, useRef, useState } from 'react';
import { Loader2, Trophy, FileDown, MessageCircleQuestion } from 'lucide-react';
import { BIOLOGICS } from '../data/biologics';

export default function Recommendation({ ranking, patient, criteria, onExport }) {
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);

  // Marca el resultado como obsoleto cuando cambia el fenotipo,
  // sin disparar la llamada a la API (solo se dispara con el botón).
  const lastSnapshot = useRef('');
  useEffect(() => {
    const snap = JSON.stringify({ patient, criteria });
    if (lastSnapshot.current && lastSnapshot.current !== snap && narrative) {
      setStale(true);
    }
    lastSnapshot.current = snap;
  }, [patient, criteria, narrative]);

  const askGroog = async () => {
    setLoading(true);
    setError(null);
    setStale(false);
    try {
      const res = await fetch('/.netlify/functions/clinical-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, ranking, criteria }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNarrative(data.text || '');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
            Recomendación priorizada
          </div>
          <h2 className="mt-1 flex items-center gap-2 text-base font-semibold text-rsInk">
            <Trophy className="h-4 w-4 text-rsBlue" />
            Ranking adaptado al fenotipo
          </h2>
        </div>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rsInk hover:bg-slate-50"
        >
          <FileDown className="h-3.5 w-3.5" />
          Exportar PDF
        </button>
      </div>

      <ol className="mt-4 space-y-2">
        {ranking.map((r, i) => {
          const b = BIOLOGICS[r.id];
          const pct = Math.round(r.overall * 100);
          return (
            <li
              key={r.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                i === 0 ? 'border-rsBlue/40 bg-rsBlueSoft' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-sm font-bold text-rsInk shadow-sm">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold text-rsInk">{b.name}</span>
                  <span className="text-xs text-rsMuted">{b.target}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: b.color }}
                  />
                </div>
              </div>
              <div className="tabular-nums text-sm font-bold text-rsInk">{pct}</div>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 rounded-xl border border-slate-200 bg-rsCanvas p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/brand/groog.png"
              alt="Groog"
              className={`h-12 w-12 rounded-full bg-white object-cover shadow-sm ring-2 ring-rsBlue/30 ${
                loading ? 'animate-pulse' : ''
              }`}
            />
            <div className="leading-tight">
              <div className="text-sm font-bold text-rsInk">Razonamiento clínico</div>
              <div className="text-[11px] text-rsMuted">
                Groog te explica por qué este ranking, basado en el fenotipo.
              </div>
            </div>
          </div>
          <button
            onClick={askGroog}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md bg-rsBlue px-3 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Groog pensando…
              </>
            ) : (
              <>
                <MessageCircleQuestion className="h-3.5 w-3.5" />
                {narrative ? 'Volver a preguntar a Groog' : 'Pedirle explicación a Groog'}
              </>
            )}
          </button>
        </div>

        {(narrative || error || stale) && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
            {error ? (
              <span className="text-rose-600">
                Groog no ha podido contestar ({error}). Verifica la API key en Netlify.
              </span>
            ) : (
              <>
                {stale && (
                  <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-800">
                    El fenotipo ha cambiado desde la última explicación. Pulsa el botón para que Groog la actualice.
                  </div>
                )}
                <div className={stale ? 'opacity-60' : ''}>{narrative}</div>
              </>
            )}
          </div>
        )}

        {!narrative && !loading && !error && (
          <div className="mt-3 text-[11px] italic text-rsMuted">
            Groog no contesta hasta que se lo pides — así no quema API calls cada vez que mueves un slider.
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-rsMuted">
        Apoyo a la decisión, no sustituto del juicio clínico. Verifica indicación, financiación
        local y contraindicaciones antes de prescribir.
      </div>
    </div>
  );
}
