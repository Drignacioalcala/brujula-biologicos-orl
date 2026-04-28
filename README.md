# Brújula Biológicos ORL

Apoyo a la decisión clínica para la elección de biológicos en poliposis nasal grave (CRSwNP), pensado para compartir con compañeros de la SEORL.

Cubre los 4 biológicos aprobados:
- **Dupilumab** (anti-IL-4Rα)
- **Tezepelumab** (anti-TSLP)
- **Omalizumab** (anti-IgE)
- **Mepolizumab** (anti-IL-5)

## Qué hace

1. **Fenotipa al paciente** con sliders y toggles (eosinófilos, IgE, asma, EREA, dermatitis atópica, anosmia, SNOT-22, NPS, cirugías previas, corticoides sistémicos).
2. **Verifica criterios EPOS / EUFOREA 2023** en tiempo real (3 de 5).
3. **Dibuja un radar comparativo** de los 4 biológicos en 5 ejes (NPS, SNOT-22, olfato, congestión, beneficio sistémico). Las puntuaciones parten de los SUCRA de meta-análisis en red recientes (Xu 2025, Safia 2025, Cai 2022, Wu 2021) y se ajustan al fenotipo.
4. **Genera un razonamiento clínico personalizado** con Gemini 2.5 Flash.
5. **Exporta PDF** con caso, criterios cumplidos y ranking, listo para historia clínica.

## Stack

- React 19 + Vite + Tailwind 3
- Recharts (radar)
- jsPDF (export)
- Netlify Functions como proxy a la API de Gemini (la API key nunca llega al cliente)

## Desarrollo local

```bash
npm install
cp .env.example .env   # rellenar GEMINI_API_KEY
npm run dev            # frontend en :5173 (sin función Gemini)
# o, con función Gemini activa:
npx netlify dev        # todo en :8888
```

Conseguir API key gratuita: https://aistudio.google.com/apikey

## Despliegue en Netlify

1. Crear repo en GitHub con este proyecto.
2. En Netlify: *New site from Git* → seleccionar el repo.
3. *Build command*: `npm run build` (ya configurado en `netlify.toml`).
4. *Site settings → Environment variables*: añadir `GEMINI_API_KEY`.
5. Listo: la URL pública es la que se comparte con la SEORL.

## Aviso

Herramienta de apoyo a la decisión, no sustituye el juicio clínico. Verifica indicación oficial, financiación local y contraindicaciones antes de prescribir.
