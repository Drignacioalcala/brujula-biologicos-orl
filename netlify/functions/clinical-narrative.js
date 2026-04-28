// Netlify Function — proxy a Gemini 2.5 Flash.
// Recibe { patient, ranking, criteria } y devuelve { text }.
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

function buildPrompt(patient, ranking, criteria) {
  const metCount = criteria.filter((c) => c.met).length;
  const notMet = criteria.filter((c) => !c.met).map((c) => c.label).join(', ') || 'ninguno';

  // Rasgos fenotípicos en lenguaje natural, solo los relevantes.
  const traits = [];
  if (patient.eosinophils >= 300) traits.push(`eosinofilia marcada (${patient.eosinophils}/µL)`);
  else if (patient.eosinophils < 150) traits.push(`eosinofilia baja (${patient.eosinophils}/µL, perfil T2-low)`);
  else traits.push(`eosinófilos ${patient.eosinophils}/µL`);

  if (patient.allergic && patient.ige >= 100) traits.push(`alergia documentada con IgE elevada (${patient.ige} UI/mL)`);
  else if (patient.ige < 30) traits.push(`IgE baja (${patient.ige} UI/mL)`);
  else traits.push(`IgE ${patient.ige} UI/mL`);

  if (patient.asthma) traits.push('asma comórbida');
  if (patient.nerd) traits.push('EREA / enfermedad respiratoria exacerbada por AINE');
  if (patient.atopicDermatitis) traits.push('dermatitis atópica concomitante');
  if (patient.anosmia === 2) traits.push('anosmia');
  else if (patient.anosmia === 1) traits.push('hiposmia');

  traits.push(`SNOT-22 ${patient.snot22}`);
  traits.push(`NPS ${patient.nps}/8`);
  if (patient.priorSurgeries >= 2) traits.push(`${patient.priorSurgeries} cirugías endoscópicas previas`);
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

  return `Eres un otorrinolaringólogo experto en rinología y biológicos para poliposis nasal grave (CRSwNP), comentando un caso a un colega.

PERFIL DEL PACIENTE
${traits.join('; ')}.

CRITERIOS EPOS/EUFOREA 2023
Cumple ${metCount}/5. Criterios NO cumplidos: ${notMet}.

RANKING DEL ALGORITMO (SUCRA de meta-análisis en red ajustado al fenotipo)
${rankingDetail}

TAREA
Redacta UN SOLO PÁRRAFO de 110-140 palabras en español de España, dirigido a otro ORL. En ese párrafo:
1. Justifica la primera elección anclando explícitamente en 1-2 rasgos del fenotipo (eosinofilia, IgE, dermatitis atópica, EREA, T2-low, etc.) y, cuando proceda, en su mecanismo de acción.
2. Razona por qué el segundo biológico es alternativa válida (qué situación lo elegiría).
3. Explica brevemente por qué los otros dos quedan por detrás en este caso concreto, sin descalificarlos.
4. Si hay una alerta clínica relevante (criterios EUFOREA no cumplidos, perfil T2-low que limita anti-IL-5, dermatitis atópica que decanta dupilumab, EREA, IgE muy baja para omalizumab, eosinófilos muy bajos para mepolizumab), inclúyela al final del párrafo.

REGLAS
- Un único párrafo, fluido, sin listas ni viñetas.
- No repitas literalmente el ranking ni cifras del SUCRA.
- No añadas disclaimers ni recomiendes "consultar guías".
- Tono profesional y directo, registro SEORL.
- Si el caso NO cumple criterios EUFOREA (≥3/5), dilo con claridad.`;
}

const DOMAIN_LABEL = {
  nps: 'reducción del pólipo',
  snot22: 'calidad de vida',
  smell: 'recuperación del olfato',
  congestion: 'descongestión',
  comorbidity: 'beneficio sistémico',
};

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
  const { patient, ranking, criteria } = body || {};
  if (!patient || !ranking || !criteria) {
    return new Response(JSON.stringify({ error: 'Payload incompleto' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const prompt = buildPrompt(patient, ranking, criteria);

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
