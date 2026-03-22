import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Calendar, User, LogOut,
  Menu, X, Bell, ChevronDown, Stethoscope, BarChart2
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/doctor/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { path: "/doctor/appointments", label: "Appointments", icon: Calendar         },
  { path: "/doctor/profile",      label: "My Profile",   icon: User             },
  { path: "/doctor/analytics",    label: "Analytics",    icon: BarChart2        },
];

export default function DoctorLayout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const [collapsed,       setCollapsed]       = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [mobileOpen,      setMobileOpen]      = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // ── Sidebar content (shared between desktop + mobile) ─────────────────────
  const SidebarContent = ({ mobile = false }) => (
    <div
      className="flex flex-col h-full"
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(11,37,69,0.08)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(11,37,69,0.06)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
        >
          <Stethoscope size={18} color="white" />
        </div>
        <AnimatePresence>
          {(!collapsed || mobile) && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-black text-lg overflow-hidden whitespace-nowrap"
              style={{ color: "#0B2545", fontFamily: "var(--font-sans)" }}
            >
              Medi<span style={{ color: "#0DC4A1" }}>Connect</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Role badge */}
      {(!collapsed || mobile) && (
        <div className="px-5 py-3">
          <span
            className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: "rgba(13,196,161,0.1)", color: "#0DC4A1" }}
          >
            Doctor Portal
          </span>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <motion.button
              key={path}
              whileHover={{ x: collapsed && !mobile ? 0 : 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                navigate(path);
                if (mobile) setMobileOpen(false);
              }}
              title={collapsed && !mobile ? label : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active
                  ? "linear-gradient(135deg, rgba(13,196,161,0.15), rgba(11,37,69,0.08))"
                  : "transparent",
                color: active ? "#0B2545" : "#64748b",
                border: active ? "1px solid rgba(13,196,161,0.2)" : "1px solid transparent",
                justifyContent: collapsed && !mobile ? "center" : "flex-start",
              }}
            >
              <Icon
                size={18}
                style={{ color: active ? "#0DC4A1" : "#94a3b8", flexShrink: 0 }}
              />
              <AnimatePresence>
                {(!collapsed || mobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && (!collapsed || mobile) && (
                <motion.div
                  layoutId="doctor-active-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#0DC4A1" }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid rgba(11,37,69,0.06)" }}
      >
        <motion.button
          whileHover={{ x: collapsed && !mobile ? 0 : 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          title={collapsed && !mobile ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            color: "#E8604C",
            background: "rgba(232,96,76,0.06)",
            border: "1px solid rgba(232,96,76,0.1)",
            justifyContent: collapsed && !mobile ? "center" : "flex-start",
          }}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--mc-sky)", fontFamily: "var(--font-sans)" }}
    >
      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col flex-shrink-0 relative overflow-hidden"
        style={{ height: "100vh", boxShadow: "0 18px 50px rgba(11, 37, 69, 0.15)" }}
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{
            background: "white",
            border: "1px solid rgba(11,37,69,0.12)",
            boxShadow: "0 2px 8px rgba(11,37,69,0.1)",
            color: "#0B2545",
          }}
        >
          {collapsed ? <Menu size={11} /> : <X size={11} />}
        </motion.button>
      </motion.aside>

      {/* ── Mobile Overlay ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(11,37,69,0.35)", backdropFilter: "blur(4px)" }}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 md:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Area ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(26px)",
            borderBottom: "1px solid rgba(11,37,69,0.07)",
            boxShadow: "0 8px 24px rgba(11, 37, 69, 0.06)",
          }}
        >
          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(11,37,69,0.05)", color: "#0B2545" }}
          >
            <Menu size={18} />
          </motion.button>

          {/* Page title */}
          <p className="hidden md:block text-sm font-semibold" style={{ color: "#64748b" }}>
            {NAV_ITEMS.find((n) => isActive(n.path))?.label ?? "Doctor Portal"}
          </p>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(11,37,69,0.05)", color: "#0B2545" }}
            >
              <Bell size={17} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "#E8604C" }}
              />
            </motion.button>

            {/* Profile dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(11,37,69,0.05)",
                  border: "1px solid rgba(11,37,69,0.07)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "D"}
                </div>
                <span className="text-sm font-semibold hidden sm:block" style={{ color: "#0B2545" }}>
                  Dr. {user?.name?.split(" ")[0] || "Doctor"}
                </span>
                <ChevronDown
                  size={13}
                  style={{
                    color: "#94a3b8",
                    transform: profileDropdown ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </motion.button>

              <AnimatePresence>
                {profileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 rounded-2xl py-1.5 z-50"
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(24px)",
                      border: "1px solid rgba(11,37,69,0.1)",
                      boxShadow: "0 16px 40px rgba(11,37,69,0.12)",
                    }}
                  >
                    {[
                      { label: "My Profile", icon: User,   action: () => { navigate("/doctor/profile");  setProfileDropdown(false); } },
                      { label: "Logout",     icon: LogOut, action: handleLogout, danger: true },
                    ].map(({ label, icon: Icon, action, danger }) => (
                      <button
                        key={label}
                        onClick={action}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50"
                        style={{ color: danger ? "#E8604C" : "#0B2545" }}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}