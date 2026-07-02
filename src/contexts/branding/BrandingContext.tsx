import React, { createContext, useContext, useEffect } from 'react';
import { useBranding } from './useBranding';
import { OrganizationBrand, DEFAULT_BRAND } from './types';

const BrandingContext = createContext<OrganizationBrand>(DEFAULT_BRAND);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { brand } = useBranding();

  // Inject CSS variables so Tailwind arbitrary-value classes and raw CSS
  // can reference --brand-primary etc. without JS coupling.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', brand.colorPrimary);
    root.style.setProperty('--brand-primary-dark', brand.colorPrimaryDark);
    root.style.setProperty('--brand-accent', brand.colorAccent);
    root.style.setProperty('--brand-tint', brand.colorTint);
  }, [brand]);

  return (
    <BrandingContext.Provider value={brand}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBrandingContext = () => useContext(BrandingContext);
