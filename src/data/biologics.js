// Datos de los 4 biológicos financiados en España (SNS) para CRSwNP
// a fecha 8-mayo-2026. Verificado en BIFIMED, CIMA, AEMPS y notas CIPM.
// La aplicación es un árbol de decisión determinístico (sin SUCRA, sin IA).

export const BIOLOGICS = {
  dupilumab: {
    id: 'dupilumab',
    name: 'Dupilumab',
    brand: 'Dupixent',
    target: 'IL-4Rα (bloquea IL-4 e IL-13)',
    color: '#29ADFF',
    trials: ['SINUS-24', 'SINUS-52', 'EVEREST'],
    dosing: '300 mg subcutáneo cada 2 semanas',
    cross: ['Dermatitis atópica', 'Esofagitis eosinofílica', 'Prurigo nodular', 'Asma tipo 2', 'EREA'],
    aemps: {
      financed: true,
      since: '2020-02-01',
      conditions: '≥2 cirugías endoscópicas previas (BIFIMED). Diagnóstico hospitalario (DH).',
      prescriptionType: 'DH',
      cima: 'https://cima.aemps.es/cima/publico/lista.html?nombre=dupixent',
    },
    notes:
      'Biológico con más evidencia robusta global en CRSwNP (Cai 2025 RWE, 64 estudios). ' +
      'Indicación cruzada en dermatitis atópica, EoE y prurigo nodular. ' +
      'EVEREST 2025 (Lancet Respir Med): superior a omalizumab en CRSwNP+asma. ' +
      'Eosinofilia transitoria al inicio: cautela si eos basales >1500/µL (descartar EGPA).',
  },
  tezepelumab: {
    id: 'tezepelumab',
    name: 'Tezepelumab',
    brand: 'Tezspire',
    target: 'TSLP (linfopoyetina estromal tímica, vía superior)',
    color: '#10b981',
    trials: ['WAYPOINT (NEJM 2025)'],
    dosing: '210 mg subcutáneo cada 4 semanas',
    cross: ['Asma de cualquier fenotipo (incluido T2-low)'],
    aemps: {
      financed: true,
      since: '2026-01-28',
      conditions: 'Aprobado CIPM 28-ene-2026 para CRSwNP. Comercializado en España desde 30-mar-2026. Diagnóstico hospitalario (DH). Tratamiento complementario a corticoides intranasales en pacientes con respuesta inadecuada a corticoides sistémicos y/o cirugía.',
      prescriptionType: 'DH',
      cima: 'https://cima.aemps.es/cima/publico/lista.html?nombre=tezspire',
    },
    notes:
      'Único biológico T2-agnóstico: eficaz aunque eosinófilos e IgE estén bajos. ' +
      'WAYPOINT (Lipworth NEJM 2025): redujo necesidad de cirugía 98% (0,5% vs 22,1%) y uso de corticoides sistémicos. ' +
      'Útil cuando no hay perfil eosinofílico claro o cuando dupilumab no es opción.',
  },
  omalizumab: {
    id: 'omalizumab',
    name: 'Omalizumab',
    brand: 'Xolair',
    target: 'IgE',
    color: '#f59e0b',
    trials: ['POLYP 1', 'POLYP 2', 'EVEREST'],
    dosing: 'Dosis ajustada por peso e IgE total (75–600 mg cada 2–4 semanas)',
    cross: ['Asma alérgica grave', 'Urticaria crónica espontánea'],
    aemps: {
      financed: true,
      since: '2025',
      conditions: 'Financiado para CRSwNP en 2025. Diagnóstico hospitalario (DH). Dosificación obligada por nomograma peso × IgE total.',
      prescriptionType: 'DH',
      cima: 'https://cima.aemps.es/cima/publico/lista.html?nombre=xolair',
    },
    notes:
      'Indicación cruzada en urticaria crónica espontánea (decanta la decisión). ' +
      'EVEREST 2025: dupilumab superior a omalizumab en CRSwNP+asma para todos los endpoints — ' +
      'omalizumab queda como alternativa cuando hay urticaria crónica concomitante.',
  },
  mepolizumab: {
    id: 'mepolizumab',
    name: 'Mepolizumab',
    brand: 'Nucala',
    target: 'IL-5',
    color: '#ef4444',
    trials: ['SYNAPSE'],
    dosing: '100 mg subcutáneo cada 4 semanas',
    cross: ['Asma eosinofílica grave', 'Granulomatosis eosinofílica con poliangeítis (EGPA)', 'Síndrome hipereosinofílico'],
    aemps: {
      financed: true,
      since: '2023',
      conditions: 'Primer biológico financiado en España para CRSwNP (2023). Diagnóstico hospitalario (DH). Eficacia mayor con eosinofilia ≥500/µL (subanálisis SYNAPSE, Bachert 2022).',
      prescriptionType: 'DH',
      cima: 'https://cima.aemps.es/cima/publico/lista.html?nombre=nucala',
    },
    notes:
      'Eficacia que crece con la eosinofilia (Bachert 2022): preferente con eos ≥500/µL. ' +
      'Limitado en perfil T2-low (<150/µL). ' +
      'Indicación cruzada en EGPA e hipereosinofilia (relevante con eos >1500/µL).',
  },
};

export const BIOLOGIC_ORDER = ['dupilumab', 'tezepelumab', 'omalizumab', 'mepolizumab'];

// ─────────────────────────────────────────────────────────────────────────
// Criterios de indicación: dos guías
//   · POLINA 2.0 (Alobid 2023, JIACI) — uso preferente en España
//   · EPOS / EUFOREA 2023 — uso internacional
// Estructura común: requisito previo de cirugía + 5 criterios (≥3).
// Diferencia clave (Golet 2025, Acta Otorrinolaringol Esp): POLINA es más
// restrictiva — solo ~32% de pacientes elegibles vs 57% con EPOS.
// ─────────────────────────────────────────────────────────────────────────

export const GUIDES = {
  EUFOREA: {
    id: 'EUFOREA',
    name: 'EPOS / EUFOREA 2023',
    label: 'Internacional',
    snotThreshold: 40,
    surgeriesRequired: 1,
  },
  POLINA: {
    id: 'POLINA',
    name: 'POLINA 2.0',
    label: 'España',
    snotThreshold: 50,
    surgeriesRequired: 2,
  },
};

export function evaluatePatient(p, guideId = 'POLINA') {
  const g = GUIDES[guideId] || GUIDES.POLINA;

  const surgeryReq = {
    id: 'surgery',
    label:
      g.id === 'POLINA'
        ? '≥2 cirugías endoscópicas previas o contraindicación'
        : '≥1 cirugía endoscópica previa o contraindicación',
    met: p.priorSurgeries >= g.surgeriesRequired || p.scsContraindication,
    detail:
      g.id === 'POLINA'
        ? 'POLINA exige dos cirugías endoscópicas adecuadas en España'
        : 'EUFOREA exige al menos una cirugía adecuada o contraindicación',
  };

  const t2 =
    p.eosinophils >= 150 ||
    p.ige >= 100 ||
    p.allergic ||
    p.asthma;

  const criteria = [
    {
      id: 't2',
      label: 'Inflamación tipo 2',
      met: t2,
      detail:
        g.id === 'POLINA'
          ? 'Obligatoria en POLINA. Eos ≥150/µL, IgE elevada, alergia o asma'
          : 'Eos ≥150/µL, IgE elevada, alergia o asma',
      mandatory: g.id === 'POLINA',
    },
    {
      id: 'scs',
      label: 'Necesidad de corticoides sistémicos',
      met: p.scsCourses >= 2 || p.scsContraindication,
      detail: '≥2 ciclos al año o contraindicación a corticoides sistémicos',
    },
    {
      id: 'qol',
      label: 'Impacto significativo en calidad de vida',
      met: p.snot22 >= g.snotThreshold,
      detail: `SNOT-22 ≥${g.snotThreshold} (${g.id === 'POLINA' ? 'umbral POLINA — obligatorio' : 'umbral EUFOREA 2023'})`,
      mandatory: g.id === 'POLINA',
    },
    {
      id: 'smell',
      label: 'Pérdida de olfato',
      met: p.smellVAS >= 4,
      detail: 'VAS de pérdida de olfato ≥4 (hiposmia/anosmia clínicamente relevante)',
    },
    {
      id: 'asthma',
      label: 'Asma comórbida',
      met: p.asthma,
      detail: 'Asma diagnosticada, especialmente moderada-grave',
    },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  const t2Met = criteria.find((c) => c.id === 't2').met;
  const indicated =
    surgeryReq.met &&
    metCount >= 3 &&
    (g.id === 'POLINA' ? t2Met : true);

  return { guide: g, surgeryReq, criteria, metCount, indicated };
}

// ─────────────────────────────────────────────────────────────────────────
// Estado inicial — todos los toggles en false, sliders en 0.
// ─────────────────────────────────────────────────────────────────────────

export const EMPTY_PATIENT = {
  age: 50,
  eosinophils: 0,
  ige: 0,
  asthma: false,
  allergic: false,
  nerd: false,
  atopicDermatitis: false,
  eosinophilicEsophagitis: false,
  prurigoNodular: false,
  chronicUrticaria: false,
  smellVAS: 0,
  snot22: 0,
  nps: 0,
  priorSurgeries: 0,
  scsCourses: 0,
  scsContraindication: false,
};

export const DEFAULT_PATIENT = EMPTY_PATIENT;
