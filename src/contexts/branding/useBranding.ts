import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationBrand, DEFAULT_BRAND } from './types';

function parseBrand(row: { name: string; branding: any }): OrganizationBrand {
  const b = row.branding ?? {};
  return {
    displayName: b.display_name || row.name || DEFAULT_BRAND.displayName,
    tagline: b.tagline,
    logoUrl: b.logo_url,
    initials: b.initials || (b.display_name || row.name || 'EP').slice(0, 2).toUpperCase(),
    colorPrimary: b.color_primary || DEFAULT_BRAND.colorPrimary,
    colorPrimaryDark: b.color_primary_dark || DEFAULT_BRAND.colorPrimaryDark,
    colorAccent: b.color_accent || DEFAULT_BRAND.colorAccent,
    colorTint: b.color_tint || DEFAULT_BRAND.colorTint,
  };
}

export function useBranding() {
  const [brand, setBrand] = useState<OrganizationBrand>(DEFAULT_BRAND);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const hostname = window.location.hostname;

    supabase
      .from('organizations')
      .select('name, branding, domain')
      .eq('is_active', true)
      .order('domain', { nullsFirst: false }) // domain-specific rows first
      .limit(10)
      .then(({ data }) => {
        if (cancelled || !data?.length) {
          setIsLoading(false);
          return;
        }
        // prefer exact domain match, fall back to first active org
        const match =
          data.find((o) => o.domain && hostname.endsWith(o.domain)) ?? data[0];
        if (!cancelled) {
          setBrand(parseBrand(match as any));
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { brand, isLoading };
}
