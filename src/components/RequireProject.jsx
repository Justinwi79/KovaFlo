import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function RequireProject({ children }) {
  const { pid } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "projects", String(pid || "").toLowerCase()));
        if (snap.exists() && snap.data()?.active !== false) setStatus("ok");
        else { setStatus("bad"); navigate("/", { replace: true }); }
      } catch {
        setStatus("bad");
        navigate("/", { replace: true });
      }
    })();
  }, [pid, navigate]);

  if (status === "checking") {
    return <div className="min-h-screen grid place-items-center text-[#004581]">Loading project…</div>;
  }
  return children;
}
