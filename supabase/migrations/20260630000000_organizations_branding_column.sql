-- ============================================================================
-- DRAFT — NOT APPLIED. Additive-only (no existing data or constraints
-- changed). Safe to apply on a Supabase branch first to verify, then
-- promote. Needs explicit sign-off before running against production.
-- ============================================================================
--
-- Add a JSONB branding column to organizations so each tenant's visual
-- identity (display name, logo, colours) can be configured per-row rather
-- than hardcoded in the frontend.
--
-- Expected shape of the JSON value (all keys optional):
-- {
--   "display_name": "Upedia",          -- overrides organizations.name in UI
--   "tagline": "Your future, assessed",
--   "logo_url": "https://...",
--   "initials": "UP",                  -- fallback avatar text
--   "color_primary": "#1a56db",        -- CSS hex used for --brand-primary
--   "color_primary_dark": "#1e429f",
--   "color_accent": "#0694a2",
--   "color_tint": "#ebf5fb"
-- }
--
-- Tenant resolution at app boot:
--   SELECT branding, name FROM organizations
--   WHERE domain = current_hostname OR domain IS NULL
--   ORDER BY (domain IS NOT NULL) DESC
--   LIMIT 1;
-- (NULL domain = the default / fallback brand for the platform owner's
--  own deployment, so any custom-domain row takes precedence.)
-- ============================================================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS branding jsonb DEFAULT NULL;

COMMENT ON COLUMN public.organizations.branding IS
  'Per-tenant brand config: display_name, tagline, logo_url, initials, '
  'color_primary, color_primary_dark, color_accent, color_tint. '
  'All keys optional; frontend falls back to platform defaults when NULL.';
