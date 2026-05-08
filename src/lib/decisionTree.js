// Motor determinístico de decisión para CRSwNP grave.
// Reglas en orden — primer match gana en pasos 2 y 3.
// Sin IA generativa, sin SUCRA. Cada rama produce trazabilidad explícita.
//
// Anclajes de evidencia (DOIs verificados mayo-2026):
//  · POLINA 2.0    — Alobid I et al, JIACI 2023
//  · WAYPOINT      — Lipworth BJ et al, NEJM 2025  (10.1056/NEJMoa2414482)
//  · EVEREST       — De Corso E et al, Lancet Respir Med 2025  (10.1016/S2213-2600(25)00287-5)
//  · Reappraisal   — Lipworth BJ et al, JACI Pract 2025  (10.1016/j.jaip.2025.04.012)
//  · Hopkins ITC   — Hopkins C et al, JACI Pract 2024
//  · Cai RWE       — Cai S et al, Allergy 2025  (64 RWS, 3921 pts)
//  · Bachert 2022  — subanálisis SYNAPSE  (eos ≥500 favorece mepolizumab)
//  · García-Piñero — multicéntrico España, J Clin Med 2025

import { evaluatePatient } from '../data/biologics.js';

// ─────────────────────────────────────────────────────────────────
// Reglas auxiliares de fenotipo
// ─────────────────────────────────────────────────────────────────

const isHipereos = (p) => p.eosinophils >= 1500;
const isEosHigh = (p) => p.eosinophils >= 500 && p.eosinophils < 1500;
const isAllergic = (p) => p.allergic && p.ige >= 100;
const isT2Low = (p) =>
  p.eosinophils < 150 &&
  p.ige < 100 &&
  !p.allergic;
const isAnosmiaSevere = (p) => p.smellVAS >= 7;

// ─────────────────────────────────────────────────────────────────
// Motor principal
// ─────────────────────────────────────────────────────────────────

export function runDecisionTree(patient, guideId = 'POLINA') {
  const evaluation = evaluatePatient(patient, guideId);
  const steps = [];
  const alerts = [];

  // ── PASO 1 — Elegibilidad según guía ───────────────────────────
  steps.push({
    id: 'eligibility',
    title: '¿Cumple criterios de la guía?',
    status: evaluation.indicated ? 'met' : 'unmet',
    summary: evaluation.indicated
      ? `Cumple ${evaluation.metCount}/5 criterios + cirugía previa`
      : `Sólo ${evaluation.metCount}/5 criterios o falta cirugía previa`,
    detail: evaluation.indicated
      ? `Paciente elegible para biológico según ${evaluation.guide.name}.`
      : `No cumple los requisitos de ${evaluation.guide.name}. Antes de plantear biológico hay que: ${listMissing(evaluation)}.`,
    evaluation,
  });

  if (!evaluation.indicated) {
    return {
      steps,
      eligible: false,
      primary: null,
      alternative: null,
      avoid: [],
      alerts,
      evaluation,
    };
  }

  // ── Alerta hipereosinofilia (descartar EGPA) ───────────────────
  if (isHipereos(patient)) {
    alerts.push({
      severity: 'warn',
      text: `Eosinofilia muy alta (${patient.eosinophils}/µL). Antes de iniciar biológico, descartar granulomatosis eosinofílica con poliangeítis (EGPA), síndrome hipereosinofílico u otras causas sistémicas. Cautela específica con dupilumab por riesgo de eosinofilia paradójica.`,
    });
  }

  // ── Alerta IgE muy baja con omalizumab fuera ───────────────────
  if (patient.ige > 0 && patient.ige < 30) {
    alerts.push({
      severity: 'info',
      text: `IgE muy baja (${patient.ige} UI/mL): omalizumab pierde fundamento mecanístico y no se considera en este caso.`,
    });
  }

  // ── PASO 2 — Indicación cruzada (anchor priority) ──────────────
  const anchor = resolveAnchor(patient);
  steps.push({
    id: 'crossIndication',
    title: '¿Hay indicación cruzada que decante?',
    status: anchor ? 'triggered' : 'none',
    summary: anchor
      ? `Sí — ${anchor.label} ⇒ ${capitalize(anchor.biologic)}`
      : 'No hay indicación cruzada activa',
    detail: anchor
      ? `Cuando hay otra patología aprobada para un biológico concreto, esa indicación cruzada decanta la elección y simplifica financiación. ${anchor.detail}`
      : 'Si el paciente tuviera dermatitis atópica moderada-grave, esofagitis eosinofílica, prurigo nodular o urticaria crónica espontánea, la decisión vendría dada. Como no es el caso, seguimos con el fenotipo.',
    anchor,
  });

  if (anchor) {
    return finalize({
      steps,
      evaluation,
      alerts,
      patient,
      primaryId: anchor.biologic,
      primaryReasons: [anchor.detail],
      alternativeId: anchor.alternative,
      alternativeReasons: anchor.alternativeReasons,
      branchLabel: 'Indicación cruzada',
    });
  }

  // ── PASO 3 — Fenotipo predominante ─────────────────────────────
  const branch = resolvePhenotype(patient);
  steps.push({
    id: 'phenotype',
    title: 'Fenotipo predominante',
    status: 'resolved',
    summary: `${branch.label} ⇒ ${capitalize(branch.biologic)}`,
    detail: branch.detail,
    branch,
  });

  return finalize({
    steps,
    evaluation,
    alerts,
    patient,
    primaryId: branch.biologic,
    primaryReasons: branch.reasons,
    alternativeId: branch.alternative,
    alternativeReasons: branch.alternativeReasons,
    branchLabel: branch.label,
  });
}

// ─────────────────────────────────────────────────────────────────
// Paso 2 — anchors por indicación cruzada
// ─────────────────────────────────────────────────────────────────

function resolveAnchor(p) {
  if (p.atopicDermatitis) {
    return {
      label: 'Dermatitis atópica moderada-grave',
      biologic: 'dupilumab',
      detail:
        'La dermatitis atópica moderada-grave es indicación FDA/EMA de dupilumab y aporta beneficio dual con la poliposis. La financiación cruzada y la experiencia clínica acumulada lo convierten en primera opción.',
      alternative: 'tezepelumab',
      alternativeReasons: [
        'Si dupilumab está contraindicado o produce conjuntivitis severa, tezepelumab cubre asma comórbida y poliposis pero sin acción cutánea.',
      ],
    };
  }
  if (p.eosinophilicEsophagitis) {
    return {
      label: 'Esofagitis eosinofílica',
      biologic: 'dupilumab',
      detail:
        'Dupilumab está aprobado FDA/EMA en esofagitis eosinofílica y poliposis. Con ambas patologías, un único biológico cubre las dos dianas.',
      alternative: 'tezepelumab',
      alternativeReasons: ['Tezepelumab cubre poliposis y asma; no actúa sobre EoE.'],
    };
  }
  if (p.prurigoNodular) {
    return {
      label: 'Prurigo nodular',
      biologic: 'dupilumab',
      detail:
        'Prurigo nodular es indicación cruzada de dupilumab. La elección es directa.',
      alternative: 'tezepelumab',
      alternativeReasons: ['Tezepelumab no tiene indicación en prurigo nodular.'],
    };
  }
  if (p.chronicUrticaria) {
    return {
      label: 'Urticaria crónica espontánea',
      biologic: 'omalizumab',
      detail:
        'Urticaria crónica espontánea es la indicación cruzada con más experiencia con omalizumab. Cubre ambas patologías con un único biológico.',
      alternative: 'dupilumab',
      alternativeReasons: [
        'Si la respuesta poliposa a omalizumab fuera insuficiente y la urticaria estuviera controlada, dupilumab es la siguiente línea (EVEREST 2025: dupi > omali en CRSwNP+asma).',
      ],
    };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────
// Paso 3 — fenotipo predominante (orden de prioridad)
// ─────────────────────────────────────────────────────────────────

function resolvePhenotype(p) {
  // EREA / N-ERD primero (clínica fenotipo muy específico)
  if (p.nerd) {
    return {
      key: 'erea',
      label: 'EREA / N-ERD',
      biologic: 'dupilumab',
      detail:
        'Dupilumab es el biológico con mejor evidencia en EREA/N-ERD: actúa sobre la vía IL-4/IL-13 que está hiperactivada en la enfermedad respiratoria exacerbada por AINE (Lipworth Reappraisal 2025).',
      reasons: [
        'EREA/N-ERD: dupilumab es la opción con más evidencia en esta tríada (Lipworth Reappraisal 2025, DOI: 10.1016/j.jaip.2025.04.012).',
        'Beneficio dual sobre poliposis y asma comórbida.',
      ],
      alternative: 'tezepelumab',
      alternativeReasons: [
        'Tezepelumab es alternativa razonable si dupilumab falla o se contraindica: actúa upstream sobre TSLP y cubre asma de cualquier fenotipo (WAYPOINT, NEJM 2025).',
      ],
    };
  }

  // Hipereosinofilia (≥1500): mepolizumab preferente, cautela dupi
  if (isHipereos(p)) {
    return {
      key: 'hipereos',
      label: `Hipereosinofilia (${p.eosinophils}/µL)`,
      biologic: 'mepolizumab',
      detail:
        'Con eosinofilia >1500/µL, anti-IL-5 (mepolizumab) es preferente porque también es el biológico de elección en EGPA y síndrome hipereosinofílico. Dupilumab queda en cautela por riesgo de eosinofilia paradójica al inicio.',
      reasons: [
        `Eosinófilos ${p.eosinophils}/µL: anti-IL-5 actúa directamente sobre la diana del exceso celular.`,
        'Indicación cruzada de mepolizumab en EGPA e hipereosinofilia: si esas entidades aparecen en el screening, este biológico también cubre.',
        'Subanálisis SYNAPSE (Bachert 2022): eficacia de mepolizumab crece con la eosinofilia.',
      ],
      alternative: 'tezepelumab',
      alternativeReasons: [
        'Tezepelumab es opción razonable por mecanismo upstream (bloquea TSLP, reduce eosinófilos sin actuar directamente sobre IL-5).',
        'Reservar dupilumab a 2ª línea por riesgo de eosinofilia paradójica al inicio en este perfil.',
      ],
    };
  }

  // Eos alta (500-1500) + asma: mepo o dupi (Hopkins ITC dupi superior, pero mepo bien indicado)
  if (isEosHigh(p) && p.asthma) {
    return {
      key: 'eos500_asma',
      label: `Eosinofilia ≥500/µL con asma (${p.eosinophils}/µL)`,
      biologic: 'mepolizumab',
      detail:
        'En eosinofilia ≥500/µL con asma comórbida, mepolizumab es el biológico de elección por subanálisis SYNAPSE (Bachert 2022): la eficacia crece con la eosinofilia. García-Piñero 2025 (multicéntrico España) confirma el dato en práctica real.',
      reasons: [
        `Eosinófilos ${p.eosinophils}/µL: subgrupo de mejor respuesta a mepolizumab (Bachert 2022).`,
        'Datos españoles reales (García-Piñero 2025, J Clin Med, 5 hospitales): reducción NPS −2.56 y SNOT-22 −25.3 a los 6 meses.',
        'Asma eosinofílica grave: indicación cruzada que refuerza la elección.',
      ],
      alternative: 'dupilumab',
      alternativeReasons: [
        'Dupilumab es alternativa válida y, según ITC Hopkins 2024, supera a mepolizumab en NPS y SNOT-22 a 24-52 semanas.',
        'Considera dupilumab si predomina la afectación poliposa/olfato sobre la eosinofilia o si hay anosmia muy marcada.',
      ],
    };
  }

  // Alérgico + IgE alta + asma alérgica: dupi primary (EVEREST), omali alternativa
  if (isAllergic(p) && p.asthma) {
    return {
      key: 'allergic_asthma',
      label: `Perfil alérgico con IgE ${p.ige} UI/mL y asma`,
      biologic: 'dupilumab',
      detail:
        'EVEREST 2025 (Lancet Respir Med, head-to-head fase IV): dupilumab fue superior a omalizumab en TODOS los endpoints (NPS −1.60, UPSIT +8.0) en pacientes con CRSwNP+asma alérgica. Omalizumab queda como alternativa si hay urticaria crónica concomitante.',
      reasons: [
        'EVEREST 2025 (DOI: 10.1016/S2213-2600(25)00287-5): dupilumab > omalizumab en CRSwNP con asma, en los dos endpoints primarios y todos los secundarios.',
        'Beneficio dual asegurado sobre asma tipo 2 y poliposis.',
        'Sin restricción de dosificación por peso/IgE (a diferencia de omalizumab).',
      ],
      alternative: 'omalizumab',
      alternativeReasons: [
        'Omalizumab sigue siendo alternativa razonable cuando hay urticaria crónica espontánea o si la dosificación específica por IgE/peso encaja mejor con la pauta del paciente.',
      ],
    };
  }

  // Anosmia severa sin otros decantes
  if (isAnosmiaSevere(p)) {
    return {
      key: 'anosmia',
      label: `Anosmia/hiposmia severa (VAS ${p.smellVAS})`,
      biologic: 'dupilumab',
      detail:
        'Lipworth Reappraisal 2025: dupilumab y tezepelumab son los biológicos con mayor recuperación de olfato. Cai RWE 2025 (64 estudios, 3921 pacientes) confirma el dato en vida real con dupilumab.',
      reasons: [
        'Mejor evidencia de recuperación olfatoria en CRSwNP (Lipworth Reappraisal 2025).',
        'Cai 2025 (Allergy, RWE meta-análisis): dupilumab destaca particularmente en olfato y SNOT-22.',
      ],
      alternative: 'tezepelumab',
      alternativeReasons: [
        'Tezepelumab: WAYPOINT NEJM 2025 mostró mejora UPSIT y reducción casi total de cirugía (0.5% vs 22.1%). Alternativa fuerte si dupilumab no es opción.',
      ],
    };
  }

  // T2-low estricto: eos<150, IgE<100, no alergia
  if (isT2Low(p)) {
    return {
      key: 't2low',
      label: `T2-low (eos ${p.eosinophils}/µL · IgE ${p.ige} UI/mL · sin alergia)`,
      biologic: 'tezepelumab',
      detail:
        'Tezepelumab es el único biológico T2-agnóstico: actúa upstream sobre TSLP y mantiene eficacia con eosinofilia baja, IgE baja y sin alergia documentada. WAYPOINT NEJM 2025 mostró NPS −2.07, congestión −1.03, SNOT-22 −27.26 y reducción 98% de la necesidad de cirugía.',
      reasons: [
        'Único biológico aprobado con eficacia demostrada en perfil T2-low.',
        'WAYPOINT 2025 (DOI: 10.1056/NEJMoa2414482): reducción de cirugía 0.5% vs 22.1% placebo (HR 0.02).',
        'Disponible en España desde 30-mar-2026 con financiación SNS aprobada por CIPM 28-ene-2026.',
      ],
      alternative: 'dupilumab',
      alternativeReasons: [
        'Dupilumab pierde fuerza relativa en T2-low pero sigue siendo alternativa con beneficio sobre la inflamación tipo 2 residual.',
      ],
    };
  }

  // Default — sin marcadores claros, dupilumab por mayor evidencia
  return {
    key: 'default',
    label: 'Perfil tipo 2 sin decantante claro',
    biologic: 'dupilumab',
    detail:
      'Sin un fenotipo predominante claro, dupilumab es el biológico con más evidencia robusta en CRSwNP (Cai 2025 RWE, 64 estudios reales en 3921 pacientes). Buen balance entre eficacia poliposa, olfato, calidad de vida y experiencia clínica acumulada.',
    reasons: [
      'Dupilumab: mayor volumen de evidencia y experiencia clínica acumulada (Cai 2025 RWE, Allergy).',
      'Buen perfil sobre poliposis, olfato y SNOT-22.',
    ],
    alternative: 'tezepelumab',
    alternativeReasons: [
      'Tezepelumab es alternativa razonable si dupilumab no encaja por contraindicación, conjuntivitis severa o tolerancia.',
    ],
  };
}

// ─────────────────────────────────────────────────────────────────
// Construcción del paso 4 (recomendación) y avoid
// ─────────────────────────────────────────────────────────────────

function finalize({
  steps,
  evaluation,
  alerts,
  patient,
  primaryId,
  primaryReasons,
  alternativeId,
  alternativeReasons,
  branchLabel,
}) {
  const avoid = buildAvoidList(patient, primaryId, alternativeId);

  steps.push({
    id: 'recommendation',
    title: 'Recomendación priorizada',
    status: 'final',
    summary: `${capitalize(primaryId)} (vía «${branchLabel}»)`,
    detail: 'Síntesis del paciente, AEMPS y razones activas en el panel de la derecha.',
    primaryId,
    alternativeId,
  });

  return {
    steps,
    eligible: true,
    primary: { id: primaryId, reasons: primaryReasons },
    alternative: { id: alternativeId, reasons: alternativeReasons },
    avoid,
    alerts,
    evaluation,
  };
}

function buildAvoidList(p, primaryId, alternativeId) {
  const avoid = [];
  const exclude = (id) => id === primaryId || id === alternativeId;

  // Mepolizumab en T2-low estricto
  if (!exclude('mepolizumab') && p.eosinophils > 0 && p.eosinophils < 150 && !p.asthma && !p.allergic) {
    avoid.push({
      id: 'mepolizumab',
      reason: `Eosinofilia muy baja (${p.eosinophils}/µL) y sin asma/alergia: anti-IL-5 con eficacia reducida en NPS y olfato.`,
    });
  }

  // Omalizumab con IgE muy baja o sin componente alérgico
  if (!exclude('omalizumab') && (p.ige > 0 && p.ige < 30) && !p.allergic) {
    avoid.push({
      id: 'omalizumab',
      reason: `IgE ${p.ige} UI/mL y sin alergia documentada: omalizumab pierde fundamento mecanístico.`,
    });
  }

  // Cautela dupilumab con hipereosinofilia
  if (!exclude('dupilumab') && p.eosinophils >= 1500) {
    avoid.push({
      id: 'dupilumab',
      reason: `Eosinofilia ${p.eosinophils}/µL: cautela por riesgo de eosinofilia paradójica al inicio. Antes de plantearlo, descartar EGPA / síndrome hipereosinofílico.`,
    });
  }

  return avoid;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function listMissing(evaluation) {
  const missing = [];
  if (!evaluation.surgeryReq.met) missing.push(evaluation.surgeryReq.label.toLowerCase());
  evaluation.criteria.filter((c) => !c.met).forEach((c) => {
    missing.push(c.label.toLowerCase() + (c.mandatory ? ' (obligatorio)' : ''));
  });
  return missing.length ? missing.join(', ') : 'cumplir los criterios mínimos';
}

function capitalize(id) {
  if (!id) return '';
  return id[0].toUpperCase() + id.slice(1);
}
