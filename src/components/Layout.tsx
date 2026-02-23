import { ReactNode } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Shield, LayoutDashboard, Key, Users, Settings, LogOut, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!session) {
    return <>{children}</>;
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["USER", "ADMIN", "SUPER_ADMIN"] },
    { name: "Chat", href: "/chat", icon: Shield, roles: ["USER", "ADMIN", "SUPER_ADMIN"] },
    { name: "API Keys", href: "/keys", icon: Key, roles: ["ADMIN", "SUPER_ADMIN"] },
    { name: "Users", href: "/users", icon: Users, roles: ["ADMIN", "SUPER_ADMIN"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN", "SUPER_ADMIN"] },
  ];

  const filteredNav = navigation.filter((item) => item.roles.includes(session.user.role));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-cyan-500/20 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-cyan-500/20 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Shield className="h-6 w-6 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-mono text-lg font-bold text-cyan-400">Shield AI</h1>
              <p className="text-xs text-slate-400">Security Gateway</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {filteredNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 transition-all hover:bg-cyan-500/10 hover:text-cyan-400"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="m-4 flex items-center justify-center rounded-lg border border-cyan-500/20 p-2 text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-400"
        >
          <Menu className="h-5 w-5" />
        </button>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {session.user.tenantDomain}
              </h2>
              <p className="text-sm text-slate-400">{session.user.role}</p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-cyan-400">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cyan-500"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-cyan-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                        {session.user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left md:block">
                      <p className="text-sm font-medium text-white">{session.user.name || session.user.email}</p>
                      <p className="text-xs text-slate-400">{session.user.email}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-cyan-500/20 bg-slate-900">
                  <DropdownMenuLabel className="text-slate-200">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-cyan-500/20" />
                  <DropdownMenuItem className="text-slate-300 focus:bg-cyan-500/10 focus:text-cyan-400">
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 focus:bg-cyan-500/10 focus:text-cyan-400">
                    API Documentation
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-cyan-500/20" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}