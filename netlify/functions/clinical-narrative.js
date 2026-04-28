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
  const top = ranking.slice(0, 4);
  const metCount = criteria.filter((c) => c.met).length;
  const phenotype = [
    `Edad: ${patient.age} años`,
    `Eosinófilos: ${patient.eosinophils} cel/µL`,
    `IgE total: ${patient.ige} UI/mL`,
    `SNOT-22: ${patient.snot22}`,
    `NPS: ${patient.nps}/8`,
    `Olfato: ${['normal', 'hiposmia', 'anosmia'][patient.anosmia]}`,
    `Asma: ${patient.asthma ? 'sí' : 'no'}`,
    `Alergia: ${patient.allergic ? 'sí' : 'no'}`,
    `EREA / N-ERD: ${patient.nerd ? 'sí' : 'no'}`,
    `Dermatitis atópica: ${patient.atopicDermatitis ? 'sí' : 'no'}`,
    `Cirugías endoscópicas previas: ${patient.priorSurgeries}`,
    `Ciclos de corticoides sistémicos/año: ${patient.scsCourses}`,
    `Contraindicación a corticoides sistémicos: ${patient.scsContraindication ? 'sí' : 'no'}`,
  ].join('; ');

  const ranked = top
    .map((r, i) => `${i + 1}. ${NAMES[r.id]} (puntuación global ${Math.round(r.overall * 100)}/100)`)
    .join('; ');

  const criteriaText = criteria
    .map((c) => `${c.label}: ${c.met ? 'sí' : 'no'}`)
    .join('; ');

  return `Eres un especialista ORL experto en rinología y biológicos para poliposis nasal grave.
Redacta una recomendación clínica en español de España, dirigida a otro otorrinolaringólogo, en 3-4 frases breves.

FENOTIPO: ${phenotype}.
CRITERIOS EPOS/EUFOREA 2023: ${criteriaText} (cumple ${metCount}/5).
RANKING ALGORÍTMICO (basado en SUCRA de meta-análisis en red ajustado al fenotipo): ${ranked}.

Estructura tu respuesta así:
- Frase 1: por qué el primer biológico es la primera elección en este fenotipo concreto (cita 1-2 rasgos clave del paciente).
- Frase 2: por qué el segundo es alternativa razonable.
- Frase 3: por qué los otros dos quedan en segundo plano (no descalifiques, contextualiza).
- Frase 4: una alerta clínica relevante si la hay (criterios EUFOREA no cumplidos, dermatitis atópica que decanta dupilumab, EREA, T2-low, etc.).

NO repitas el ranking. NO uses listas. NO añadas disclaimers. Tono profesional, directo, sin jerga innecesaria. Máximo 130 palabras en total.`;
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
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 400,
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
