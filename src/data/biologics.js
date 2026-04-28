// Datos basales de los 4 biológicos aprobados para CRSwNP.
// Las puntuaciones por dominio son adaptaciones de los SUCRA publicados
// (Xu 2025, Safia 2025, Cai 2022, Wu 2021) escaladas a 0–1.
// Tezepelumab se calibra con WAYPOINT (Lipworth 2025, NEJM 2024).
// La calidad de evidencia para algunos cruces es baja: la herramienta
// es de apoyo a la decisión, no sustituye el juicio clínico.

export const DOMAINS = [
  { id: 'nps',         label: 'Tamaño pólipo (NPS)' },
  { id: 'snot22',      label: 'Calidad de vida (SNOT-22)' },
  { id: 'smell',       label: 'Olfato (UPSIT)' },
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
    trials: ['SINUS-24', 'SINUS-52'],
    dosing: '300 mg subcutáneo cada 2 semanas',
    notes: 'Indicación adicional en asma tipo 2, dermatitis atópica, EREA y EoE.',
  },
  tezepelumab: {
    id: 'tezepelumab',
    name: 'Tezepelumab',
    target: 'TSLP (linfopoyetina estromal tímica, vía superior)',
    color: '#10b981',
    base: { nps: 0.72, snot22: 0.70, smell: 0.75, congestion: 0.65, comorbidity: 0.90 },
    trials: ['WAYPOINT (NEJM 2024)'],
    dosing: '210 mg subcutáneo cada 4 semanas',
    notes: 'Eficaz independientemente de eosinofilia o IgE; útil en T2-low y asma de cualquier fenotipo.',
  },
  omalizumab: {
    id: 'omalizumab',
    name: 'Omalizumab',
    target: 'IgE',
    color: '#f59e0b',
    base: { nps: 0.50, snot22: 0.61, smell: 0.50, congestion: 0.69, comorbidity: 0.75 },
    trials: ['POLYP 1', 'POLYP 2'],
    dosing: 'Dosis ajustada por peso e IgE total (75–600 mg cada 2–4 semanas)',
    notes: 'Mejor opción cuando predomina alergia IgE-mediada con asma alérgica.',
  },
  mepolizumab: {
    id: 'mepolizumab',
    name: 'Mepolizumab',
    target: 'IL-5',
    color: '#ef4444',
    base: { nps: 0.45, snot22: 0.55, smell: 0.30, congestion: 0.40, comorbidity: 0.85 },
    trials: ['SYNAPSE'],
    dosing: '100 mg subcutáneo cada 4 semanas',
    notes: 'Prioritario si asma eosinofílica grave + eosinofilia muy elevada.',
  },
};

export const BIOLOGIC_ORDER = ['dupilumab', 'tezepelumab', 'omalizumab', 'mepolizumab'];

// Criterios EPOS/EUFOREA 2023 (3 de 5 para indicar biológico).
export function euforeaCriteria(p) {
  const t2 =
    p.eosinophils >= 150 ||
    p.ige >= 100 ||
    p.allergic ||
    p.asthma;

  return [
    {
      id: 't2',
      label: 'Inflamación tipo 2',
      met: t2,
      detail: 'Eosinófilos ≥150/µL, IgE elevada, alergia o asma',
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
      met: p.snot22 >= 40,
      detail: 'SNOT-22 ≥40',
    },
    {
      id: 'smell',
      label: 'Pérdida de olfato',
      met: p.anosmia >= 1,
      detail: 'Hiposmia o anosmia documentada',
    },
    {
      id: 'asthma',
      label: 'Asma comórbida',
      met: p.asthma,
      detail: 'Asma diagnosticada, especialmente moderada-grave',
    },
  ];
}

// Motor de scoring: parte de los SUCRA basales y aplica modificadores
// según el fenotipo. Devuelve scores normalizados 0–1 por dominio.
export function scoreBiologic(id, p) {
  const base = BIOLOGICS[id].base;
  const s = { ...base };

  // Eosinofilia
  if (p.eosinophils >= 300) {
    if (id === 'mepolizumab')  { s.nps += 0.15; s.comorbidity += 0.05; }
    if (id === 'dupilumab')    { s.nps += 0.05; }
    if (id === 'omalizumab')   { s.nps -= 0.05; }
  }
  if (p.eosinophils < 150) {
    if (id === 'mepolizumab')  { s.nps -= 0.25; s.smell -= 0.10; s.comorbidity -= 0.15; }
    if (id === 'tezepelumab')  { s.nps += 0.08; s.snot22 += 0.05; }
    if (id === 'dupilumab')    { s.nps -= 0.05; }
  }

  // IgE alta + alergia → omalizumab
  if (p.allergic && p.ige >= 100) {
    if (id === 'omalizumab')   { s.nps += 0.12; s.snot22 += 0.10; s.comorbidity += 0.10; }
  }
  if (p.ige < 30) {
    if (id === 'omalizumab')   { s.nps -= 0.10; s.comorbidity -= 0.10; }
  }

  // Asma comórbida
  if (p.asthma) {
    if (id === 'dupilumab')    { s.comorbidity += 0.05; }
    if (id === 'tezepelumab')  { s.comorbidity += 0.05; }
    if (id === 'mepolizumab')  { s.comorbidity += 0.05; }
    if (id === 'omalizumab' && p.allergic) { s.comorbidity += 0.05; }
  }

  // EREA / N-ERD
  if (p.nerd) {
    if (id === 'dupilumab')    { s.comorbidity += 0.10; s.snot22 += 0.05; }
    if (id === 'mepolizumab')  { s.comorbidity += 0.05; }
    if (id === 'tezepelumab')  { s.comorbidity += 0.05; }
  }

  // Dermatitis atópica → fuerte preferencia dupilumab
  if (p.atopicDermatitis) {
    if (id === 'dupilumab')    { s.comorbidity += 0.15; s.nps += 0.05; }
  }

  // Anosmia profunda
  if (p.anosmia >= 2) {
    if (id === 'dupilumab')    { s.smell += 0.05; }
    if (id === 'tezepelumab')  { s.smell += 0.05; }
    if (id === 'mepolizumab')  { s.smell -= 0.05; }
  }

  // SNOT-22 muy alto → priorizar el de mejor desempeño global
  if (p.snot22 >= 60) {
    if (id === 'dupilumab')    { s.snot22 += 0.03; }
  }

  // Cirugías múltiples sin respuesta
  if (p.priorSurgeries >= 2) {
    if (id === 'dupilumab')    { s.nps += 0.03; }
    if (id === 'tezepelumab')  { s.nps += 0.03; }
  }

  Object.keys(s).forEach((k) => {
    s[k] = Math.max(0, Math.min(1, s[k]));
  });
  return s;
}

// Score global ponderado (NPS y SNOT-22 pesan más, según prioridades clínicas).
const WEIGHTS = { nps: 0.25, snot22: 0.25, smell: 0.20, congestion: 0.15, comorbidity: 0.15 };

export function overallScore(scores) {
  return Object.entries(WEIGHTS).reduce((acc, [k, w]) => acc + (scores[k] || 0) * w, 0);
}

export function rankBiologics(p) {
  return BIOLOGIC_ORDER
    .map((id) => {
      const scores = scoreBiologic(id, p);
      return { id, scores, overall: overallScore(scores) };
    })
    .sort((a, b) => b.overall - a.overall);
}

// Paciente vacío de partida — la app no muestra ranking hasta que
// el usuario empiece a marcar datos.
export const EMPTY_PATIENT = {
  age: 50,
  eosinophils: 0,
  ige: 0,
  asthma: false,
  allergic: false,
  nerd: false,
  atopicDermatitis: false,
  anosmia: 0,        // 0 = normal, 1 = hiposmia, 2 = anosmia
  snot22: 0,
  nps: 0,
  priorSurgeries: 0,
  scsCourses: 0,
  scsContraindication: false,
};

// Alias por compatibilidad con import previo
export const DEFAULT_PATIENT = EMPTY_PATIENT;
