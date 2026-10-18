// A storage-independent carrier for an active partner-invite assessment
// (the /embed/:token and /t/:token flows). It lives in JS memory for the life of
// the page load, so it survives inside third-party iframes where sessionStorage
// is partitioned or blocked — which is exactly why the embedded flow used to show
// our login screen and never save a session. Holds the invite token, the
// partner-supplied candidate data, and the tenant's brand row.

export type InviteBrandRow = { name: string; branding: any } | null;
export type InviteCandidate = { name?: string; email?: string; external_id?: string } | null;

let _token: string | null = null;
let _candidate: InviteCandidate = null;
let _brandRow: InviteBrandRow = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((fn) => { try { fn(); } catch { /* ignore */ } });

export const inviteSession = {
  set(data: { token: string; candidate?: InviteCandidate; brandRow?: InviteBrandRow }) {
    _token = data.token || null;
    _candidate = data.candidate ?? null;
    _brandRow = data.brandRow ?? null;
    notify();
  },
  get token() { return _token; },
  get candidate() { return _candidate; },
  get brandRow() { return _brandRow; },
  clear() { _token = null; _candidate = null; _brandRow = null; notify(); },
  /** Subscribe to changes (used by branding so it re-skins once an invite resolves). */
  subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
};
