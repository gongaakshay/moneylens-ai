import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, User } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Check if we're on Dashboard or Month Detail (which is part of dashboard navigation)
  const isDashboardActive = location.pathname === "/dashboard" || 
                           location.pathname.startsWith("/month/");

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/dashboard" className="group">
              <Logo size="md" className="group-hover:opacity-90 transition-opacity justify-start" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/dashboard" className="relative">
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                {isDashboardActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                )}
              </Link>

              <Link to="/profile" className="relative">
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <User className="w-4 h-4 mr-2" />
                  {user?.name || user?.username || "Profile"}
                </Button>
                {location.pathname === "/profile" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                )}
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="md:hidden text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu removed - using persistent bottom nav instead */}
    </>
  );
}
