
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/auth';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useBrandingContext } from '@/contexts/branding/BrandingContext';
import { roleLabel } from '@/data/roles';

const Login: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const brand = useBrandingContext();
  const [signingOut, setSigningOut] = useState(false);

  // Already signed in: DON'T silently redirect away. That silent redirect
  // trapped anyone who needed to switch accounts (e.g. signed in as a learner
  // but needing the admin login) — the login form would never appear. Instead
  // show who they are, with a clear way to continue or sign out and switch.
  if (user) {
    const dashboard =
      user.role === 'admin' ? '/admin' : user.role === 'assessor' ? '/assessor' : '/';
    const from = location.state?.from?.pathname || dashboard;
    const handleSwitchAccount = async () => {
      setSigningOut(true);
      try {
        await signOut();
      } finally {
        setSigningOut(false);
        navigate('/login', { replace: true });
      }
    };
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="mx-auto max-w-md w-full">
          <Card className="border shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-assessment-blue">{brand.displayName}</CardTitle>
              <CardDescription>You're already signed in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{user.email}</span>
                {user.role ? <> — role: <span>{roleLabel(user.role)}</span></> : null}
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate(from, { replace: true })}>
                  Continue to my dashboard
                </Button>
                <Button variant="outline" onClick={handleSwitchAccount} disabled={signingOut}>
                  {signingOut ? 'Signing out…' : 'Sign out & use another account'}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {brand.displayName}. All rights reserved.
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="mx-auto max-w-md w-full">
        <Card className="border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-assessment-blue">{brand.displayName}</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={initialTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {brand.displayName}. All rights reserved.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
