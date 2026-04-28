import { Sparkles } from 'lucide-react';

function Slider({ label, value, min, max, step = 1, unit = '', onChange, hint }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm tabular-nums font-semibold text-ink">
          {value}
          {unit && <span className="ml-0.5 text-xs font-normal text-slate-500">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full"
      />
      {hint && <div className="mt-1 text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}

function Toggle({ label, value, onChange, hint }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`group flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
        value
          ? 'border-blue-500 bg-blue-50/70'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div
        className={`mt-0.5 flex h-5 w-9 flex-none items-center rounded-full border transition ${
          value ? 'border-blue-500 bg-blue-500 justify-end' : 'border-slate-300 bg-slate-200 justify-start'
        }`}
      >
        <span className="mx-0.5 h-4 w-4 rounded-full bg-white shadow" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-ink">{label}</div>
        {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
      </div>
    </button>
  );
}

export default function PatientInput({ patient, setPatient, onReset, onPreset }) {
  const update = (k) => (v) => setPatient({ ...patient, [k]: v });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Fenotipo del paciente</h2>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 underline-offset-2 hover:text-ink hover:underline"
        >
          Reiniciar
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Sparkles className="h-3.5 w-3.5" /> Casos rápidos
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onPreset('alergica')} className="rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium hover:bg-slate-200">
            Alérgica + IgE alta
          </button>
          <button onClick={() => onPreset('eosinofilica')} className="rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium hover:bg-slate-200">
            Eosinofílica + asma
          </button>
          <button onClick={() => onPreset('t2low')} className="rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium hover:bg-slate-200">
            T2-low / eos baja
          </button>
          <button onClick={() => onPreset('erea')} className="rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium hover:bg-slate-200">
            EREA / N-ERD
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Biomarcadores
        </div>
        <Slider
          label="Eosinófilos en sangre"
          value={patient.eosinophils}
          min={0}
          max={1500}
          step={10}
          unit="cel/µL"
          onChange={update('eosinophils')}
          hint="Punto de corte EUFOREA 2023: ≥150 cel/µL como criterio de inflamación tipo 2"
        />
        <Slider
          label="IgE total"
          value={patient.ige}
          min={0}
          max={1500}
          step={5}
          unit="UI/mL"
          onChange={update('ige')}
          hint="Relevante para indicación y dosificación de omalizumab"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Síntomas y carga de enfermedad
        </div>
        <Slider
          label="SNOT-22"
          value={patient.snot22}
          min={0}
          max={110}
          unit="puntos"
          onChange={update('snot22')}
          hint="≥40 indica impacto significativo en calidad de vida"
        />
        <Slider
          label="NPS (Nasal Polyp Score)"
          value={patient.nps}
          min={0}
          max={8}
          unit="/8"
          onChange={update('nps')}
          hint="Suma de ambas fosas (0–4 cada una)"
        />
        <div>
          <label className="text-sm font-medium text-slate-700">Olfato</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { v: 0, t: 'Normal' },
              { v: 1, t: 'Hiposmia' },
              { v: 2, t: 'Anosmia' },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => update('anosmia')(o.v)}
                className={`rounded-md border px-2 py-1.5 text-xs font-medium ${
                  patient.anosmia === o.v
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {o.t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Comorbilidades tipo 2
        </div>
        <Toggle label="Asma comórbida" value={patient.asthma} onChange={update('asthma')} hint="Especialmente si moderada-grave" />
        <Toggle label="Alergia documentada" value={patient.allergic} onChange={update('allergic')} hint="Pruebas cutáneas o IgE específica positivas" />
        <Toggle label="EREA / N-ERD" value={patient.nerd} onChange={update('nerd')} hint="Tríada de Samter: poliposis + asma + intolerancia AINE" />
        <Toggle label="Dermatitis atópica" value={patient.atopicDermatitis} onChange={update('atopicDermatitis')} hint="Tira fuerte de dupilumab por indicación cruzada" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Tratamientos previos
        </div>
        <Slider
          label="Cirugías endoscópicas previas"
          value={patient.priorSurgeries}
          min={0}
          max={5}
          unit=""
          onChange={update('priorSurgeries')}
          hint="EUFOREA exige cirugía previa adecuada o contraindicación"
        />
        <Slider
          label="Ciclos de corticoides sistémicos en el último año"
          value={patient.scsCourses}
          min={0}
          max={6}
          unit="ciclos"
          onChange={update('scsCourses')}
          hint="≥2 ciclos/año cumple criterio EUFOREA"
        />
        <Toggle
          label="Contraindicación a corticoides sistémicos"
          value={patient.scsContraindication}
          onChange={update('scsContraindication')}
          hint="Diabetes mal controlada, osteoporosis, glaucoma, etc."
        />
      </div>
    </div>
  );
}
