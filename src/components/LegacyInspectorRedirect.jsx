import { Navigate } from "react-router-dom";

export default function LegacyInspectorRedirect({ defaultPid = "sjb" }) {
  return <Navigate to={`/p/${defaultPid}/inspector`} replace />;
}
