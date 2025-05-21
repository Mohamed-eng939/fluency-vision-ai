
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Redirect if already logged in
  if (user) {
    // Get the redirect path or default based on user role
    const from = location.state?.from?.pathname || 
      (user.role === 'admin' ? '/admin' : 
       user.role === 'assessor' ? '/assessor' : 
       '/dashboard');
    
    return <Navigate to={from} replace />;
  }
  
  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="mx-auto max-w-md w-full">
        <Card className="border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-assessment-blue">LinguaSpeak</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
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
            &copy; {new Date().getFullYear()} LinguaSpeak. All rights reserved.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
