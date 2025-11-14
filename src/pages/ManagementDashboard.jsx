import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function ManagementDashboard() {
  const [user, setUser] = useState(null);
  const [roleOk, setRoleOk] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      setRoleOk(false);
      setRole(null);
      if (!u) return;
      const snap = await getDoc(doc(db, "users", u.uid));
      const r = snap.exists() ? snap.data().role : null;
      setRole(r);
      setRoleOk(r === "manager" || r === "management" || r === "admin");
    });
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F9FBFD]">
        <div className="text-center">
          <p className="mb-4">Please sign in to access the Management Dashboard.</p>
          <a href="/" className="text-[#004581] underline">Back to home</a>
        </div>
      </div>
    );
  }

  if (!roleOk) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F9FBFD]">
        <div className="text-center text-red-700">
          <p className="mb-4">You do not have access to Management Dashboard.</p>
          <a href="/" className="text-[#004581] underline">Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFD] text-gray-900">
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b border-[#D0E8F0]">
        <nav className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <a href="/" className="text-xl font-extrabold text-[#004581]">
            Kova<span className="text-[#019ABD]">Flo</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#004581]">{role}</span>
            <button onClick={()=>signOut(auth)} className="text-sm text-[#004581] underline">Sign out</button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-[#004581] mb-4">Management Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#D0E8F0] bg-white p-6">KPIs (reports/day, pass rate, SLA)</div>
          <div className="rounded-2xl border border-[#D0E8F0] bg-white p-6">Pending approvals</div>
          <div className="rounded-2xl border border-[#D0E8F0] bg-white p-6">Inspector workload</div>
          <div className="rounded-2xl border border-[#D0E8F0] bg-white p-6">Exports / downloads</div>
        </div>
      </main>
    </div>
  );
}
