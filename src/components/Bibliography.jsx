import { ExternalLink, BookMarked } from 'lucide-react';

// Referencias verificadas por DOI (mayo-2026).
// Estructuradas en dos columnas: ensayos pivotales/head-to-head/RWE
// y guías + estudios españoles.

const TRIALS = [
  {
    name: 'WAYPOINT — Tezepelumab en CRSwNP grave',
    authors: 'Lipworth BJ et al. N Engl J Med 2025; 392:1178-1188',
    doi: '10.1056/NEJMoa2414482',
    note: 'Reducción del 98% en necesidad de cirugía (0.5% vs 22.1%) y SCS (5.2% vs 18.3%) frente a placebo a 52 semanas.',
  },
  {
    name: 'EVEREST — Dupilumab vs Omalizumab (head-to-head)',
    authors: 'De Corso E et al. Lancet Respir Med 2025; 13:1067-1077',
    doi: '10.1016/S2213-2600(25)00287-5',
    note: 'Primer ensayo head-to-head en respiratorio: dupilumab superior en TODOS los endpoints en CRSwNP+asma.',
  },
  {
    name: 'Reappraisal de los fase 3 (forest plots indirectos)',
    authors: 'Lipworth BJ et al. JACI Pract 2025',
    doi: '10.1016/j.jaip.2025.04.012',
    note: 'Tezepelumab y dupilumab lideran NPS, congestión, olfato y reducción de cirugía/SCS.',
  },
  {
    name: 'RWE meta-análisis (64 estudios, 3921 pacientes)',
    authors: 'Cai S et al. Allergy 2025',
    doi: '10.1111/all.16515',
    note: 'Eficacia en vida real de los 4 biológicos; dupilumab destaca en NPS, SNOT-22 y olfato.',
  },
  {
    name: 'SINUS-24 / SINUS-52 (Dupilumab pivotal)',
    authors: 'Bachert C et al. The Lancet 2019; 394:1638-1650',
    doi: '10.1016/S0140-6736(19)31881-1',
  },
  {
    name: 'POLYP 1 / POLYP 2 (Omalizumab pivotal)',
    authors: 'Gevaert P et al. J Allergy Clin Immunol 2020; 146:595-605',
    doi: '10.1016/j.jaci.2020.05.032',
  },
  {
    name: 'SYNAPSE (Mepolizumab pivotal)',
    authors: 'Han JK et al. Lancet Respir Med 2021; 9:1141-1153',
    doi: '10.1016/S2213-2600(21)00097-7',
  },
  {
    name: 'Subanálisis SYNAPSE — eosinofilia ≥500',
    authors: 'Bachert C et al. J Allergy Clin Immunol 2022; 149:1711-1721',
    doi: '10.1016/j.jaci.2021.10.040',
    note: 'La eficacia de mepolizumab crece con la eosinofilia basal — base del subgrupo preferente eos ≥500/µL.',
  },
  {
    name: 'ITC Dupilumab vs Mepolizumab',
    authors: 'Hopkins C et al. JACI Pract 2024',
    doi: '10.1016/j.jaip.2024.04.006',
    note: 'Comparación indirecta: dupilumab supera a mepolizumab en NPS, SNOT-22 y reducción de SCS/cirugía.',
  },
];

const GUIDES_AND_SPAIN = [
  {
    name: 'POLINA 2.0 — Consenso español sobre CRSwNP',
    authors: 'Alobid I et al. J Investig Allergol Clin Immunol 2023',
    doi: '10.18176/jiaci.0910',
    note: 'Documento de referencia en España. SNOT-22 ≥50, ≥2 cirugías y T2 obligatoria como criterios estrictos.',
  },
  {
    name: 'EPOS / EUFOREA 2023',
    authors: 'Fokkens WJ et al. Rhinology 2023; 61:194-202',
    doi: '10.4193/Rhin22.489',
    note: 'Estándar internacional. SNOT-22 ≥40 + cirugía o contraindicación + ≥3 de 5 criterios.',
  },
  {
    name: 'EUFOREA Expert Board (definiciones de respuesta)',
    authors: 'Bachert C et al. J Allergy Clin Immunol 2021; 147:29-36',
    doi: '10.1016/j.jaci.2020.11.013',
  },
  {
    name: 'EPOS 2020 vs POLINA 2.0 — comparación de elegibilidad',
    authors: 'Golet M et al. Acta Otorrinolaringol Esp 2025; 76:512224',
    doi: '10.1016/j.otoeng.2025.512224',
    note: 'Cohorte española (Bellvitge): 32% cumple POLINA vs 57% cumple EPOS. Restrictividad cuantificada.',
  },
  {
    name: 'Mepolizumab en vida real — multicéntrico España',
    authors: 'García-Piñero A et al. J Clin Med 2025',
    doi: '10.3390/jcm14072463',
    note: '5 hospitales españoles, 47 pacientes. NPS −2.56, SNOT-22 −25.3 a 6 meses (91% asmáticos).',
  },
  {
    name: 'Eosinófilos tisulares en práctica española',
    authors: 'Vizcarra-Melgar J et al. Front Allergy 2025',
    doi: '10.3389/falgy.2025.1549332',
    note: 'Datos POLINA en 108 pacientes (Sevilla, Barcelona): los eosinófilos en sangre — no los tisulares — predicen control y severidad.',
  },
  {
    name: 'Acreditación UINS — SEORL-CCC',
    authors: 'SEORL-CCC, programa de acreditación de Unidades de Inflamación Nasosinusal',
    doi: 'seorl.net/acreditacion-uins',
    isUrl: true,
    note: 'Centros pioneros: Valdecilla, Parc Taulí, Fundación Jiménez Díaz.',
  },
];

function RefLine({ name, authors, doi, note, isUrl }) {
  const href = isUrl ? `https://${doi}` : `https://doi.org/${doi}`;
  return (
    <li className="border-b border-slate-100 py-2 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-semibold text-rsInk">{name}</span>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          title={doi}
          className="ml-auto inline-flex flex-none items-center gap-1 rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium text-rsBlueText hover:bg-rsBlueSoft"
        >
          {isUrl ? 'Web' : 'DOI'}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="text-xs text-rsMuted">{authors}</div>
      {note && <div className="mt-0.5 text-xs text-rsInk">{note}</div>}
      <div className="mt-0.5 truncate text-[10px] font-mono text-slate-400">{doi}</div>
    </li>
  );
}

export default function Bibliography() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rsMuted">
        <BookMarked className="h-3.5 w-3.5" />
        Bibliografía sobre la que se construye el árbol
      </div>
      <h3 className="mt-1 text-base font-bold text-rsInk">
        Evidencia y guías clínicas
      </h3>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rsBlueText">
            Ensayos pivotales · head-to-head · RWE
          </div>
          <ul className="mt-2">
            {TRIALS.map((r) => <RefLine key={r.doi} {...r} />)}
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rsBlueText">
            Guías clínicas y datos españoles
          </div>
          <ul className="mt-2">
            {GUIDES_AND_SPAIN.map((r) => <RefLine key={r.doi} {...r} />)}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-rsCanvas px-3 py-2 text-xs text-rsMuted">
        El árbol aplica reglas determinísticas basadas en POLINA 2.0, EPOS/EUFOREA 2023,
        WAYPOINT (NEJM 2025), EVEREST (Lancet Respir Med 2025), Lipworth Reappraisal (JACI Pract 2025),
        Cai RWE (Allergy 2025) y datos españoles (García-Piñero, Vizcarra-Melgar, Golet 2025).
        Sin IA generativa: cada recomendación es trazable y reproducible.
      </div>
    </div>
  );
}
