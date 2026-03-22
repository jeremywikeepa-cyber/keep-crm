import { useLocation } from "wouter";
import { api } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LayoutDashboard, Users, Settings, LogOut, ChevronDown, Building2 } from "lucide-react";
import { cn } from "../lib/utils";

interface NavbarProps {
  onLogout: () => void;
}

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar({ onLogout }: NavbarProps) {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await api.logout();
      queryClient.clear();
      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      onLogout();
    }
  };

  return (
    <nav className="bg-white border-b border-[#E8E8E8] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-7 h-7 bg-[#111111] rounded-sm flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span style={{ fontFamily: '"DM Sans", sans-serif', color: "#111111", fontSize: "15px", fontWeight: 600, lineHeight: 1 }}>
                Keep Group
              </span>
              <span style={{ display: "block", color: "#999999", fontSize: "10px", lineHeight: 1, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2px", fontFamily: '"DM Sans", sans-serif' }}>
                Trixie OS
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/"
                  ? location === "/"
                  : location.startsWith(href);
              return (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-[#F5F5F5] text-[#111111] font-medium"
                      : "text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/leads/new")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-[#111111] text-white hover:bg-[#333333] transition-colors"
            >
              <span className="text-base leading-none">+</span>
              New Lead
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7] transition-colors">
                <div className="w-6 h-6 rounded-full bg-[#111111] flex items-center justify-center text-xs text-white font-semibold">
                  K
                </div>
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                  className="cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
