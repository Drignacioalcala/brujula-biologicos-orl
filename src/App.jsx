import { useMemo, useState } from 'react';
import { BookOpen, MousePointerClick } from 'lucide-react';
import PatientInput from './components/PatientInput';
import GuideCheck from './components/GuideCheck';
import BiologicRadar from './components/BiologicRadar';
import Recommendation from './components/Recommendation';
import BiologicMatrix from './components/BiologicMatrix';
import Bibliography from './components/Bibliography';
import {
  EMPTY_PATIENT,
  evaluatePatient,
  rankBiologics,
  BIOLOGIC_ORDER,
  BIOLOGICS,
} from './data/biologics';
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
    nerd: false, atopicDermatitis: false, smellVAS: 7, snot22: 58,
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
  const [visible, setVisible] = useState(
    Object.fromEntries(BIOLOGIC_ORDER.map((id) => [id, true])),
  );

  const setPatient = (next) => {
    setHasInteracted(true);
    setPatientRaw(next);
  };

  const ranking = useMemo(() => rankBiologics(patient), [patient]);
  const evaluation = useMemo(() => evaluatePatient(patient, guideId), [patient, guideId]);

  const handleExport = () =>
    exportPdf({ patient, ranking, evaluation, guideId });

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
            {hasInteracted ? (
              <>
                <GuideCheck
                  evaluation={evaluation}
                  guideId={guideId}
                  onChangeGuide={setGuideId}
                />
                <BiologicRadar
                  ranking={ranking}
                  visible={visible}
                  toggleVisible={(id) => setVisible((v) => ({ ...v, [id]: !v[id] }))}
                />
                <Recommendation
                  ranking={ranking}
                  patient={patient}
                  evaluation={evaluation}
                  guideId={guideId}
                  onExport={handleExport}
                />
              </>
            ) : (
              <EmptyState />
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

function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-10 text-center">
      <img
        src="/brand/groog.png"
        alt="Groog te espera"
        className="groog-wobble h-32 w-auto opacity-90"
      />
      <h3 className="mt-4 text-lg font-bold text-rsInk">
        Empieza marcando los rasgos de tu paciente
      </h3>
      <p className="mt-2 max-w-md text-sm text-rsMuted">
        Mueve los sliders, activa las comorbilidades o usa un caso rápido del panel izquierdo.
        Cuando haya datos, aparecerá la verificación POLINA/EUFOREA, el radar comparativo y el
        ranking adaptado a su fenotipo.
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rsBlueSoft px-3 py-1.5 text-xs font-semibold text-rsBlue">
        <MousePointerClick className="h-3.5 w-3.5" />
        Sin datos no hay recomendación
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
            <span className="inline-block rounded-md bg-rsBlue px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              app by red sanitarIA
            </span>
            <h1 className="mt-1.5 text-lg font-bold text-white">Brújula Biológicos ORL</h1>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-[11px] font-medium text-white/90 sm:flex">
          <BookOpen className="h-3.5 w-3.5" />
          POLINA · EPOS / EUFOREA 2023
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div className="bg-rsDark text-white">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-6 pb-7 pt-2">
        <div className="max-w-2xl">
          <p className="text-sm leading-relaxed text-white/95">
            Apoyo a la decisión para la elección de biológico en poliposis nasal grave.
            Fenotipa al paciente, comprueba criterios{' '}
            <span className="font-semibold text-rsBlue">POLINA</span> (España) o{' '}
            <span className="font-semibold text-rsBlue">EPOS/EUFOREA 2023</span> (internacional)
            y compara los 4 biológicos aprobados sobre evidencia real.
          </p>
          <p className="mt-3 text-base font-bold text-white">
            App para médicos{' '}
            <span className="line-through decoration-rsBlue decoration-2">neandertales</span>{' '}
            que no quieren serlo.
          </p>
          <p className="mt-1 text-xs italic text-white/80">
            «Deja de ser el neandertal de tu hospital»
          </p>
        </div>
        <div className="relative hidden md:block">
          <div className="absolute -top-2 right-36 hidden lg:block">
            <SpeechBubble />
          </div>
          <img
            src="/brand/groog.png"
            alt="Groog, el médico neandertal — mascota de red sanitarIA"
            className="groog-wobble h-44 w-auto drop-shadow-2xl"
          />
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-rsBlue/0 via-rsBlue to-rsBlue/0" />
    </div>
  );
}

function SpeechBubble() {
  return (
    <div className="relative max-w-[210px]">
      <div className="rounded-2xl bg-white px-4 py-2.5 text-[13px] font-semibold text-rsInk shadow-lg ring-1 ring-rsBlue/30">
        ¿Eosinófilos? Yo dar palo a pólipo.
      </div>
      <div className="absolute -bottom-2 right-10 h-3 w-3 rotate-45 bg-white ring-1 ring-rsBlue/30" />
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
        <div className="text-[11px] leading-tight text-rsMuted">
          Apoyo a la decisión clínica · No sustituye juicio clínico ni indicación oficial.<br />
          Verifica financiación local y contraindicaciones antes de prescribir.
        </div>
      </div>
    </footer>
  );
}
