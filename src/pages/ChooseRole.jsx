import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function ChooseRole() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState({ admin: false, inspector: false });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate("/", { replace: true }); return; }
      try {
        const snap = await getDoc(doc(db, "roles", user.uid));
        const data = snap.data() || {};
        setRoles({ admin: !!data.admin, inspector: !!data.inspector || !!data.admin });
      } finally { setLoading(false); }
    });
    return () => unsub();
  }, [navigate]);

  if (loading) return <div className="min-h-screen grid place-items-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#F9FBFD] text-gray-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-[#D0E8F0]">
        <nav className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 select-none">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#004581] to-[#019ABD]" />
            <span className="text-lg font-extrabold text-[#004581]">Kova<span className="text-[#019ABD]">Flo</span></span>
          </a>
          <a href="/" className="px-3 py-2 rounded-xl text-[#004581] hover:bg-[#E6F0F4]">Home</a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-bold text-[#004581] mb-6">Choose your workspace</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className={`rounded-2xl border border-[#D0E8F0] bg-white p-6 ${roles.inspector ? "hover:shadow" : "opacity-50"}`}>
            <h2 className="text-lg font-semibold text-[#004581] mb-2">Inspector</h2>
            <p className="text-sm text-gray-600 mb-4">Fill out daily reports and export PDFs.</p>
            {roles.inspector ? (
              <Link to="/inspector" className="btn">Enter Inspector</Link>
            ) : (
              <button disabled className="btn-secondary">No access</button>
            )}
          </div>

          <div className={`rounded-2xl border border-[#D0E8F0] bg-white p-6 ${roles.admin ? "hover:shadow" : "opacity-50"}`}>
            <h2 className="text-lg font-semibold text-[#004581] mb-2">Management</h2>
            <p className="text-sm text-gray-600 mb-4">View waitlist and submitted reports.</p>
            {roles.admin ? (
              <Link to="/admin" className="btn">Enter Admin</Link>
            ) : (
              <button disabled className="btn-secondary">No access</button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
