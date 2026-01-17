import { Navigate, useParams } from "react-router-dom";

// Redirects /admin/* -> /p/<defaultPid>/admin/*
// and /inspector -> /p/<defaultPid>/inspector (via separate route below)
export default function LegacyAdminRedirect({ defaultPid = "sjb" }) {
  // React Router v6 wildcard capture via "*"
  const { "*": rest = "" } = useParams();
  return <Navigate to={`/p/${defaultPid}/admin/${rest}`} replace />;
}
