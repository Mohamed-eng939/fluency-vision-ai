import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogIn, UserPlus, LogOut, LayoutDashboard, FileText, Home } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

/**
 * Consistent sign-in / account control for every page.
 * - Signed out → Log In + Sign Up.
 * - Signed in  → account menu (Dashboard where applicable, My Results, Home,
 *   and Sign Out so the user can always switch accounts).
 * Brand-neutral by design — it never renders owner branding, so it is safe on
 * white-label pages too.
 */
const AccountNav: React.FC<{ className?: string }> = ({ className }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'admin' ? '/admin'
    : user?.role === 'assessor' ? '/assessor'
    : user?.role === 'agent' ? '/agent'
    : null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className || ''}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/login')}
          className="flex items-center gap-1"
        >
          <LogIn className="h-4 w-4" /> Log In
        </Button>
        <Button
          size="sm"
          onClick={() => navigate('/login?tab=register')}
          className="flex items-center gap-1"
        >
          <UserPlus className="h-4 w-4" /> Sign Up
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`flex items-center gap-2 ${className || ''}`}>
          <User className="h-4 w-4" />
          <span className="hidden sm:inline max-w-[140px] truncate">
            {user.full_name || user.email || 'Account'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 z-50 shadow-lg border">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium truncate">{user.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">Role: {user.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboardPath && (
          <DropdownMenuItem onClick={() => navigate(dashboardPath)} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate('/my-results')} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" /> My Results
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/')} className="cursor-pointer">
          <Home className="mr-2 h-4 w-4" /> Home
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountNav;
