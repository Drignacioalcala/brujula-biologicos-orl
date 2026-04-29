// Netlify Function — proxy a Gemini 2.5 Flash.
// Recibe { patient, ranking, evaluation, guideId } y devuelve { text }.
// La API key se guarda en GEMINI_API_KEY (variable de entorno de Netlify),
// nunca se expone al cliente.

const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const NAMES = {
  dupilumab: 'Dupilumab',
  tezepelumab: 'Tezepelumab',
  omalizumab: 'Omalizumab',
  mepolizumab: 'Mepolizumab',
};

const DOMAIN_LABEL = {
  nps: 'reducción del pólipo',
  snot22: 'calidad de vida',
  smell: 'recuperación del olfato',
  congestion: 'descongestión',
  comorbidity: 'beneficio sistémico',
};

function smellLabel(vas) {
  if (vas === 0) return 'olfato normal';
  if (vas <= 3) return `pérdida olfato leve (VAS ${vas})`;
  if (vas <= 6) return `hiposmia moderada (VAS ${vas})`;
  return `anosmia o pérdida grave (VAS ${vas})`;
}

function buildPrompt(patient, ranking, evaluation, guideId) {
  const traits = [];

  // Eosinofilia con interpretación clínica
  if (patient.eosinophils >= 1500) {
    traits.push(`hipereosinofilia (${patient.eosinophils}/µL — descartar EGPA y síndrome hipereosinofílico)`);
  } else if (patient.eosinophils >= 500) {
    traits.push(`eosinofilia alta (${patient.eosinophils}/µL)`);
  } else if (patient.eosinophils >= 300) {
    traits.push(`eosinofilia moderada (${patient.eosinophils}/µL)`);
  } else if (patient.eosinophils > 0 && patient.eosinophils < 150) {
    traits.push(`eosinofilia baja (${patient.eosinophils}/µL — perfil T2-low)`);
  } else if (patient.eosinophils > 0) {
    traits.push(`eosinófilos ${patient.eosinophils}/µL`);
  }

  // IgE
  if (patient.allergic && patient.ige >= 100) {
    traits.push(`alergia documentada con IgE elevada (${patient.ige} UI/mL)`);
  } else if (patient.ige > 0 && patient.ige < 30) {
    traits.push(`IgE baja (${patient.ige} UI/mL)`);
  } else if (patient.ige > 0) {
    traits.push(`IgE ${patient.ige} UI/mL`);
  }

  // Comorbilidades respiratorias
  if (patient.asthma) traits.push('asma comórbida');
  if (patient.nerd) traits.push('EREA / N-ERD');

  // Indicaciones cruzadas
  if (patient.atopicDermatitis) traits.push('dermatitis atópica concomitante');
  if (patient.eosinophilicEsophagitis) traits.push('esofagitis eosinofílica concomitante');
  if (patient.prurigoNodular) traits.push('prurigo nodular concomitante');
  if (patient.chronicUrticaria) traits.push('urticaria crónica espontánea concomitante');
  if (patient.copdEosinophilic) traits.push('EPOC eosinofílica concomitante');

  // Olfato y QoL
  traits.push(smellLabel(patient.smellVAS));
  traits.push(`SNOT-22 ${patient.snot22}`);
  traits.push(`NPS ${patient.nps}/8`);

  // Tratamientos previos
  if (patient.priorSurgeries > 0) traits.push(`${patient.priorSurgeries} cirugías endoscópicas previas`);
  if (patient.scsCourses >= 2) traits.push(`${patient.scsCourses} ciclos/año de corticoides sistémicos`);
  if (patient.scsContraindication) traits.push('contraindicación a corticoides sistémicos');

  const rankingDetail = ranking
    .map((r, i) => {
      const top = Object.entries(r.scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k]) => DOMAIN_LABEL[k])
        .join(' y ');
      return `${i + 1}º ${NAMES[r.id]} (${Math.round(r.overall * 100)}/100, destaca en ${top})`;
    })
    .join('\n');

  const notMet = evaluation.criteria.filter((c) => !c.met).map((c) => c.label).join(', ') || 'ninguno';
  const surgeryMet = evaluation.surgeryReq.met ? 'sí' : 'no';
  const guideName = guideId === 'POLINA' ? 'POLINA (España)' : 'EPOS / EUFOREA 2023 (internacional)';

  return `Eres un otorrinolaringólogo experto en rinología y biológicos para poliposis nasal grave (CRSwNP), comentando un caso a un colega de la SEORL.

PERFIL DEL PACIENTE
${traits.join('; ')}.

GUÍA APLICADA: ${guideName}
Cumple ${evaluation.metCount}/5 criterios. Criterios NO cumplidos: ${notMet}.
Requisito de cirugía previa cumplido: ${surgeryMet} (${evaluation.surgeryReq.label}).
Indicación de biológico según esta guía: ${evaluation.indicated ? 'SÍ' : 'NO'}.

RANKING DEL ALGORITMO (SUCRA de meta-análisis en red ajustado al fenotipo)
${rankingDetail}

TAREA
Redacta UN SOLO PÁRRAFO COMPLETO de 130-170 palabras en español de España, dirigido a otro ORL.
En ese párrafo:
1. Justifica la primera elección anclando explícitamente en 1-2 rasgos del fenotipo (eosinofilia, IgE, dermatitis atópica, EREA, T2-low, hipereosinofilia, etc.) y, cuando proceda, en su mecanismo de acción o en su indicación cruzada por otra patología que tenga el paciente.
2. Razona por qué el segundo biológico es alternativa válida (qué situación lo elegiría).
3. Explica brevemente por qué los otros dos quedan por detrás en este caso concreto, sin descalificarlos.
4. Si hay alguna alerta clínica relevante, MENCIÓNALA AL FINAL del párrafo:
   - Eosinofilia >1500: descartar EGPA / síndrome hipereosinofílico antes de iniciar; cautela con dupilumab por eosinofilia paradójica.
   - Criterios de la guía no cumplidos (especialmente cirugía previa o T2 obligatorio en POLINA).
   - Comorbilidad cruzada que decanta otro biológico.

REGLAS ESTRICTAS
- Un único párrafo, fluido, sin listas ni viñetas, sin saltos de línea internos.
- TERMINA TODAS LAS FRASES — no dejes ninguna a medias.
- No repitas literalmente cifras del SUCRA ni el ranking.
- No añadas disclaimers genéricos ni "consultar guías" ni "valoración individualizada".
- Tono profesional y directo, registro SEORL, sin marketing.
- Si el caso NO cumple indicación según la guía aplicada, dilo con claridad al inicio.`;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY no configurada en Netlify' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const body = await req.json();
  const { patient, ranking, evaluation, guideId } = body || {};
  if (!patient || !ranking || !evaluation) {
    return new Response(JSON.stringify({ error: 'Payload incompleto' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const prompt = buildPrompt(patient, ranking, evaluation, guideId || 'POLINA');

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.55,
        topP: 0.92,
        maxOutputTokens: 1500,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return new Response(JSON.stringify({ error: `Gemini ${res.status}: ${errText}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim() || '';

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
