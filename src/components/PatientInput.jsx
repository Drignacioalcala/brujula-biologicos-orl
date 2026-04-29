import { Sparkles, AlertTriangle } from 'lucide-react';

function Slider({ label, value, min, max, step = 1, unit = '', onChange, hint, anchors }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-rsInk">{label}</label>
        <span className="text-sm tabular-nums font-semibold text-rsInk">
          {value}
          {unit && <span className="ml-0.5 text-xs font-normal text-rsMuted">{unit}</span>}
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
      {anchors && (
        <div className="mt-1 flex justify-between text-[10px] text-rsMuted">
          {anchors.map((a, i) => <span key={i}>{a}</span>)}
        </div>
      )}
      {hint && <div className="mt-1 text-[11px] text-rsMuted">{hint}</div>}
    </div>
  );
}

function Toggle({ label, value, onChange, hint, accent }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`group flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
        value
          ? 'border-rsBlue bg-rsBlueSoft'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div
        className={`mt-0.5 flex h-5 w-9 flex-none items-center rounded-full border transition ${
          value ? 'border-rsBlue bg-rsBlue justify-end' : 'border-slate-300 bg-slate-200 justify-start'
        }`}
      >
        <span className="mx-0.5 h-4 w-4 rounded-full bg-white shadow" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-rsInk">{label}</div>
        {hint && <div className="text-[11px] text-rsMuted">{hint}</div>}
        {accent && value && (
          <div className="mt-1 inline-block rounded-full bg-rsBlue/15 px-2 py-0.5 text-[10px] font-semibold text-rsBlue">
            {accent}
          </div>
        )}
      </div>
    </button>
  );
}

export default function PatientInput({ patient, setPatient, onReset, onPreset }) {
  const update = (k) => (v) => setPatient({ ...patient, [k]: v });
  const eosWarning = patient.eosinophils >= 1500;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-rsInk">Fenotipo del paciente</h2>
        <button
          onClick={onReset}
          className="text-xs text-rsMuted underline-offset-2 hover:text-rsInk hover:underline"
        >
          Reiniciar
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rsMuted">
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
          <button onClick={() => onPreset('hipereos')} className="rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium hover:bg-slate-200">
            Hipereosinofilia
          </button>
          <button onClick={() => onPreset('atopica')} className="rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium hover:bg-slate-200">
            Dermatitis atópica
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
          Biomarcadores
        </div>
        <Slider
          label="Eosinófilos en sangre"
          value={patient.eosinophils}
          min={0}
          max={3000}
          step={10}
          unit="cel/µL"
          onChange={update('eosinophils')}
          anchors={['0', '500', '1500', '3000']}
          hint="Corte EUFOREA T2: ≥150. Subgrupo respuesta mepolizumab: ≥500. >1500: descartar EGPA / hipereosinofílico"
        />
        {eosWarning && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
            <span>
              Eosinofilia muy alta. Antes de iniciar biológico descarta EGPA, síndrome
              hipereosinofílico u otras causas sistémicas. <strong>Cautela con dupilumab</strong> por
              riesgo de eosinofilia paradójica.
            </span>
          </div>
        )}
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
        <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
          Síntomas y carga de enfermedad
        </div>
        <Slider
          label="SNOT-22"
          value={patient.snot22}
          min={0}
          max={110}
          unit="puntos"
          onChange={update('snot22')}
          anchors={['0', 'EUFOREA ≥40', 'POLINA ≥50', '110']}
          hint="Cuestionario sinonasal validado en español"
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
        <Slider
          label="VAS de pérdida de olfato"
          value={patient.smellVAS}
          min={0}
          max={10}
          unit=""
          onChange={update('smellVAS')}
          anchors={['0 normal', '5 hiposmia', '10 anosmia']}
          hint="Escala visual analógica auto-referida (forma habitual en consulta). UPSIT solo en investigación"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
          Comorbilidades tipo 2
        </div>
        <Toggle label="Asma comórbida" value={patient.asthma} onChange={update('asthma')} hint="Especialmente moderada-grave" />
        <Toggle label="Alergia documentada" value={patient.allergic} onChange={update('allergic')} hint="Pruebas cutáneas o IgE específica positivas" />
        <Toggle label="EREA / N-ERD" value={patient.nerd} onChange={update('nerd')} hint="Tríada de Samter: poliposis + asma + intolerancia AINE" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
          Indicaciones cruzadas (otras patologías aprobadas)
        </div>
        <Toggle
          label="Dermatitis atópica moderada-grave"
          value={patient.atopicDermatitis}
          onChange={update('atopicDermatitis')}
          hint="Indicación FDA/EMA para dupilumab"
          accent="→ Dupilumab"
        />
        <Toggle
          label="Esofagitis eosinofílica"
          value={patient.eosinophilicEsophagitis}
          onChange={update('eosinophilicEsophagitis')}
          hint="Indicación FDA/EMA para dupilumab"
          accent="→ Dupilumab"
        />
        <Toggle
          label="Prurigo nodular"
          value={patient.prurigoNodular}
          onChange={update('prurigoNodular')}
          hint="Indicación FDA/EMA para dupilumab"
          accent="→ Dupilumab"
        />
        <Toggle
          label="Urticaria crónica espontánea"
          value={patient.chronicUrticaria}
          onChange={update('chronicUrticaria')}
          hint="Indicación FDA/EMA para omalizumab"
          accent="→ Omalizumab"
        />
        <Toggle
          label="EPOC con perfil eosinofílico"
          value={patient.copdEosinophilic}
          onChange={update('copdEosinophilic')}
          hint="Indicación FDA reciente para tezepelumab"
          accent="→ Tezepelumab"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
          Tratamientos previos
        </div>
        <Slider
          label="Cirugías endoscópicas previas"
          value={patient.priorSurgeries}
          min={0}
          max={5}
          unit=""
          onChange={update('priorSurgeries')}
          hint="POLINA exige ≥2 en España; EUFOREA ≥1 o contraindicación"
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
