import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/layout/RequireAuth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyCase from "./pages/patient/MyCase";
import MyPrescriptions from "./pages/patient/MyPrescriptions";
import Cases from "./pages/staff/Cases";
import CaseDetail from "./pages/staff/CaseDetail";
import Patients from "./pages/staff/Patients";
import Prescribe from "./pages/staff/Prescribe";
import Prescriptions from "./pages/staff/Prescriptions";
import Wallet from "./pages/Wallet";
import Tools from "./pages/Tools";
import Users from "./pages/admin/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/my-case" element={<RequireAuth roles={['patient']}><MyCase /></RequireAuth>} />
            <Route path="/my-prescriptions" element={<RequireAuth roles={['patient']}><MyPrescriptions /></RequireAuth>} />
            <Route path="/cases" element={<RequireAuth roles={['commission', 'admin']}><Cases /></RequireAuth>} />
            <Route path="/cases/:id" element={<RequireAuth roles={['commission', 'admin', 'doctor']}><CaseDetail /></RequireAuth>} />
            <Route path="/patients" element={<RequireAuth roles={['doctor', 'commission', 'admin']}><Patients /></RequireAuth>} />
            <Route path="/prescribe/:caseId" element={<RequireAuth roles={['doctor', 'commission', 'admin']}><Prescribe /></RequireAuth>} />
            <Route path="/prescriptions" element={<RequireAuth roles={['doctor', 'commission', 'admin']}><Prescriptions /></RequireAuth>} />
            <Route path="/tools" element={<RequireAuth roles={['doctor', 'commission', 'admin']}><Tools /></RequireAuth>} />
            <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth roles={['admin']}><Users /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Routes.length ? null : null}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
