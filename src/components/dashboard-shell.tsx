"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gamepad2,
  MessageCircle,
  Calendar,
  BarChart3,
  LogOut,
  Menu,
  X,
  Home,
  User,
} from "lucide-react";
import { NotificationBell } from "./notification-bell";

type UserType = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

const navItems = [
  { href: "/dashboard", label: "Ana Sayfa", icon: Home, emoji: "🏠" },
  { href: "/dashboard/chat", label: "Sohbet", icon: MessageCircle, emoji: "💬" },
  { href: "/dashboard/sessions", label: "Oyun Planları", icon: Calendar, emoji: "🎮" },
  { href: "/dashboard/polls", label: "Oylamalar", icon: BarChart3, emoji: "📊" },
  { href: "/dashboard/profile", label: "Profil", icon: User, emoji: "👤" },
];

export function DashboardShell({
  user,
  children,
}: {
  user: UserType;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-surface/80 backdrop-blur-xl border-r border-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg gradient-text">Orontes</h1>
            <p className="text-[10px] text-muted uppercase tracking-wider">Gaming Squad</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-muted hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <span className="text-lg">{item.emoji}</span>
                <Icon className="w-4 h-4" />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-sm font-bold text-white shadow-lg">
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="w-full flex items-center justify-center gap-2 text-xs text-muted hover:text-danger transition bg-surface hover:bg-danger/10 rounded-lg py-2 border border-border hover:border-danger/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface/50 backdrop-blur-xl sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted hover:text-foreground transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted">
            <Gamepad2 className="w-4 h-4" />
            <span>
              {navItems.find(
                (n) =>
                  pathname === n.href ||
                  (n.href !== "/dashboard" && pathname.startsWith(n.href))
              )?.label || "Dashboard"}
            </span>
          </div>
          <div className="flex-1" />
          <NotificationBell />
          <div className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-xs font-bold text-white">
            {user.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
