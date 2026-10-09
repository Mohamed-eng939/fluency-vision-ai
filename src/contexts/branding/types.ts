export interface OrganizationBrand {
  displayName: string;
  tagline?: string;
  logoUrl?: string;
  initials: string;
  colorPrimary: string;
  colorPrimaryDark: string;
  colorAccent: string;
  colorTint: string;
}

// Default (single-tenant) brand shown to students: Upedia. A per-organization
// branding row in the database still overrides this, and a partner-handoff
// candidate (/t/:token) sees their own tenant brand — so this default never
// leaks into another tenant's branded flow.
export const DEFAULT_BRAND: OrganizationBrand = {
  displayName: 'Upedia',
  tagline: 'Find Your New U',
  logoUrl: '/upedia-logo.png',
  initials: 'U',
  colorPrimary: '#2D8CD0',
  colorPrimaryDark: '#0A2463',
  colorAccent: '#3BCEAC',
  colorTint: '#EAF3FB',
};
