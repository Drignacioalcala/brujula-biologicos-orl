# Brújula Biológicos ORL

> Webapp SEORL para apoyo a la decisión de biológico en CRSwNP (poliposis nasal grave). Radar comparativo + EPOS/EUFOREA 2023 + razonamiento clínico Gemini.

## 📊 Estado actual
**Última actualización: 2026-05-04** — Funcional, build limpia. Recalibrado contra sesgo visual a favor de dupilumab. Responsive arreglado (móvil + desktop). Pendiente: deploy a Netlify y crear repo GitHub.

## 🎯 Propósito (Why)
"Algo chulo e innovador" para compartir con SEORL. No existe herramienta visual interactiva para los 4 biológicos aprobados (solo checklist plano de Pathway.md).

## 💊 Cobertura clínica
**4 biológicos aprobados:** dupilumab, tezepelumab, omalizumab, mepolizumab.

## ⚙️ Funcionalidad
1. **Fenotipado paciente:** eosinófilos, IgE, asma, EREA, dermatitis atópica, anosmia, SNOT-22, NPS, cirugías, SCS
2. **Chequeo EPOS/EUFOREA 2023** (3 de 5 criterios) en tiempo real
3. **Radar comparativo** — 5 ejes: NPS, SNOT-22, olfato, congestión, beneficio sistémico. Puntuaciones derivadas de SUCRA de meta-análisis en red (Xu 2025, Safia 2025, Cai 2022, Wu 2021), ajustadas por fenotipo
4. **Ranking** con score global ponderado
5. **Razonamiento clínico** narrado por Gemini 2.5 Flash (Netlify Function)
6. **Export PDF** con caso + criterios + ranking

## 🛠️ Stack
- React 19 + Vite + Tailwind 3 (sin TS)
- Recharts (radar)
- jsPDF (export)
- Netlify Functions (proxy Gemini, `GEMINI_API_KEY` en env)

## 📁 Estructura
```
src/data/biologics.js               ← datos basales + scoreBiologic + criterios EUFOREA
src/components/                     ← PatientInput, EuforeaCheck, BiologicRadar, Recommendation
src/lib/exportPdf.js                ← export jsPDF
netlify/functions/clinical-narrative.js ← proxy Gemini 2.5 Flash
netlify.toml                        ← build config
```

## 🔑 Decisiones clave (no negociables)
- Respetar los **4 fármacos** y los **SUCRA como base**
- **Ajuste fenotípico explícito** en `scoreBiologic` que sube al biológico preferente *y* baja al líder cuando otro biológico tiene mejor mecanismo (ver "Calibración 2026-05-04")
- API key Gemini SOLO en variables Netlify
- Radar con **escala 20–100** (no 0–100) y nota explicativa de que es SUCRA, no eficacia absoluta. Mepolizumab con SUCRA 0.30 es eficaz vs placebo, solo es el último de los 4 en probabilidad de mejor respuesta

## 🎯 Calibración 2026-05-04 — Anti-sesgo dupilumab
Las bases SUCRA originales (Xu 2025, Cai 2022, Wu 2021) **no incluían tezepelumab** porque WAYPOINT (Lipworth 2024-2025) salió después. Eso producía un sesgo visual: dupilumab dominaba el radar incluso en fenotipos donde tezepelumab debería empatar (T2-low) o donde mepolizumab/omalizumab debería destacar.

**Cambios aplicados:**
- **Tezepelumab recalibrado** con NMA post-WAYPOINT (Safia 2025 *Pharmaceuticals* `10.3390/ph18101511` y Reappraisal phase 3, Lipworth 2025 *JACI Pract* `10.1016/j.jaip.2025.04.012`):
  - nps 0.72 → 0.85, snot22 0.70 → 0.82, smell 0.75 → 0.85, congestion 0.65 → 0.78, comorbidity 0.90 → 0.92
- **Modificadores que penalizan al líder** cuando otro biológico es preferente:
  - Eos ≥500 → dupilumab −0.04 comorbidity
  - T2-low (<150) → dupilumab −0.05 nps, −0.05 smell, −0.05 comorbidity / tezepelumab +0.05 comorbidity
  - Alergia + IgE alta → dupilumab −0.03 comorbidity
- **Escala radar 20–100** + nota explicativa que aclara que SUCRA ≠ eficacia absoluta

**Resultado validado en presets:**
- T2-low: dupi 93 vs teze 91 (empate técnico, antes dupi dominaba claramente)
- Eosinofílica + asma: dupi 96, teze 89 (más cerca)
- Hipereosinofilia: dupi cae a 90, teze sube a 88
- Alérgica + IgE: dupi 95 sigue arriba (correcto: EVEREST 2025 confirmó dupi > omal en alérgicos)

## ⏭️ Pendientes
- [ ] Añadir `GEMINI_API_KEY` en `.env` local
- [ ] Configurar `GEMINI_API_KEY` en variables Netlify
- [ ] Crear repo GitHub
- [ ] Deploy Netlify

## 📝 Bitácora
- **2026-04-29:** Build funcional, dev server OK. Pendiente solo el deploy.
- **2026-05-04:** Responsive arreglado — bibliografía a 2 col en md y 3 col solo en xl con DOI compactado, matriz comparativa pasa a cards apiladas en móvil (`md:hidden`/`md:block`). Recalibración anti-sesgo dupilumab (ver sección "Calibración 2026-05-04"): tezepelumab actualizado con Safia 2025 y Reappraisal 2025; modificadores que penalizan al líder; escala radar 20–100 con nota explicativa SUCRA. Build limpia.
