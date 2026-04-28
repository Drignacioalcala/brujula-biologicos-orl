import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import PatientInput from './components/PatientInput';
import EuforeaCheck from './components/EuforeaCheck';
import BiologicRadar from './components/BiologicRadar';
import Recommendation from './components/Recommendation';
import {
  DEFAULT_PATIENT,
  euforeaCriteria,
  rankBiologics,
  BIOLOGIC_ORDER,
  BIOLOGICS,
} from './data/biologics';
import { exportPdf } from './lib/exportPdf';

const PRESETS = {
  alergica: {
    eosinophils: 220, ige: 480, asthma: true, allergic: true,
    nerd: false, atopicDermatitis: false, anosmia: 1, snot22: 48,
    nps: 5, priorSurgeries: 1, scsCourses: 2, scsContraindication: false, age: 38,
  },
  eosinofilica: {
    eosinophils: 720, ige: 95, asthma: true, allergic: false,
    nerd: false, atopicDermatitis: false, anosmia: 2, snot22: 62,
    nps: 7, priorSurgeries: 2, scsCourses: 3, scsContraindication: false, age: 52,
  },
  t2low: {
    eosinophils: 110, ige: 45, asthma: true, allergic: false,
    nerd: false, atopicDermatitis: false, anosmia: 2, snot22: 58,
    nps: 6, priorSurgeries: 2, scsCourses: 2, scsContraindication: false, age: 60,
  },
  erea: {
    eosinophils: 540, ige: 180, asthma: true, allergic: false,
    nerd: true, atopicDermatitis: false, anosmia: 2, snot22: 72,
    nps: 8, priorSurgeries: 3, scsCourses: 4, scsContraindication: false, age: 47,
  },
};

export default function App() {
  const [patient, setPatient] = useState(DEFAULT_PATIENT);
  const [visible, setVisible] = useState(
    Object.fromEntries(BIOLOGIC_ORDER.map((id) => [id, true])),
  );

  const ranking = useMemo(() => rankBiologics(patient), [patient]);
  const criteria = useMemo(() => euforeaCriteria(patient), [patient]);

  const handleExport = () => exportPdf({ patient, ranking, criteria });

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
              onReset={() => setPatient(DEFAULT_PATIENT)}
              onPreset={(k) => setPatient({ ...DEFAULT_PATIENT, ...PRESETS[k] })}
            />
          </aside>
          <section className="space-y-6">
            <EuforeaCheck criteria={criteria} />
            <BiologicRadar
              ranking={ranking}
              visible={visible}
              toggleVisible={(id) => setVisible((v) => ({ ...v, [id]: !v[id] }))}
            />
            <Recommendation
              ranking={ranking}
              patient={patient}
              criteria={criteria}
              onExport={handleExport}
            />
            <BiologicReference />
          </section>
        </div>
      </main>

      <Footer />
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
          EPOS / EUFOREA 2023 · Meta-análisis Xu 2025, Safia 2025, Cai 2022
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
            Fenotipa al paciente, comprueba criterios EPOS/EUFOREA y compara los{' '}
            <span className="font-semibold text-rsBlue">4 biológicos aprobados</span> sobre evidencia real.
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

function BiologicReference() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="text-xs font-semibold uppercase tracking-wider text-rsMuted">
        Ficha rápida de los 4 biológicos
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {BIOLOGIC_ORDER.map((id) => {
          const b = BIOLOGICS[id];
          return (
            <div key={id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                <span className="font-semibold text-rsInk">{b.name}</span>
                <span className="text-[11px] text-rsMuted">{b.target}</span>
              </div>
              <div className="mt-1.5 text-[11px] text-rsMuted">
                <span className="font-semibold text-rsInk">Pauta:</span> {b.dosing}
              </div>
              <div className="mt-1 text-[11px] text-rsMuted">
                <span className="font-semibold text-rsInk">Ensayos:</span> {b.trials.join(', ')}
              </div>
              <div className="mt-1 text-[11px] italic text-rsMuted">{b.notes}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
