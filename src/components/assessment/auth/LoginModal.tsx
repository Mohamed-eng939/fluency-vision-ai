
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { StudentInfo } from '@/hooks/assessment';

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
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Retrieve users from localStorage
      const users = JSON.parse(localStorage.getItem('lingua_auth_users') || '[]');
      
      // Find user by username/email and password
      const user = users.find((u: any) => 
        (u.username === credentials.username || u.email === credentials.username) && 
        u.password === credentials.password
      );
      
      if (user) {
        // Login successful
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(user);
          onOpenChange(false); // Close modal
        }, 500); // Small delay to show loading state
      } else {
        // Login failed
        setTimeout(() => {
          setIsLoading(false);
          setError('Invalid username or password');
        }, 500);
      }
    } catch (err) {
      console.error('Error during login:', err);
      setIsLoading(false);
      setError('An error occurred during login');
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
