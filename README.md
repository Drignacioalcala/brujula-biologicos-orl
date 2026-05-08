# Brújula Biológicos ORL

Apoyo a la decisión clínica para la elección de biológico en poliposis nasal grave (CRSwNP). Pensado para compartir en la SEORL y unidades UINS.

Cubre los 4 biológicos financiados por el SNS para CRSwNP:
- **Dupilumab** (anti-IL-4Rα) — financiado SNS desde 01/02/2020
- **Tezepelumab** (anti-TSLP) — financiación SNS aprobada CIPM 28-01-2026, comercializado 30-03-2026
- **Omalizumab** (anti-IgE) — financiado SNS para CRSwNP 2025
- **Mepolizumab** (anti-IL-5) — financiado SNS desde 2023

## Qué hace

1. **Fenotipa al paciente** con sliders y toggles (eosinófilos, IgE, asma, EREA, dermatitis atópica, urticaria crónica, anosmia, SNOT-22, NPS, cirugías previas, corticoides sistémicos).
2. **Verifica criterios POLINA 2.0** (España) o **EPOS / EUFOREA 2023** (internacional) en tiempo real.
3. **Recorre un árbol de decisión determinístico** paso a paso:
   1. Elegibilidad según guía
   2. Indicación cruzada (DA, EoE, prurigo, urticaria) que decanta
   3. Fenotipo predominante (EREA, hipereosinofilia, eos≥500+asma, alergia+IgE+asma, T2-low, anosmia severa)
   4. Recomendación con razones, alternativa, cautelas y ficha AEMPS
4. **Exporta PDF** con caso, criterios cumplidos, camino del árbol y recomendación, listo para historia clínica.

## Sin IA generativa

El motor es 100% determinístico, anclado en la evidencia más reciente:

- POLINA 2.0 (Alobid 2023, JIACI)
- EPOS / EUFOREA 2023 (Fokkens, Rhinology 2023)
- WAYPOINT — Lipworth, NEJM 2025 (`10.1056/NEJMoa2414482`)
- EVEREST — De Corso, Lancet Respir Med 2025 (`10.1016/S2213-2600(25)00287-5`)
- Lipworth Reappraisal phase 3 — JACI Pract 2025 (`10.1016/j.jaip.2025.04.012`)
- Cai RWE meta-análisis — Allergy 2025 (64 estudios reales, 3921 pacientes)
- Hopkins ITC dupi vs mepo — JACI Pract 2024
- Datos españoles: García-Piñero (J Clin Med 2025), Vizcarra-Melgar (Front Allergy 2025), Golet (Acta Otorrinolaringol Esp 2025)

Cada recomendación es trazable y reproducible. No hay variabilidad entre ejecuciones.

## Stack

- React 19 + Vite + Tailwind 3
- jsPDF (export)
- lucide-react (iconos)
- Sin recharts, sin html2canvas-de-código-propio, sin Netlify Functions

## Desarrollo local

```bash
npm install
npm run dev            # frontend en :5173
npm run build          # bundle producción
npm run lint           # eslint
```

## Despliegue en Netlify

1. Crear repo en GitHub con este proyecto.
2. En Netlify: *New site from Git* → seleccionar el repo.
3. *Build command*: `npm run build` (ya configurado en `netlify.toml`).
4. Listo: la URL pública es la que se comparte con la SEORL.

## Aviso

Herramienta de apoyo a la decisión, no sustituye el juicio clínico ni la unidad multidisciplinar (UINS). Verifica financiación local y contraindicaciones AEMPS antes de prescribir. Estado AEMPS revisado a 8-mayo-2026.
