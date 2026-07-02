"use client";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <input type="checkbox" id="tm-toggle" className="tm-toggle" />
      <label htmlFor="tm-toggle" className="tm-hamburger">
        <span></span>
        <span></span>
        <span></span>
      </label>
      <label htmlFor="tm-toggle" className="tm-overlay"></label>
      <aside className="tm-drawer">
        <Sidebar />
      </aside>
      <main className="tm-main">
        {children}
      </main>
    </div>
  );
}
