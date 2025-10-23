import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import KovaFloHomepage from "./pages/KovaFloHomepage.jsx";
import AdminWaitlist from "./pages/AdminWaitlist.jsx";


// Treat /admin, /admin/, /admin?x=1, /admin/anything as admin route
function isAdminRoute(pathname = window.location.pathname) {
  return /^\/admin(\/|$)/.test(pathname);
}


// Simple error boundary so we SEE errors instead of a white screen
class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state = { hasError:false, err:null, info:null }; }
  static getDerivedStateFromError(err){ return { hasError:true, err }; }
  componentDidCatch(err, info){ console.error("React error boundary:", err, info); this.setState({info}); }
  render(){
    if (this.state.hasError) {
      return (
        <div style={{padding:16,fontFamily:"ui-sans-serif",whiteSpace:"pre-wrap"}}>
          <h2>Something broke</h2>
          <div style={{color:"#b91c1c",marginTop:8}}>{String(this.state.err)}</div>
          {this.state.info && <details><summary>Stack</summary><pre>{this.state.info.componentStack}</pre></details>}
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
