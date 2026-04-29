// Datos basales de los 4 biológicos aprobados para CRSwNP.
// Las puntuaciones por dominio son adaptaciones de los SUCRA publicados
// en los meta-análisis en red recientes (Xu 2025, Safia 2025, Cai 2022,
// Wu 2021, Wang 2024) escaladas a 0–1.
// Tezepelumab se calibra con WAYPOINT (Lipworth 2024-2025).
// La calidad de evidencia para algunos cruces es baja: la herramienta
// es de apoyo a la decisión, no sustituye el juicio clínico.

export const DOMAINS = [
  { id: 'nps',         label: 'Tamaño pólipo (NPS)' },
  { id: 'snot22',      label: 'Calidad de vida (SNOT-22)' },
  { id: 'smell',       label: 'Olfato' },
  { id: 'congestion',  label: 'Congestión nasal' },
  { id: 'comorbidity', label: 'Beneficio sistémico' },
];

export const BIOLOGICS = {
  dupilumab: {
    id: 'dupilumab',
    name: 'Dupilumab',
    target: 'IL-4Rα (bloquea IL-4 e IL-13)',
    color: '#29ADFF',
    base: { nps: 0.95, snot22: 0.92, smell: 1.00, congestion: 0.93, comorbidity: 0.85 },
    trials: ['SINUS-24', 'SINUS-52', 'EVEREST'],
    dosing: '300 mg subcutáneo cada 2 semanas',
    cross: ['Dermatitis atópica', 'Esofagitis eosinofílica', 'Prurigo nodular', 'Asma tipo 2', 'EREA'],
    notes:
      'Indicación cruzada en dermatitis atópica, EoE y prurigo nodular. ' +
      'Eosinofilia transitoria al inicio: precaución si eosinófilos basales >1500/µL.',
  },
  tezepelumab: {
    id: 'tezepelumab',
    name: 'Tezepelumab',
    target: 'TSLP (linfopoyetina estromal tímica, vía superior)',
    color: '#10b981',
    base: { nps: 0.72, snot22: 0.70, smell: 0.75, congestion: 0.65, comorbidity: 0.90 },
    trials: ['WAYPOINT (NEJM 2024-2025)'],
    dosing: '210 mg subcutáneo cada 4 semanas',
    cross: ['Asma de cualquier fenotipo (incluido T2-low)', 'EPOC eosinofílica'],
    notes:
      'Único T2-agnóstico: eficaz aunque eosinófilos e IgE estén bajos. ' +
      'Útil cuando no hay perfil eosinofílico claro o cuando dupilumab es contraindicado.',
  },
  omalizumab: {
    id: 'omalizumab',
    name: 'Omalizumab',
    target: 'IgE',
    color: '#f59e0b',
    base: { nps: 0.50, snot22: 0.61, smell: 0.50, congestion: 0.69, comorbidity: 0.75 },
    trials: ['POLYP 1', 'POLYP 2', 'EVEREST'],
    dosing: 'Dosis ajustada por peso e IgE total (75–600 mg cada 2–4 semanas)',
    cross: ['Asma alérgica grave', 'Urticaria crónica espontánea'],
    notes:
      'Mejor opción en alergia IgE-mediada con asma alérgica o urticaria crónica espontánea concomitante.',
  },
  mepolizumab: {
    id: 'mepolizumab',
    name: 'Mepolizumab',
    target: 'IL-5',
    color: '#ef4444',
    base: { nps: 0.45, snot22: 0.55, smell: 0.30, congestion: 0.40, comorbidity: 0.85 },
    trials: ['SYNAPSE'],
    dosing: '100 mg subcutáneo cada 4 semanas',
    cross: ['Asma eosinofílica grave', 'Granulomatosis eosinofílica con poliangeítis'],
    notes:
      'Eficacia que crece con la eosinofilia (Bachert 2022): preferente con eos ≥500/µL. ' +
      'Limitado en perfil T2-low (<150/µL).',
  },
};

export const BIOLOGIC_ORDER = ['dupilumab', 'tezepelumab', 'omalizumab', 'mepolizumab'];

// ─────────────────────────────────────────────────────────────────────────
// Criterios de indicación: dos guías
//   · EUFOREA / EPOS 2023  (uso internacional)
//   · POLINA  (uso preferente en España)
// Estructura común: requisito previo de cirugía + 5 criterios (≥3).
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
      detail: `SNOT-22 ≥${g.snotThreshold} (${g.id === 'POLINA' ? 'umbral POLINA' : 'umbral EUFOREA 2023'})`,
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
// Motor de scoring: parte de los SUCRA basales y aplica modificadores
// según el fenotipo. Devuelve scores normalizados 0–1 por dominio.
// ─────────────────────────────────────────────────────────────────────────

export function scoreBiologic(id, p) {
  const base = BIOLOGICS[id].base;
  const s = { ...base };
  const reasons = [];

  // ─── Eosinofilia ───
  if (p.eosinophils >= 1500) {
    if (id === 'dupilumab') {
      s.nps -= 0.15;
      s.comorbidity -= 0.10;
      reasons.push('Eosinofilia muy alta (>1500): cautela con dupilumab por riesgo de eosinofilia paradójica');
    }
    if (id === 'mepolizumab') {
      s.nps += 0.10;
      s.comorbidity += 0.05;
      reasons.push('Eosinofilia muy alta favorece anti-IL-5');
    }
    if (id === 'tezepelumab') {
      s.nps += 0.05;
      reasons.push('Eosinofilia muy alta: tezepelumab opción razonable por mecanismo upstream');
    }
  } else if (p.eosinophils >= 500) {
    if (id === 'mepolizumab') {
      s.nps += 0.12;
      s.comorbidity += 0.05;
      reasons.push('Eosinofilia ≥500: subgrupo de mejor respuesta a mepolizumab');
    }
    if (id === 'dupilumab') s.nps += 0.05;
  } else if (p.eosinophils >= 300) {
    if (id === 'mepolizumab') { s.nps += 0.10; s.comorbidity += 0.03; }
    if (id === 'dupilumab')   { s.nps += 0.05; }
    if (id === 'omalizumab')  { s.nps -= 0.05; }
  } else if (p.eosinophils < 150 && p.eosinophils > 0) {
    if (id === 'mepolizumab') {
      s.nps -= 0.25;
      s.smell -= 0.10;
      s.comorbidity -= 0.15;
      reasons.push('T2-low (<150): anti-IL-5 con eficacia reducida');
    }
    if (id === 'tezepelumab') {
      s.nps += 0.10;
      s.snot22 += 0.05;
      reasons.push('T2-low: tezepelumab eficaz con eosinofilia baja');
    }
    if (id === 'dupilumab') s.nps -= 0.05;
  }

  // ─── IgE / alergia ───
  if (p.allergic && p.ige >= 100) {
    if (id === 'omalizumab') {
      s.nps += 0.12;
      s.snot22 += 0.10;
      s.comorbidity += 0.10;
      reasons.push('Alergia documentada con IgE alta favorece omalizumab');
    }
  }
  if (p.ige < 30 && p.ige > 0) {
    if (id === 'omalizumab') {
      s.nps -= 0.10;
      s.comorbidity -= 0.10;
      reasons.push('IgE baja (<30): omalizumab pierde fundamento mecanístico');
    }
  }

  // ─── Comorbilidades ───
  if (p.asthma) {
    if (id === 'dupilumab')   s.comorbidity += 0.05;
    if (id === 'tezepelumab') s.comorbidity += 0.05;
    if (id === 'mepolizumab') s.comorbidity += 0.05;
    if (id === 'omalizumab' && p.allergic) s.comorbidity += 0.05;
  }
  if (p.nerd) {
    if (id === 'dupilumab')   { s.comorbidity += 0.10; s.snot22 += 0.05; }
    if (id === 'mepolizumab') s.comorbidity += 0.05;
    if (id === 'tezepelumab') s.comorbidity += 0.05;
  }
  // Indicaciones cruzadas que decantan claramente
  if (p.atopicDermatitis && id === 'dupilumab') {
    s.comorbidity += 0.15; s.nps += 0.05;
    reasons.push('Dermatitis atópica: dupilumab por indicación cruzada');
  }
  if (p.eosinophilicEsophagitis && id === 'dupilumab') {
    s.comorbidity += 0.18; s.nps += 0.03;
    reasons.push('Esofagitis eosinofílica: dupilumab por indicación cruzada');
  }
  if (p.prurigoNodular && id === 'dupilumab') {
    s.comorbidity += 0.12;
    reasons.push('Prurigo nodular: dupilumab por indicación cruzada');
  }
  if (p.chronicUrticaria && id === 'omalizumab') {
    s.comorbidity += 0.18;
    reasons.push('Urticaria crónica espontánea: omalizumab por indicación cruzada');
  }
  if (p.copdEosinophilic && id === 'tezepelumab') {
    s.comorbidity += 0.10;
    reasons.push('EPOC eosinofílica: tezepelumab opción reciente');
  }

  // ─── Olfato ───
  if (p.smellVAS >= 7) {
    if (id === 'dupilumab')   s.smell += 0.05;
    if (id === 'tezepelumab') s.smell += 0.05;
    if (id === 'mepolizumab') s.smell -= 0.05;
  }

  // ─── Carga de QoL muy alta ───
  if (p.snot22 >= 60) {
    if (id === 'dupilumab') s.snot22 += 0.03;
  }

  // ─── Cirugías repetidas ───
  if (p.priorSurgeries >= 2) {
    if (id === 'dupilumab')   s.nps += 0.03;
    if (id === 'tezepelumab') s.nps += 0.03;
  }

  Object.keys(s).forEach((k) => {
    s[k] = Math.max(0, Math.min(1, s[k]));
  });
  return { scores: s, reasons };
}

const WEIGHTS = { nps: 0.25, snot22: 0.25, smell: 0.20, congestion: 0.15, comorbidity: 0.15 };

export function overallScore(scores) {
  return Object.entries(WEIGHTS).reduce((acc, [k, w]) => acc + (scores[k] || 0) * w, 0);
}

export function rankBiologics(p) {
  return BIOLOGIC_ORDER
    .map((id) => {
      const { scores, reasons } = scoreBiologic(id, p);
      return { id, scores, reasons, overall: overallScore(scores) };
    })
    .sort((a, b) => b.overall - a.overall);
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
  copdEosinophilic: false,
  smellVAS: 0,         // 0 = olfato normal · 10 = pérdida total
  snot22: 0,
  nps: 0,
  priorSurgeries: 0,
  scsCourses: 0,
  scsContraindication: false,
};

export const DEFAULT_PATIENT = EMPTY_PATIENT;
