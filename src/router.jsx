// src/router.jsx
// React Router v6+ route stubs for KovaFlo portal
// Install: npm i react-router-dom

import { createBrowserRouter, RouterProvider, Outlet, Navigate, Link } from "react-router-dom";
import KovaFloHomepage from "./pages/KovaFloHomepage.jsx";

// ---- Portal Shell (layout for /app/*) ----
function PortalShell() {
  return (
    <div className="min-h-screen bg-[#F9FBFD] text-gray-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-[#D0E8F0]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Brand links to /app/dashboard */}
          <Link to="dashboard" className="flex items-center gap-2 select-none">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#004581] to-[#019ABD]" />
            <span className="text-xl font-extrabold tracking-tight text-[#004581]">
              Kova<span className="text-[#019ABD]">Flo</span>
            </span>
          </Link>
          {/* NOTE: Relative links so they resolve under /app/* */}
          <div className="hidden md:flex gap-6 text-sm font-semibold text-[#004581]">
            <Link to="projects" className="hover:text-[#019ABD]">Projects</Link>
            <Link to="reports" className="hover:text-[#019ABD]">Reports</Link>
            <Link to="weekly" className="hover:text-[#019ABD]">Weekly</Link>
            <Link to="materials" className="hover:text-[#019ABD]">Materials</Link>
            <Link to="photos" className="hover:text-[#019ABD]">Photos</Link>
            <Link to="punchlist" className="hover:text-[#019ABD]">Punchlist</Link>
            <Link to="admin" className="hover:text-[#019ABD]">Admin</Link>
          </div>
          <Link to="login" className="text-sm font-semibold text-[#004581] md:hidden">Login</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
      <footer className="bg-[#004581] text-white text-center py-6 text-sm mt-16">
        © {new Date().getFullYear()} KovaFlo
      </footer>
    </div>
  );
}

// ---- Guards (replace with real auth later) ----
function ProtectedRoute({ children }) {
  const isAuthed = true; // TODO: Firebase Auth
  return isAuthed ? children : <Navigate to="/app/login" replace />;
}
function RoleGuard({ role, children }) {
  const userRole = "admin"; // TODO: role from claims
  return userRole === role ? children : <Navigate to="/app/dashboard" replace />;
}

// ---- Simple stub section ----
function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#D0E8F0] bg-white shadow p-6">
      <h1 className="text-2xl font-bold text-[#004581] mb-3">{title}</h1>
      {children ? children : <p className="text-gray-600">Coming soon…</p>}
    </div>
  );
}

// ---- Portal pages (stubs) ----
function Login() { return <Section title="Login" />; }
function Dashboard() { return <Section title="Dashboard" />; }
function Projects() { return <Section title="Projects" />; }
function ProjectDetail() { return <Section title="Project Detail" />; }
function Reports() { return <Section title="Reports" />; }
function ReportEditor() { return <Section title="Report Editor" />; }
function ReportReview() { return <Section title="Report Review" />; }
function Weekly() { return <Section title="Weekly Summaries" />; }
function Materials() { return <Section title="Materials" />; }
function Photos() { return <Section title="Photos" />; }
function Punchlist() { return <Section title="Punchlist" />; }
function AdminShell() { return <Section title="Admin"><Outlet /></Section>; }
function AdminHome() { return <div className="text-gray-600">Users • Projects • Templates • Settings</div>; }
function AdminUsers() { return <Section title="Admin • Users" />; }
function AdminProjects() { return <Section title="Admin • Projects" />; }
function AdminTemplates() { return <Section title="Admin • Templates" />; }
function AdminSettings() { return <Section title="Admin • Settings" />; }
function NotFound() { return <Section title="404">Page not found.</Section>; }

// ---- Router ----
const router = createBrowserRouter([
  // Marketing site at root
  { path: "/", element: <KovaFloHomepage /> },

  // Portal under /app/*
  {
    path: "/app",
    element: <PortalShell />,
    children: [
      { path: "login", element: <Login /> },
      {
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "projects", element: <Projects /> },
          { path: "projects/:projectId", element: <ProjectDetail /> },
          { path: "reports", element: <Reports /> },
          { path: "reports/new", element: <ReportEditor /> },
          { path: "reports/:reportId/review", element: <ReportReview /> },
          { path: "weekly", element: <Weekly /> },
          { path: "materials", element: <Materials /> },
          { path: "photos", element: <Photos /> },
          { path: "punchlist", element: <Punchlist /> },
          {
            path: "admin",
            element: (
              <RoleGuard role="admin">
                <AdminShell />
              </RoleGuard>
            ),
            children: [
              { index: true, element: <AdminHome /> },
              { path: "users", element: <AdminUsers /> },
              { path: "projects", element: <AdminProjects /> },
              { path: "templates", element: <AdminTemplates /> },
              { path: "settings", element: <AdminSettings /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },

  // Catch-all (if someone hits a random path)
  { path: "*", element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

/* --- How to use ---
1) Save as src/router.jsx
2) Install router: npm i react-router-dom
3) In src/main.jsx:

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import AppRouter from './router'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
)

4) Ensure your homepage nav has a link to "/app/login".
5) For production on static hosting (Vercel/Netlify), add a SPA fallback rewrite so refreshes work.
*/