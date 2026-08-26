import { jsPDF } from 'jspdf';

// Reliable, text-based PDF for the assessment report. Draws directly with jsPDF
// (no html2canvas), which avoids the blank-page problem html2canvas hits on
// modern CSS color functions (oklch) used by the app's theme.

export interface ReportPdfData {
  name: string;
  email: string;
  date: string;
  reference: string;
  cefr: string;
  reviewStatus?: string | null;
  feedback?: string | null;
  recommendation?: string | null;
  criteria?: { grammar?: string | null; fluency?: string | null; vocabulary?: string | null } | null;
  brandName?: string;
}

export function downloadReportPdf(data: ReportPdfData, fileName: string): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = 60;

  const heading = (text: string) => {
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 95);
    doc.text(text, margin, y);
    y += 6;
    doc.setDrawColor(220);
    doc.line(margin, y, pageW - margin, y);
    y += 16;
  };

  const kv = (label: string, value: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(label.toUpperCase(), margin, y);
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text(value || '—', margin, y + 14);
    y += 34;
  };

  const paragraph = (text: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(40);
    const lines = doc.splitTextToSize(text, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 15 + 8;
  };

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 95);
  doc.text(`${data.brandName || 'English Placement'} — Assessment Report`, margin, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(130);
  doc.text('Detailed analysis and scoring breakdown', margin, y);
  y += 12;
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(1.2);
  doc.line(margin, y, pageW - margin, y);
  doc.setLineWidth(1);
  y += 24;

  // Candidate
  heading('Candidate');
  const col = contentW / 2;
  const rowY = y;
  const kvAt = (label: string, value: string, x: number, yy: number) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120);
    doc.text(label.toUpperCase(), x, yy);
    doc.setFontSize(11); doc.setTextColor(20);
    doc.text(value || '—', x, yy + 14);
  };
  kvAt('Name', data.name, margin, rowY);
  kvAt('Email', data.email, margin + col, rowY);
  y = rowY + 34;
  const rowY2 = y;
  kvAt('Date', data.date, margin, rowY2);
  kvAt('Reference', data.reference, margin + col, rowY2);
  y = rowY2 + 40;

  // Overall CEFR
  heading('Overall CEFR Level');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.setTextColor(30, 58, 95);
  doc.text(data.cefr || 'N/A', margin, y + 16);
  if (data.reviewStatus) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Review status: ${data.reviewStatus}`, margin + 90, y + 4);
  }
  y += 40;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text('Based on Grammar, Fluency, and Vocabulary scoring engines + assessor review.', margin, y);
  y += 20;

  // Criteria (if provided)
  if (data.criteria && (data.criteria.grammar || data.criteria.fluency || data.criteria.vocabulary)) {
    heading('Skill Breakdown');
    const c = data.criteria;
    const third = contentW / 3;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120);
    doc.text('GRAMMAR', margin, y);
    doc.text('FLUENCY', margin + third, y);
    doc.text('VOCABULARY', margin + third * 2, y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(20);
    doc.text(c.grammar || '—', margin, y + 20);
    doc.text(c.fluency || '—', margin + third, y + 20);
    doc.text(c.vocabulary || '—', margin + third * 2, y + 20);
    y += 44;
  }

  // Assessor feedback
  heading('Assessor Feedback');
  if (data.feedback) {
    paragraph(data.feedback);
  } else {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(11); doc.setTextColor(130);
    doc.text('Awaiting assessor review.', margin, y);
    y += 22;
  }
  if (data.recommendation) {
    y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(80);
    doc.text('Recommendation', margin, y);
    y += 16;
    paragraph(data.recommendation);
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(220);
  doc.line(margin, pageH - 48, pageW - margin, pageH - 48);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140);
  doc.text(
    `${data.brandName || 'English Placement'} Assessment Report · Reference ${data.reference} · Generated ${new Date().toLocaleDateString()}`,
    margin,
    pageH - 32,
  );

  doc.save(fileName);
}
