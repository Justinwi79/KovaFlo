import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LogoutButton({ className = "btn-secondary" }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      setBusy(true);
      await signOut(auth);
      navigate("/", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={handleLogout} className={className} disabled={busy}>
      {busy ? "Logging out…" : "Logout"}
    </button>
  );
}
