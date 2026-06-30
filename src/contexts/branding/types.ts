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

export const DEFAULT_BRAND: OrganizationBrand = {
  displayName: 'English Placement',
  initials: 'EP',
  colorPrimary: '#1a56db',
  colorPrimaryDark: '#1e429f',
  colorAccent: '#0694a2',
  colorTint: '#ebf5fb',
};
