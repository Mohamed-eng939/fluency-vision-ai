import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import AccountNav from '@/components/AccountNav';

/**
 * Lightweight top bar for pages that otherwise have no header, so a sign-in /
 * account control is reachable from everywhere. The Logo is brand-aware (shows
 * the active tenant's name), so this stays white-label-safe.
 */
const PublicTopBar: React.FC = () => (
  <div className="w-full border-b bg-background/80 backdrop-blur sticky top-0 z-40">
    <div className="container mx-auto flex items-center justify-between gap-2 py-2 px-4">
      <Link to="/" className="flex items-center min-w-0" aria-label="Home">
        <Logo size="md" variant="full" />
      </Link>
      <AccountNav />
    </div>
  </div>
);

export default PublicTopBar;
