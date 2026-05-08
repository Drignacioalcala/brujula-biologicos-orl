import jsPDF from 'jspdf';
import { BIOLOGICS } from '../data/biologics';

// Paleta red sanitarIA
const C = {
  blue: [41, 173, 255],
  ink:  [54, 59, 71],
  dark: [44, 49, 64],
  muted:[107, 114, 128],
  emerald: [16, 185, 129],
  rose:    [225, 29, 72],
};

const STEP_TITLE = {
  eligibility:      '1 · Elegibilidad según guía',
  crossIndication:  '2 · Indicación cruzada',
  phenotype:        '3 · Fenotipo predominante',
  recommendation:   '4 · Recomendación',
};

export function exportPdf({ patient, decision, evaluation, guideId }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxLineWidth = W - margin * 2;

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
    `Apoyo a la decisión clínica · Guía: ${guideId === 'POLINA' ? 'POLINA 2.0 (España)' : 'EPOS / EUFOREA 2023'} · ${new Date().toLocaleDateString('es-ES')}`,
    margin,
    62,
  );

  let y = 100;

  // ── Fenotipo del paciente ─────────────────────────────────
  y = section(doc, 'Fenotipo del paciente', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.ink);
  const olfatoLabel =
    patient.smellVAS === 0 ? 'normal'
      : patient.smellVAS <= 3 ? `pérdida leve (VAS ${patient.smellVAS})`
      : patient.smellVAS <= 6 ? `hiposmia (VAS ${patient.smellVAS})`
      : `anosmia (VAS ${patient.smellVAS})`;
  const phen = [
    `Edad: ${patient.age} años`,
    `Eosinófilos: ${patient.eosinophils} cel/µL  ·  IgE: ${patient.ige} UI/mL`,
    `SNOT-22: ${patient.snot22}  ·  NPS: ${patient.nps}/8  ·  Olfato: ${olfatoLabel}`,
    `Asma: ${yn(patient.asthma)}  ·  Alergia: ${yn(patient.allergic)}  ·  EREA: ${yn(patient.nerd)}`,
    `Indicaciones cruzadas: ${[
      patient.atopicDermatitis && 'Dermatitis atópica',
      patient.eosinophilicEsophagitis && 'EoE',
      patient.prurigoNodular && 'Prurigo nodular',
      patient.chronicUrticaria && 'Urticaria crónica',
    ].filter(Boolean).join(', ') || 'ninguna'}`,
    `Cirugías previas: ${patient.priorSurgeries}  ·  Ciclos corticoides sistémicos/año: ${patient.scsCourses}  ·  Contraindicación SCS: ${yn(patient.scsContraindication)}`,
  ];
  phen.forEach((line) => {
    doc.text(line, margin, y);
    y += 14;
  });
  y += 8;

  // ── Criterios de la guía aplicada ─────────────────────────
  y = section(doc, evaluation.guide.name, margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...(evaluation.indicated ? C.emerald : C.rose));
  doc.text(
    `${evaluation.indicated ? 'CUMPLE INDICACIÓN' : 'NO cumple indicación'} · ${evaluation.metCount}/5 criterios + cirugía previa: ${evaluation.surgeryReq.met ? 'sí' : 'no'}`,
    margin,
    y,
  );
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.ink);
  doc.text(`${evaluation.surgeryReq.met ? '✓' : '✗'} ${evaluation.surgeryReq.label}`, margin, y);
  y += 13;
  evaluation.criteria.forEach((c) => {
    const star = c.mandatory ? ' *' : '';
    doc.text(`${c.met ? '✓' : '✗'} ${c.label}${star} — ${c.detail}`, margin, y);
    y += 13;
  });
  y += 10;

  // ── Camino del árbol de decisión ──────────────────────────
  y = ensureSpace(doc, y, 60, H);
  y = section(doc, 'Camino del árbol de decisión', margin, y);
  decision.steps.forEach((step) => {
    y = ensureSpace(doc, y, 50, H);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.ink);
    doc.text(STEP_TITLE[step.id] || step.title, margin, y);
    y += 13;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text(step.summary || '', margin, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.ink);
    const lines = doc.splitTextToSize(step.detail || '', maxLineWidth);
    lines.forEach((line) => {
      y = ensureSpace(doc, y, 14, H);
      doc.text(line, margin, y);
      y += 12;
    });
    y += 4;
  });

  // ── Recomendación + alternativa + cautelas ────────────────
  if (decision.eligible && decision.primary) {
    const primary = BIOLOGICS[decision.primary.id];
    y = ensureSpace(doc, y, 80, H);
    y = section(doc, `Recomendación · ${primary.name}`, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.ink);
    decision.primary.reasons.forEach((reason) => {
      const lines = doc.splitTextToSize(`• ${reason}`, maxLineWidth);
      lines.forEach((line) => {
        y = ensureSpace(doc, y, 14, H);
        doc.text(line, margin, y);
        y += 12;
      });
    });
    y += 6;

    if (decision.alternative) {
      const alt = BIOLOGICS[decision.alternative.id];
      y = ensureSpace(doc, y, 50, H);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...C.ink);
      doc.text(`Alternativa · ${alt.name}`, margin, y);
      y += 13;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      decision.alternative.reasons.forEach((reason) => {
        const lines = doc.splitTextToSize(`• ${reason}`, maxLineWidth);
        lines.forEach((line) => {
          y = ensureSpace(doc, y, 14, H);
          doc.text(line, margin, y);
          y += 12;
        });
      });
      y += 6;
    }

    if (decision.avoid.length) {
      y = ensureSpace(doc, y, 40, H);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...C.rose);
      doc.text('Cautela / evitar', margin, y);
      y += 13;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C.ink);
      decision.avoid.forEach((a) => {
        const b = BIOLOGICS[a.id];
        const lines = doc.splitTextToSize(`• ${b.name}: ${a.reason}`, maxLineWidth);
        lines.forEach((line) => {
          y = ensureSpace(doc, y, 14, H);
          doc.text(line, margin, y);
          y += 12;
        });
      });
      y += 6;
    }

    // Ficha AEMPS del primary
    y = ensureSpace(doc, y, 60, H);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.ink);
    doc.text(`Ficha AEMPS · ${primary.brand}`, margin, y);
    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text(`Diana: ${primary.target}`, margin, y); y += 12;
    doc.text(`Pauta: ${primary.dosing}`, margin, y); y += 12;
    doc.text(
      `Financiación SNS: ${primary.aemps.financed ? 'desde ' + prettyDate(primary.aemps.since) : 'No financiado'}  ·  Prescripción: ${primary.aemps.prescriptionType}`,
      margin, y,
    ); y += 12;
    const condLines = doc.splitTextToSize(`Condiciones AEMPS: ${primary.aemps.conditions}`, maxLineWidth);
    condLines.forEach((line) => {
      y = ensureSpace(doc, y, 14, H);
      doc.text(line, margin, y);
      y += 12;
    });
  }

  // ── Alertas (al final, destacadas) ────────────────────────
  if (decision.alerts.length) {
    y = ensureSpace(doc, y, 50, H);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.rose);
    doc.text('Alertas clínicas', margin, y);
    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.ink);
    decision.alerts.forEach((a) => {
      const lines = doc.splitTextToSize(`! ${a.text}`, maxLineWidth);
      lines.forEach((line) => {
        y = ensureSpace(doc, y, 14, H);
        doc.text(line, margin, y);
        y += 12;
      });
      y += 4;
    });
  }

  // ── Pie ───────────────────────────────────────────────────
  drawFooter(doc, W, H, margin);

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
  return y + 18;
}

function drawFooter(doc, W, H, margin) {
  const footY = H - 50;
  doc.setDrawColor(...C.blue);
  doc.setLineWidth(0.5);
  doc.line(margin, footY, W - margin, footY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(
    'Árbol determinístico anclado en POLINA 2.0, EPOS/EUFOREA 2023, WAYPOINT, EVEREST y Lipworth Reappraisal 2025.',
    margin,
    footY + 12,
  );
  doc.text(
    'Verifique indicación oficial, financiación local y contraindicaciones antes de prescribir.',
    margin,
    footY + 22,
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.blue);
  doc.text('app by red sanitarIA', W - margin, footY + 12, { align: 'right' });
}

function ensureSpace(doc, y, needed, pageH) {
  if (y + needed > pageH - 70) {
    doc.addPage();
    return 60;
  }
  return y;
}

function yn(v) {
  return v ? 'Sí' : 'No';
}

function prettyDate(iso) {
  if (!iso) return '';
  if (iso.length === 4) return iso;
  const [y, m, d] = iso.split('-');
  if (!m) return iso;
  if (!d) return `${m}-${y}`;
  return `${d}-${m}-${y}`;
}
