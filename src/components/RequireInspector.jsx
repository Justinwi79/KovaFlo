import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function RequireInspector({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setStatus("denied"); navigate("/", { replace: true }); return; }
      try {
        const snap = await getDoc(doc(db, "roles", user.uid));
        const data = snap.data() || {};
        if (data.inspector === true || data.admin === true) setStatus("allowed");
        else { setStatus("denied"); navigate("/", { replace: true }); }
      } catch {
        setStatus("denied"); navigate("/", { replace: true });
      }
    });
    return () => unsub();
  }, [navigate]);

  if (status === "checking") return <div className="min-h-screen grid place-items-center">Checking access…</div>;
  return children;
}
