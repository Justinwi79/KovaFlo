import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import KovaFloHomepage from "./pages/KovaFloHomepage.jsx";
import SJBReport from "./pages/SJBReport.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminWaitlist from "./pages/admin/AdminWaitlist.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";

import RequireAdmin from "./components/RequireAdmin.jsx";
import RequireInspector from "./components/RequireInspector.jsx";
import RequireProject from "./components/RequireProject.jsx";
import ChooseRole from "./pages/ChooseRole.jsx";
import LegacyAdminRedirect from "./components/LegacyAdminRedirect.jsx";
import LegacyInspectorRedirect from "./components/LegacyInspectorRedirect.jsx";

function ErrorBoundary({ error }) {
  if (!error) return null;
  return (
    <div className="min-h-screen bg-[#FFF5F5] text-[#7F1D1D] p-6">
      <h1 className="text-xl font-bold mb-2">Something broke</h1>
      <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">
        {String(error?.stack || error?.message || error)}
      </pre>
    </div>
  );
}

function AppRouter() {
  const [err, setErr] = React.useState(null);

  const router = React.useMemo(
    () =>
      createBrowserRouter([
        // Public homepage
        { path: "/", element: <KovaFloHomepage /> },

        // Project-scoped routes (each guarded by RequireProject)
        { path: "/p/:pid/choose", element: (
            <RequireProject>
              <ChooseRole />
            </RequireProject>
          )
        },

        // Inspector workspace
        { path: "/p/:pid/inspector", element: (
            <RequireProject>
              <RequireInspector>
                <SJBReport />
              </RequireInspector>
            </RequireProject>
          )
        },

        // Admin workspace
        { path: "/p/:pid/admin", element: (
            <RequireProject>
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            </RequireProject>
          )
        },
        { path: "/p/:pid/admin/waitlist", element: (
            <RequireProject>
              <RequireAdmin>
                <AdminWaitlist />
              </RequireAdmin>
            </RequireProject>
          )
        },
        { path: "/p/:pid/admin/reports", element: (
            <RequireProject>
              <RequireAdmin>
                <AdminReports />
              </RequireAdmin>
            </RequireProject>
          )
        },
        { path: "/admin/*", element: (
          <LegacyAdminRedirect defaultPid="sjb" />
        )
        },
        { path: "/inspector", element: (
          <LegacyInspectorRedirect defaultPid="sjb" />
      )
    },
      ]),
    []
  );

  return (
    <>
      <RouterProvider
        router={router}
        fallbackElement={<div className="p-6">Loading…</div>}
        future={{ v7_startTransition: true }}
        onError={(e) => setErr(e)}
      />
      <ErrorBoundary error={err} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
