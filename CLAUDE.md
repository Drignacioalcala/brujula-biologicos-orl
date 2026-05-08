# Brújula Biológicos ORL

> Webapp SEORL para apoyo a la decisión de biológico en CRSwNP grave. **Árbol determinístico** (sin IA generativa) basado en POLINA 2.0 / EPOS-EUFOREA 2023 + evidencia 2025-2026.

## 📊 Estado actual
**Última actualización: 2026-05-08** — Refactor completo a árbol de decisión sin IA. Build limpio, lint limpio, smoke 6/6 presets pasando. Pendiente: deploy Netlify y crear repo GitHub.

## 🎯 Propósito (Why)
Herramienta seria y trazable para compartir con SEORL/UINS. La versión anterior tenía 3 problemas que el usuario quiso resolver el 8-mayo-2026:
1. **No reflejaba la realidad asistencial** española (datos AEMPS desactualizados; tezepelumab estaba aprobado/financiado y la app no lo reflejaba).
2. Capa de **IA generativa** (Gemini 2.5 Flash) producía texto no determinístico → impredecible y no reproducible.
3. Visual centrado en un **radar SUCRA** (escala 20–100 con notas explicativas porque la métrica era contraintuitiva) y mascota Groog cómica → incompatible con tono SEORL.

## 💊 Cobertura clínica (4 financiados SNS)
| Biológico | Diana | Financiación SNS | Restricciones AEMPS |
|---|---|---|---|
| Dupilumab (Dupixent) | IL-4Rα | desde 01-02-2020 | ≥2 cirugías previas (BIFIMED), DH |
| Mepolizumab (Nucala) | IL-5 | desde 2023 (primero CRSwNP en España) | DH |
| Omalizumab (Xolair) | IgE | desde 2025 | DH; dosis por peso × IgE total |
| Tezepelumab (Tezspire) | TSLP | desde 28-01-2026 (CIPM); comercializado 30-03-2026 | DH; pacientes refractarios a SCS y/o cirugía |

Depemokimab (aprobado EMA feb 2026) **no entra** al árbol — sin financiación SNS aún.

## ⚙️ Funcionalidad
1. **Fenotipado paciente** con sliders/toggles (`PatientInput.jsx`)
2. **Selector POLINA / EUFOREA** (`App.jsx`)
3. **Chequeo de criterios** en tiempo real (`GuideCheck.jsx`)
4. **Árbol determinístico paso-a-paso** (`DecisionTree.jsx` + `lib/decisionTree.js`)
5. **Tarjeta de recomendación** con razones, alternativa, cautelas, ficha AEMPS (`RecommendationCard.jsx`)
6. **Export PDF** con caso + criterios + camino del árbol + recomendación AEMPS (`lib/exportPdf.js`)
7. **Matriz comparativa** de los 4 biológicos con financiación (`BiologicMatrix.jsx`)
8. **Bibliografía con DOIs clicables** (`Bibliography.jsx`)

## 🛠️ Stack
- React 19 + Vite 8 + Tailwind 3 (sin TS)
- jsPDF (export)
- lucide-react (iconos)
- **Sin recharts**, **sin Netlify Functions**, **sin Gemini**, **sin html2canvas en el código** (queda en bundle vendor por jsPDF, irrelevante)

## 📁 Estructura
```
src/
  data/biologics.js               ← BIOLOGICS + GUIDES + evaluatePatient + bloque AEMPS por fármaco
  lib/decisionTree.js             ← runDecisionTree(patient, guideId) — motor determinístico
  lib/exportPdf.js                ← export jsPDF con árbol + recomendación
  components/
    PatientInput.jsx              ← sliders + toggles
    GuideCheck.jsx                ← criterios POLINA/EUFOREA
    DecisionTree.jsx              ← visualización paso-a-paso (4 nodos expandibles)
    RecommendationCard.jsx        ← tarjeta razones / alternativa / cautelas / AEMPS
    BiologicMatrix.jsx            ← tabla comparativa con financiación SNS
    Bibliography.jsx              ← refs 2025-2026 con DOIs clicables
  App.jsx                         ← layout, presets, hero red sanitarIA (sin Groog)
```

## 🔑 Decisiones clave (no negociables)
- **Sin IA generativa**: la recomendación es trazable y reproducible. La capa Gemini se eliminó.
- **Sin radar Recharts**: sustituido por un árbol vertical paso-a-paso que muestra el camino activo con razones y DOI cuando aplica.
- **POLINA 2.0 es la guía por defecto**: SNOT-22 ≥50 + ≥2 cirugías + T2 obligatorio. La elegibilidad estricta se respeta (Golet 2025: 32% POLINA vs 57% EPOS en cohorte real).
- **Fenotipos en orden de prioridad** (primer match gana): anchor cruzado → EREA → hipereosinofilia → eos≥500+asma → alergia+IgE+asma → T2-low → anosmia severa → default.
- **EVEREST 2025 manda en alergia+asma**: dupi > omali en CRSwNP+asma; omalizumab queda como alternativa solo si urticaria crónica concomitante.
- **WAYPOINT 2025 es la base T2-low**: tezepelumab es el único T2-agnóstico aprobado, financiado en España desde 28-01-2026.
- **Branding red sanitarIA mantenido**, Groog y globo fuera (tono serio para SEORL).

## ✅ Verificación (smoke test 6 presets)
Todos en POLINA, todos elegibles:
- `alergica` (eos 220, IgE 480, asma, alergia) → **Dupilumab** (rama alergia+asma, alt: Omalizumab)
- `eosinofilica` (eos 720, asma) → **Mepolizumab** (rama eos≥500+asma, alt: Dupilumab)
- `t2low` (eos 110, IgE 45, asma sí, sin alergia) → **Tezepelumab** (rama T2-low, alt: Dupilumab)
- `erea` (eos 540, EREA, asma) → **Dupilumab** (rama EREA gana sobre eos≥500, alt: Tezepelumab)
- `hipereos` (eos 1900) → **Mepolizumab** + alerta EGPA + cautela dupilumab (rama hipereos, alt: Tezepelumab)
- `atopica` (DA, alérgica) → **Dupilumab** vía anchor cruzado (sin pasar por fenotipo, alt: Tezepelumab)

## ⏭️ Pendientes
- [ ] Crear repo GitHub
- [ ] Deploy Netlify
- [ ] Compartir con SEORL/UINS

## 📝 Bitácora
- **2026-04-29:** Build funcional inicial con radar SUCRA + Gemini.
- **2026-05-04:** Responsive arreglado + recalibración SUCRA anti-sesgo dupilumab (luego eliminada en el siguiente refactor).
- **2026-05-08:** Refactor completo. (1) Eliminado motor SUCRA y radar Recharts. (2) Eliminada Netlify Function de Gemini. (3) Creado motor determinístico `lib/decisionTree.js` con árbol paso-a-paso. (4) Nueva visualización `DecisionTree.jsx` (vertical, nodos expandibles) y `RecommendationCard.jsx`. (5) Mascota Groog y globo retirados; branding red sanitarIA conservado. (6) Datos AEMPS verificados a 8-mayo-2026 (mep 2023, dupi 2020, omali 2025, teze CIPM 28-01-2026 / comercial 30-03-2026). (7) Bibliografía actualizada con WAYPOINT NEJM 2025, EVEREST Lancet Respir Med 2025, Lipworth Reappraisal 2025, Cai RWE 2025, García-Piñero, Vizcarra-Melgar, Golet 2025. (8) Build limpio, lint limpio, 6/6 presets validados con smoke test.
