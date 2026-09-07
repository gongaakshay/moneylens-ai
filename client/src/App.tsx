import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AppProvider } from "@/context/AppContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { LandingPage } from "@/components/LandingPage";
import { Login } from "@/components/Login";
import { Register } from "@/components/Register";
import { ForgotPassword } from "@/components/ForgotPassword";
import { Dashboard } from "@/components/Dashboard";
import { MonthDetail } from "@/components/MonthDetail";
import { Profile } from "@/components/Profile";
import { Layout } from "@/components/Layout/Layout";
import { ProtectedRoute } from "@/components/Layout/ProtectedRoute";

function App() {
  return (
    <AppProvider>
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/month/:monthId" element={<MonthDetail />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      <Toaster />
      <Analytics />
    </AppProvider>
  );
}

export default App;
