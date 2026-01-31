import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, Shield } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const isAssessor = user?.role === 'assessor';

  return (
    <header className="bg-assessment-blue text-white py-4">
      <div className="assessment-container">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            FluencyVision AI
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm sm:text-base hidden sm:block">
              <span className="hidden sm:inline">AI-Powered</span>{" "}
              <span className="bg-assessment-teal text-assessment-blue px-2 py-1 rounded font-bold">
                Language Assessment
              </span>
            </div>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user.full_name || user.email || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white dark:bg-gray-800 z-50 shadow-lg border"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        Role: {user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {isAdmin && (
                    <DropdownMenuItem 
                      onClick={() => navigate('/admin')}
                      className="cursor-pointer"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  
                  {(isAdmin || isAssessor) && (
                    <DropdownMenuItem 
                      onClick={() => navigate('/assessor')}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Assessor Panel
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem 
                    onClick={() => navigate('/dashboard')}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm sm:text-base opacity-90">
          Advanced language proficiency evaluation with detailed feedback
        </p>
      </div>
    </header>
  );
};

export default Header;
