import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, User } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function BottomNav() {
  const location = useLocation();
  const { user } = useApp();

  const isDashboardActive =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/month/");
  const isProfileActive = location.pathname === "/profile";

  const navItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      active: isDashboardActive,
    },
    {
      path: "/profile",
      icon: User,
      label: user?.name || "Profile",
      active: isProfileActive,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/98 backdrop-blur-lg border-t border-slate-700/50 shadow-lg">
      <div className="grid grid-cols-2 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                item.active
                  ? "text-emerald-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {item.active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

