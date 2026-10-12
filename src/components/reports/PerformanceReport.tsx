import React from 'react';
import {
  SKILL_ORDER,
  SKILL_LABEL,
  type PerformanceReportPayload,
} from '@/data/report';
import type { OrganizationBrand } from '@/contexts/branding/types';
import { useBrandingContext } from '@/contexts/branding/BrandingContext';

interface PerformanceReportProps {
  report: PerformanceReportPayload;
  /** Override the tenant brand (defaults to the active branding context). */
  brand?: OrganizationBrand;
  className?: string;
}

/** A single "Label: value" header cell, mirroring the Word template grid. */
const HeaderField: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex gap-2 text-sm">
    <span className="font-semibold text-foreground whitespace-nowrap">{label}:</span>
    <span className="text-foreground/80 break-words">{value || '—'}</span>
  </div>
);

/**
 * The student-facing performance report, rendered faithfully to the academy's
 * Word templates (header grid → Goals → Feedback → Current Skills → Objectives/
 * Scope of Topics → Other Programs → Signature) inside a tenant-branded shell.
 *
 * White-label safe: the shell shows only the active tenant brand (Upedia by
 * default) — never the platform owner. Print-friendly for "Download" via the
 * browser's print-to-PDF.
 */
const PerformanceReport: React.FC<PerformanceReportProps> = ({ report, brand, className }) => {
  const ctxBrand = useBrandingContext();
  const b = brand || ctxBrand;
  const h = report.header;
  const hasSkills = Object.values(report.skills).some(Boolean);

  return (
    <div
      className={`performance-report mx-auto w-full max-w-3xl bg-white text-slate-900 ${className || ''}`}
      style={{ ['--brand' as any]: b.colorPrimary, ['--brand-dark' as any]: b.colorPrimaryDark }}
    >
      {/* Tenant-branded band (our shell, not part of the Word body). */}
      <div
        className="flex items-center gap-3 rounded-t-lg px-6 py-4 text-white"
        style={{ background: `linear-gradient(135deg, ${b.colorPrimaryDark}, ${b.colorPrimary})` }}
      >
        {b.logoUrl ? (
          <img src={b.logoUrl} alt={b.displayName} className="h-9 w-auto object-contain" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-bold">
            {b.initials}
          </span>
        )}
        <div className="leading-tight">
          <div className="text-lg font-bold">{b.displayName}</div>
          {b.tagline && <div className="text-xs text-white/80">{b.tagline}</div>}
        </div>
        <div className="ml-auto text-right text-sm font-medium">
          {report.program}
          {report.subtrack ? ` · ${report.subtrack}` : ''}
        </div>
      </div>

      <div className="space-y-6 rounded-b-lg border border-t-0 border-slate-200 px-6 py-6">
        {/* Title + header grid */}
        <div>
          <div className="mb-1 text-right text-xs text-slate-500">Date: {h.date}</div>
          <h2 className="mb-4 text-center text-xl font-bold tracking-wide">Performance Report</h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            <HeaderField label="Name" value={h.name} />
            <HeaderField label="Age" value={h.age} />
            <HeaderField label="Nationality" value={h.nationality} />
            <HeaderField label="Program" value={h.track} />
            <HeaderField label="Residency" value={h.residency} />
            <HeaderField label="Suggested Level" value={report.levelCode} />
            <HeaderField label="Occupation" value={h.occupation} />
            <HeaderField label="Suggested Band" value={report.band} />
          </div>
        </div>

        {report.recommendTrackChange && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {report.recommendTrackChange}
          </div>
        )}

        {/* Goals */}
        <section>
          <h3 className="mb-1 border-b pb-1 text-base font-semibold" style={{ color: b.colorPrimaryDark }}>
            Goals
          </h3>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{report.goals || '—'}</p>
        </section>

        {/* Feedback */}
        <section>
          <h3 className="mb-1 border-b pb-1 text-base font-semibold" style={{ color: b.colorPrimaryDark }}>
            Feedback
          </h3>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{report.feedback || '—'}</p>
        </section>

        {/* Current Skills */}
        {hasSkills && (
          <section>
            <h3 className="mb-2 border-b pb-1 text-base font-semibold" style={{ color: b.colorPrimaryDark }}>
              Current Skills
            </h3>
            <div className="space-y-2">
              {SKILL_ORDER.filter((k) => report.skills[k]).map((k) => (
                <p key={k} className="text-sm text-slate-700">
                  <span className="font-semibold">{SKILL_LABEL[k]}: </span>
                  {report.skills[k]}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Objectives / Scope of Topics */}
        {report.items.length > 0 && (
          <section>
            <h3 className="mb-2 border-b pb-1 text-base font-semibold" style={{ color: b.colorPrimaryDark }}>
              {report.itemsLabel || 'Objectives'}
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {report.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Other Programs */}
        <section>
          <h3 className="mb-1 border-b pb-1 text-base font-semibold" style={{ color: b.colorPrimaryDark }}>
            Other Programs
          </h3>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{report.otherPrograms || '—'}</p>
        </section>

        {/* Signature */}
        <div className="pt-6 text-sm">
          <span className="font-semibold">Signature:</span>
          <span className="ml-2 inline-block w-48 border-b border-slate-400">&nbsp;</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
