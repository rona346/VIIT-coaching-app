import { useState } from "react";
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  CreditCard,
  Award,
  Bell,
  LogOut,
  Menu,
  X,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  role: string | null;
}

export default function Layout({ children, role }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminLinks = [
    { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    { name: "Students", icon: Users, id: "students" },
    { name: "Courses", icon: BookOpen, id: "courses" },
    { name: "Tasks", icon: ClipboardList, id: "tasks" },
    { name: "Fees", icon: CreditCard, id: "fees" },
    { name: "Certificates", icon: Award, id: "certificates" },
    { name: "Notifications", icon: Bell, id: "notifications" },
  ];

  const studentLinks = [
    { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    { name: "My Courses", icon: BookOpen, id: "my-courses" },
    { name: "My Tasks", icon: ClipboardList, id: "my-tasks" },
    { name: "Fee Status", icon: CreditCard, id: "fee-status" },
    { name: "Certificates", icon: Award, id: "my-certificates" },
    { name: "Notifications", icon: Bell, id: "notifications" },
  ];

  const links = role === "admin" ? adminLinks : studentLinks;

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-neutral-200 p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900">VIIT Institute</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link) => (
            <button
              key={link.id}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <link.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{link.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </nav>

        <div className="pt-6 mt-6 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <UserCircle className="w-10 h-10 text-neutral-300" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {auth.currentUser?.displayName || "User"}
              </p>
              <p className="text-xs text-neutral-500 capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 h-16 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-neutral-900">VIIT</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-neutral-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[70] lg:hidden p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-neutral-900">VIIT</h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-neutral-600" />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {links.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setSidebarOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-all font-medium"
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </button>
                ))}
              </nav>

              <div className="pt-6 mt-6 border-t border-neutral-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 overflow-x-hidden relative">
        <div className="hidden lg:flex absolute top-10 right-10 items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-neutral-200 rounded-xl">
            <UserCircle className="w-6 h-6 text-neutral-300" />
            <span className="text-sm font-semibold text-neutral-900">
              {auth.currentUser?.displayName || "User"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
