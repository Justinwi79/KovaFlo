import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import KovaFloHomepage from "./pages/KovaFloHomepage.jsx";
import AdminWaitlist from "./pages/AdminWaitlist.jsx";
import ManagementDashboard from "./pages/ManagementDashboard.jsx";
import InspectorDashboard from "./pages/InspectorDashboard.jsx";

// Minimal error boundary so we see errors instead of a blank screen
class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state = { hasError:false, err:null }; }
  static getDerivedStateFromError(err){ return { hasError:true, err }; }
  componentDidCatch(err, info){ console.error("React error:", err, info); }
  render(){
    if (this.state.hasError) {
      return (
        <div style={{padding:16,fontFamily:"ui-sans-serif"}}>
          <h2>Something broke</h2>
          <pre style={{whiteSpace:"pre-wrap", color:"#b91c1c"}}>{String(this.state.err)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<KovaFloHomepage />} />
          <Route path="/admin/*" element={<AdminWaitlist />} />
          <Route path="/management/*" element={<ManagementDashboard />} />
          <Route path="/inspector/*" element={<InspectorDashboard />} />
          {/* catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
