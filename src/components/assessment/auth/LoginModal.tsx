
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { StudentInfo } from '@/hooks/assessment';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: (user: StudentInfo) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  open, 
  onOpenChange,
  onLoginSuccess
}) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Resolve a username to its email (real auth is by email).
      let loginEmail = credentials.username.trim();
      if (!loginEmail.includes('@')) {
        const { data: profile, error: lookupError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', loginEmail)
          .single();
        if (lookupError || !profile?.email) {
          setError('Invalid username or password');
          setIsLoading(false);
          return;
        }
        loginEmail = profile.email;
      }

      // Real Supabase authentication.
      const { error: signInError } = await signIn(loginEmail, credentials.password);
      if (signInError) {
        setError(signInError.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Route by role: testers/admins go to their panels; learners continue.
      const { data: { user } } = await supabase.auth.getUser();
      let role: string | undefined;
      let fullName: string | undefined;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
        role = profile?.role;
        fullName = profile?.full_name ?? undefined;
      }

      setIsLoading(false);
      onOpenChange(false);

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'assessor') {
        navigate('/assessor');
      } else {
        onLoginSuccess({
          name: fullName || user?.email || 'Learner',
          email: user?.email || loginEmail,
        } as StudentInfo);
      }
    } catch (err) {
      console.error('Error during login:', err);
      setIsLoading(false);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Log In</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="username">Username or Email</Label>
            <Input
              id="username"
              name="username"
              placeholder="Enter your username or email"
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <DialogFooter className="sm:justify-between items-center mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
