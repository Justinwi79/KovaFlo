import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import KovaFloHomepage from "./pages/KovaFloHomepage.jsx";
import AdminWaitlist from "./pages/AdminWaitlist.jsx";

// Treat /admin, /admin/, /admin?x=1, /admin/anything as admin route
function isAdminRoute(pathname = window.location.pathname) {
  return /^\/admin(\/|$)/.test(pathname);
}

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

const App = isAdminRoute() ? <AdminWaitlist /> : <KovaFloHomepage />;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>{App}</ErrorBoundary>
  </React.StrictMode>
);
