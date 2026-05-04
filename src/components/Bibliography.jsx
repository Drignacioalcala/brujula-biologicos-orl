import { ExternalLink, BookMarked } from 'lucide-react';

const PIVOTAL = [
  { biologic: 'Dupilumab', name: 'SINUS-24 / SINUS-52', authors: 'Bachert C et al. The Lancet 2019; 394:1638-1650', doi: '10.1016/S0140-6736(19)31881-1' },
  { biologic: 'Dupilumab vs Omalizumab', name: 'EVEREST', authors: 'Bachert C et al. Lancet Respir Med 2025', doi: '10.1016/S2213-2600(25)00287-5' },
  { biologic: 'Omalizumab', name: 'POLYP 1 / POLYP 2', authors: 'Gevaert P et al. J Allergy Clin Immunol 2020; 146:595-605', doi: '10.1016/j.jaci.2020.05.032' },
  { biologic: 'Mepolizumab', name: 'SYNAPSE', authors: 'Han JK et al. Lancet Respir Med 2021; 9:1141-1153', doi: '10.1016/S2213-2600(21)00097-7' },
  { biologic: 'Mepolizumab — subgrupos', name: 'Subanálisis SYNAPSE', authors: 'Bachert C et al. J Allergy Clin Immunol 2022; 149:1711-1721', doi: '10.1016/j.jaci.2021.10.040' },
  { biologic: 'Tezepelumab', name: 'WAYPOINT', authors: 'Lipworth BJ et al. N Engl J Med 2024-2025; 392:1119-1130', doi: '10.1056/NEJMoa2414482' },
  { biologic: 'Benralizumab (referencia)', name: 'OSTRO', authors: 'Bachert C et al. J Allergy Clin Immunol 2022; 149:1309-1317', doi: '10.1016/j.jaci.2021.08.030' },
];

const GUIDES = [
  { name: 'EPOS / EUFOREA 2023', authors: 'Fokkens WJ et al. Rhinology 2023; 61:194-202', doi: '10.4193/Rhin22.489' },
  { name: 'EUFOREA Expert Board (definiciones)', authors: 'Bachert C et al. J Allergy Clin Immunol 2021; 147:29-36', doi: '10.1016/j.jaci.2020.11.013' },
  { name: 'POLINA 2.0 (consenso España)', authors: 'Mullol J et al. Int Forum Allergy Rhinol 2023', doi: '10.1002/alr.23262' },
];

const NMA = [
  { name: 'NMA Xu — Updated 2025', authors: 'Xu X et al. Clin Transl Allergy 2025', doi: '10.1002/clt2.70091' },
  { name: 'NMA Safia — 22 RCTs', authors: 'Safia A et al. Pharmaceuticals 2025', doi: '10.3390/ph18101511' },
  { name: 'Reappraisal phase 3', authors: 'Lipworth BJ et al. JACI Pract 2025', doi: '10.1016/j.jaip.2025.04.012' },
  { name: 'NMA Wang', authors: 'Wang H et al. Eur Arch Otorhinolaryngol 2024', doi: '10.1007/s00405-024-08561-9' },
  { name: 'NMA Cai', authors: 'Cai S et al. JACI Pract 2022', doi: '10.1016/j.jaip.2022.06.026' },
  { name: 'NMA Wu', authors: 'Wu Q et al. Int Arch Allergy Immunol 2021', doi: '10.1159/000519228' },
];

function RefLine({ name, authors, doi, biologic }) {
  return (
    <li className="border-b border-slate-100 py-2 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-semibold text-rsInk">{name}</span>
        {biologic && <span className="text-xs text-rsBlueText font-medium">{biologic}</span>}
        <a
          href={`https://doi.org/${doi}`}
          target="_blank"
          rel="noreferrer"
          title={doi}
          className="ml-auto inline-flex flex-none items-center gap-1 rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium text-rsBlueText hover:bg-rsBlueSoft"
        >
          DOI
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="text-xs text-rsMuted">{authors}</div>
      <div className="mt-0.5 truncate text-[10px] font-mono text-slate-400">{doi}</div>
    </li>
  );
}

export default function Bibliography() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rsMuted">
        <BookMarked className="h-3.5 w-3.5" />
        Bibliografía sobre la que se construye la app
      </div>
      <h3 className="mt-1 text-base font-bold text-rsInk">
        Evidencia y guías clínicas
      </h3>

      <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rsBlueText">
            Ensayos pivotales y subgrupos
          </div>
          <ul className="mt-2">
            {PIVOTAL.map((r) => <RefLine key={r.doi} {...r} />)}
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rsBlueText">
            Guías y consensos
          </div>
          <ul className="mt-2">
            {GUIDES.map((r) => <RefLine key={r.doi} {...r} />)}
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rsBlueText">
            Meta-análisis en red (base SUCRA)
          </div>
          <ul className="mt-2">
            {NMA.map((r) => <RefLine key={r.doi} {...r} />)}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-rsCanvas px-3 py-2 text-xs text-rsMuted">
        El motor de scoring combina los SUCRA de los meta-análisis en red, ajustados por
        modificadores fenotípicos derivados de los subanálisis publicados (Bachert 2022 para
        eosinofilia, EVEREST para dupilumab vs omalizumab, WAYPOINT para tezepelumab en T2-low,
        indicaciones FDA/EMA cruzadas para comorbilidades).
      </div>
    </div>
  );
}
