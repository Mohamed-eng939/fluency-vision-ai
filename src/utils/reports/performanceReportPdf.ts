import { jsPDF } from 'jspdf';
import { SKILL_ORDER, SKILL_LABEL, type PerformanceReportPayload } from '@/data/report';

/**
 * Reliable, text-based PDF of a full performance report. Drawn directly with
 * jsPDF (no html2canvas, which blanks on the app's oklch theme colors) and
 * paginated, so sales agents can download the report and send it manually.
 * Mirrors the on-screen PerformanceReport content.
 */
export function downloadPerformanceReportPdf(
  r: PerformanceReportPayload,
  fileName: string,
  brandName = 'Upedia',
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = 60;

  const ensure = (needed: number) => {
    if (y + needed > pageH - 60) { doc.addPage(); y = 60; }
  };
  const heading = (text: string) => {
    ensure(42);
    y += 8;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(30, 58, 95);
    doc.text(text, margin, y);
    y += 6; doc.setDrawColor(220); doc.line(margin, y, pageW - margin, y); y += 16;
  };
  const paragraph = (text: string) => {
    if (!text) { ensure(16); doc.setFont('helvetica', 'italic'); doc.setFontSize(11); doc.setTextColor(150); doc.text('—', margin, y); y += 18; return; }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(40);
    for (const line of doc.splitTextToSize(text, contentW)) { ensure(16); doc.text(line, margin, y); y += 15; }
    y += 8;
  };
  const kvRow = (pairs: [string, string][]) => {
    ensure(36);
    const colW = contentW / pairs.length;
    pairs.forEach(([label, value], i) => {
      const x = margin + colW * i;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120);
      doc.text(label.toUpperCase(), x, y);
      doc.setFontSize(11); doc.setTextColor(20);
      doc.text(value || '—', x, y + 14);
    });
    y += 34;
  };

  const h = r.header || ({} as PerformanceReportPayload['header']);

  // Title
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(30, 58, 95);
  doc.text(`${brandName} — Performance Report`, margin, y);
  y += 16;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(130);
  doc.text(`Date: ${h.date || ''}`, margin, y);
  y += 10;
  doc.setDrawColor(30, 58, 95); doc.setLineWidth(1.2); doc.line(margin, y, pageW - margin, y); doc.setLineWidth(1);
  y += 24;

  // Candidate
  heading('Candidate');
  kvRow([['Name', h.name], ['Age', h.age]]);
  kvRow([['Nationality', h.nationality], ['Residency', h.residency]]);
  kvRow([['Occupation', h.occupation], ['Program', h.track]]);
  kvRow([['Suggested Level', r.levelCode || ''], ['Suggested Band', r.band || '']]);

  // Levels
  const hasCriteria = r.criteria && (r.criteria.grammar || r.criteria.fluency || r.criteria.vocabulary);
  if (r.overallCefr || hasCriteria) {
    heading('CEFR Levels');
    if (r.overallCefr) kvRow([['Overall', r.overallCefr]]);
    if (hasCriteria) kvRow([
      ['Grammar', r.criteria?.grammar || ''],
      ['Fluency', r.criteria?.fluency || ''],
      ['Vocabulary', r.criteria?.vocabulary || ''],
    ]);
  }

  heading('Goals');
  paragraph(r.goals);

  heading('Feedback');
  paragraph(r.feedback);

  const skills = r.skills || {};
  if (SKILL_ORDER.some((k) => skills[k])) {
    heading('Current Skills');
    for (const k of SKILL_ORDER) {
      const v = skills[k];
      if (!v) continue;
      ensure(16);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(40);
      doc.text(`${SKILL_LABEL[k]}: ${v}`, margin, y);
      y += 16;
    }
    y += 8;
  }

  if (r.items && r.items.length) {
    heading(r.itemsLabel || 'Objectives');
    for (const it of r.items) {
      for (const line of doc.splitTextToSize(`•  ${it}`, contentW)) {
        ensure(16);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(40);
        doc.text(line, margin, y);
        y += 15;
      }
    }
    y += 8;
  }

  if (r.otherPrograms) {
    heading('Other Programs');
    paragraph(r.otherPrograms);
  }

  // Footer on the final page
  doc.setDrawColor(220); doc.line(margin, pageH - 48, pageW - margin, pageH - 48);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140);
  doc.text(`${brandName} Performance Report · Generated ${new Date().toLocaleDateString()}`, margin, pageH - 32);

  doc.save(fileName);
}
