import { useMemo, useState } from 'react';
import { BookOpen, Compass, MousePointerClick } from 'lucide-react';
import PatientInput from './components/PatientInput';
import GuideCheck from './components/GuideCheck';
import DecisionTree from './components/DecisionTree';
import RecommendationCard from './components/RecommendationCard';
import BiologicMatrix from './components/BiologicMatrix';
import Bibliography from './components/Bibliography';
import { EMPTY_PATIENT, evaluatePatient } from './data/biologics';
import { runDecisionTree } from './lib/decisionTree';
import { exportPdf } from './lib/exportPdf';

const PRESETS = {
  alergica: {
    eosinophils: 220, ige: 480, asthma: true, allergic: true,
    nerd: false, atopicDermatitis: false, smellVAS: 4, snot22: 52,
    nps: 5, priorSurgeries: 2, scsCourses: 2, scsContraindication: false, age: 38,
  },
  eosinofilica: {
    eosinophils: 720, ige: 95, asthma: true, allergic: false,
    nerd: false, atopicDermatitis: false, smellVAS: 8, snot22: 62,
    nps: 7, priorSurgeries: 2, scsCourses: 3, scsContraindication: false, age: 52,
  },
  t2low: {
    eosinophils: 110, ige: 45, asthma: true, allergic: false,
    nerd: false, atopicDermatitis: false, smellVAS: 5, snot22: 58,
    nps: 6, priorSurgeries: 2, scsCourses: 2, scsContraindication: false, age: 60,
  },
  erea: {
    eosinophils: 540, ige: 180, asthma: true, allergic: false,
    nerd: true, atopicDermatitis: false, smellVAS: 9, snot22: 72,
    nps: 8, priorSurgeries: 3, scsCourses: 4, scsContraindication: false, age: 47,
  },
  hipereos: {
    eosinophils: 1900, ige: 220, asthma: true, allergic: false,
    nerd: false, atopicDermatitis: false, smellVAS: 8, snot22: 70,
    nps: 7, priorSurgeries: 2, scsCourses: 3, scsContraindication: false, age: 55,
  },
  atopica: {
    eosinophils: 380, ige: 850, asthma: false, allergic: true,
    nerd: false, atopicDermatitis: true, smellVAS: 6, snot22: 56,
    nps: 6, priorSurgeries: 2, scsCourses: 2, scsContraindication: false, age: 34,
  },
};

export default function App() {
  const [patient, setPatientRaw] = useState(EMPTY_PATIENT);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [guideId, setGuideId] = useState('POLINA');

  const setPatient = (next) => {
    setHasInteracted(true);
    setPatientRaw(next);
  };

  const evaluation = useMemo(() => evaluatePatient(patient, guideId), [patient, guideId]);
  const decision = useMemo(() => runDecisionTree(patient, guideId), [patient, guideId]);

  const handleExport = () =>
    exportPdf({ patient, decision, evaluation, guideId });

  const handleReset = () => {
    setPatientRaw(EMPTY_PATIENT);
    setHasInteracted(false);
  };

  return (
    <div className="min-h-full">
      <Header />
      <Hero />

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside>
            <PatientInput
              patient={patient}
              setPatient={setPatient}
              onReset={handleReset}
              onPreset={(k) => setPatient({ ...EMPTY_PATIENT, ...PRESETS[k] })}
            />
          </aside>
          <section className="space-y-6">
            <GuideSelector guideId={guideId} onChangeGuide={setGuideId} />
            {hasInteracted ? (
              <>
                <GuideCheck evaluation={evaluation} guideId={guideId} />
                <DecisionTree decision={decision} />
                <RecommendationCard decision={decision} onExport={handleExport} />
              </>
            ) : (
              <EmptyState onPreset={(k) => setPatient({ ...EMPTY_PATIENT, ...PRESETS[k] })} />
            )}
            <BiologicMatrix />
            <Bibliography />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function EmptyState({ onPreset }) {
  const QUICK = [
    { k: 'alergica', label: 'Alérgica + IgE alta + asma' },
    { k: 'eosinofilica', label: 'Eosinofílica + asma' },
    { k: 't2low', label: 'T2-low + asma (eos baja, IgE baja)' },
    { k: 'erea', label: 'EREA / N-ERD' },
    { k: 'hipereos', label: 'Hipereosinofilia (>1500)' },
    { k: 'atopica', label: 'Dermatitis atópica' },
  ];
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rsBlueSoft text-rsBlue">
        <Compass className="h-10 w-10" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-rsInk">
        Empieza marcando los rasgos del paciente
      </h3>
      <p className="mt-2 max-w-md text-sm text-rsMuted">
        Mueve los sliders y toggles del panel izquierdo, o prueba la app con un caso típico:
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {QUICK.map((q) => (
          <button
            key={q.k}
            onClick={() => onPreset(q.k)}
            className="rounded-full border border-rsBlue/30 bg-white px-3 py-1.5 text-xs font-semibold text-rsBlueText hover:bg-rsBlueSoft"
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-xs text-rsMuted">
        <MousePointerClick className="h-3.5 w-3.5" />
        Sin datos no hay recomendación
      </div>
    </div>
  );
}

function GuideSelector({ guideId, onChangeGuide }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-soft">
      <div className="leading-tight">
        <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
          Guía clínica aplicada
        </div>
        <div className="mt-0.5 text-sm text-rsInk">
          {guideId === 'POLINA'
            ? 'POLINA 2.0 — España (umbrales más estrictos: SNOT-22 ≥50, ≥2 cirugías, T2 obligatorio)'
            : 'EPOS / EUFOREA 2023 — Internacional (SNOT-22 ≥40, ≥1 cirugía o contraindicación)'}
        </div>
      </div>
      <div role="radiogroup" aria-label="Selector de guía clínica" className="inline-flex rounded-lg bg-slate-100 p-1">
        <button
          role="radio"
          aria-checked={guideId === 'POLINA'}
          onClick={() => onChangeGuide('POLINA')}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            guideId === 'POLINA'
              ? 'bg-white text-rsInk shadow-sm'
              : 'text-rsMuted hover:text-rsInk'
          }`}
        >
          España (POLINA)
        </button>
        <button
          role="radio"
          aria-checked={guideId === 'EUFOREA'}
          onClick={() => onChangeGuide('EUFOREA')}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            guideId === 'EUFOREA'
              ? 'bg-white text-rsInk shadow-sm'
              : 'text-rsMuted hover:text-rsInk'
          }`}
        >
          Internacional (EUFOREA)
        </button>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-rsDark text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/brand/logo-icon-dark.png" alt="red sanitarIA" className="h-10 w-10" />
          <div className="leading-tight">
            <span className="inline-block rounded-md bg-rsBlue px-2 py-0.5 text-xs font-bold uppercase tracking-[0.12em] text-white">
              app by red sanitarIA
            </span>
            <h1 className="mt-1.5 text-lg font-bold text-white">Brújula Biológicos ORL</h1>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs font-medium text-white/90 sm:flex">
          <BookOpen className="h-3.5 w-3.5" />
          POLINA 2.0 · EPOS / EUFOREA 2023
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div className="bg-rsDark text-white">
      <div className="mx-auto max-w-7xl px-6 pb-7 pt-2">
        <p className="max-w-3xl text-sm leading-relaxed text-white/95">
          Apoyo a la decisión clínica para la elección de biológico en poliposis nasal grave (CRSwNP).
          Fenotipa al paciente, comprueba criterios{' '}
          <span className="font-semibold text-rsBlue">POLINA 2.0</span> (España) o{' '}
          <span className="font-semibold text-rsBlue">EPOS / EUFOREA 2023</span> (internacional)
          y sigue el árbol determinístico hasta la recomendación, con razones explícitas y
          ficha AEMPS. Sin IA generativa: el camino es trazable y reproducible.
        </p>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-rsBlue/0 via-rsBlue to-rsBlue/0" />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <img src="/brand/logo-claro.png" alt="red sanitarIA" className="h-10 w-auto" />
          <div className="text-xs leading-tight text-rsMuted">
            <div className="font-semibold text-rsInk">app by red sanitarIA</div>
            <div>Inteligencia artificial y salud digital aterrizadas al día a día clínico.</div>
          </div>
        </div>
        <div className="text-xs leading-tight text-rsMuted">
          Apoyo a la decisión clínica · No sustituye juicio clínico ni indicación oficial.<br />
          Verifica financiación local y contraindicaciones antes de prescribir.
        </div>
      </div>
    </footer>
  );
}
