
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useEffect } from "react";
import { setupAdminUser } from "./lib/supabase/setupAdmin";
import { useToast } from "./components/ui/use-toast";

// Import Dashboard pages that will be created
// These will need to be created later
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/admin/AdminPanel";
import AssessorPanel from "./pages/assessor/AssessorPanel";

const queryClient = new QueryClient();

const AppContent = () => {
  const { toast } = useToast();

  useEffect(() => {
    const initializeAdmin = async () => {
      const result = await setupAdminUser();
      if (result.success && result.password) {
        toast({
          title: "Admin Account Created",
          description: `Email: mohamed.tarek4115@gmail.com\nPassword: ${result.password}\n\nPlease save this password!`,
          duration: 0, // Never auto-dismiss
        });
        console.log("Admin account created with password:", result.password);
      }
    };
    
    initializeAdmin();
  }, [toast]);
  
  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route 
          path="/assessment" 
          element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Assessor routes */}
        <Route 
          path="/assessor/*" 
          element={
            <ProtectedRoute allowedRoles={['assessor']}>
              <AssessorPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
