import jsPDF from 'jspdf';
import { BIOLOGICS, DOMAINS } from '../data/biologics';

// Paleta red sanitarIA
const C = {
  blue: [41, 173, 255],
  ink:  [54, 59, 71],
  dark: [44, 49, 64],
  muted:[139, 144, 153],
};

export function exportPdf({ patient, ranking, criteria }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 40;

  // ── Cabecera oscura red sanitarIA ─────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, W, 70, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(0, 70, W, 2, 'F');

  doc.setTextColor(...C.blue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('APP BY RED SANITARIA', margin, 28);

  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Brújula Biológicos ORL', margin, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220);
  doc.text(
    `Apoyo a la decisión clínica · ${new Date().toLocaleDateString('es-ES')}`,
    margin,
    62,
  );

  let y = 100;

  // ── Fenotipo ──────────────────────────────────────────────
  section(doc, 'Fenotipo del paciente', margin, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.ink);
  const phen = [
    `Edad: ${patient.age} años`,
    `Eosinófilos: ${patient.eosinophils} cel/µL  ·  IgE: ${patient.ige} UI/mL`,
    `SNOT-22: ${patient.snot22}  ·  NPS: ${patient.nps}/8  ·  Olfato: ${
      ['Normal', 'Hiposmia', 'Anosmia'][patient.anosmia]
    }`,
    `Asma: ${yn(patient.asthma)}  ·  Alergia: ${yn(patient.allergic)}  ·  EREA: ${yn(patient.nerd)}  ·  Dermatitis atópica: ${yn(patient.atopicDermatitis)}`,
    `Cirugías previas: ${patient.priorSurgeries}  ·  Ciclos corticoides sistémicos/año: ${patient.scsCourses}  ·  Contraindicación SCS: ${yn(patient.scsContraindication)}`,
  ];
  phen.forEach((line) => {
    doc.text(line, margin, y);
    y += 14;
  });
  y += 8;

  // ── Criterios EUFOREA ─────────────────────────────────────
  section(doc, 'Criterios EPOS / EUFOREA 2023', margin, y);
  y += 18;
  const met = criteria.filter((c) => c.met).length;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...(met >= 3 ? C.blue : C.muted));
  doc.text(
    `Cumple ${met} de 5 — ${met >= 3 ? 'INDICACIÓN CUMPLIDA' : 'No cumple indicación'}`,
    margin,
    y,
  );
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.ink);
  criteria.forEach((c) => {
    doc.text(`${c.met ? '☑' : '☐'} ${c.label} — ${c.detail}`, margin, y);
    y += 13;
  });
  y += 10;

  // ── Ranking ───────────────────────────────────────────────
  section(doc, 'Ranking adaptado al fenotipo', margin, y);
  y += 18;
  ranking.forEach((r, i) => {
    const bx = BIOLOGICS[r.id];
    const pct = Math.round(r.overall * 100);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C.ink);
    doc.text(`${i + 1}. ${bx.name}`, margin, y);
    doc.setTextColor(...C.blue);
    doc.text(`${pct}/100`, margin + 200, y);

    // Barra
    doc.setFillColor(232, 244, 251);
    doc.rect(margin, y + 4, 220, 5, 'F');
    const [r0, g0, b0] = hexToRgb(bx.color);
    doc.setFillColor(r0, g0, b0);
    doc.rect(margin, y + 4, 220 * (pct / 100), 5, 'F');
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text(`Diana: ${bx.target}  ·  Pauta: ${bx.dosing}`, margin, y);
    y += 11;
    const breakdown = DOMAINS.map(
      (d) =>
        `${d.label.replace(' (NPS)', '').replace(' (SNOT-22)', '').replace(' (UPSIT)', '')}: ${Math.round(r.scores[d.id] * 100)}`,
    ).join('  ·  ');
    doc.text(breakdown, margin, y);
    y += 18;
  });

  // ── Pie ───────────────────────────────────────────────────
  const footY = H - 50;
  doc.setDrawColor(...C.blue);
  doc.setLineWidth(0.5);
  doc.line(margin, footY, W - margin, footY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(
    'SUCRA de meta-análisis en red (Xu 2025, Safia 2025, Cai 2022, Wu 2021) ajustado al fenotipo.',
    margin,
    footY + 12,
  );
  doc.text(
    'Verifique indicación oficial, financiación y contraindicaciones antes de prescribir.',
    margin,
    footY + 22,
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.blue);
  doc.text('app by red sanitarIA', W - margin, footY + 12, { align: 'right' });
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...C.muted);
  doc.text('«Deja de ser el neandertal de tu hospital»', W - margin, footY + 22, { align: 'right' });

  doc.save(`brujula-biologicos_${Date.now()}.pdf`);
}

function section(doc, title, x, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text(title.toUpperCase(), x, y);
  doc.setDrawColor(...C.blue);
  doc.setLineWidth(0.8);
  doc.line(x, y + 4, x + 24, y + 4);
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function yn(v) {
  return v ? 'Sí' : 'No';
}
