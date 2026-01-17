import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function RequireInspector({ children }) {
  const navigate = useNavigate();
  const { pid } = useParams();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setStatus("deny"); navigate("/", { replace: true }); return; }
      try {
        const ref = doc(db, "projects", String(pid).toLowerCase(), "members", user.uid);
        const snap = await getDoc(ref);
        const d = snap.data() || {};
        if (d.inspector === true || d.admin === true) setStatus("ok");
        else { setStatus("deny"); navigate("/", { replace: true }); }
      } catch {
        setStatus("deny"); navigate("/", { replace: true });
      }
    });
    return () => unsub();
  }, [navigate, pid]);

  if (status === "checking") return <div className="min-h-screen grid place-items-center">Checking inspector…</div>;
  return children;
}
