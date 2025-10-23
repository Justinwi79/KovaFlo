// src/pages/AdminWaitlist.jsx
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db, auth } from "../lib/firebase";

/** ---------- CSV helpers ---------- */
function csvEscape(v = "") {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function downloadCSV(rows) {
  const headers = ["email", "company", "createdAt"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.email, r.company ?? "", r.createdAt ? new Date(r.createdAt).toISOString() : ""]
        .map(csvEscape)
        .join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** ---------- Auth gate (email/password) that verifies Firestore role=admin ---------- */
function AuthGate({ onAuthed }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const role = snap.exists() ? snap.data().role : null;

        if (role === "admin") {
          if (!/^\/admin(\/|$)/.test(window.location.pathname)) {
            window.location.replace("/admin");
            return;
          }
          onAuthed(u);
        } else {
          setErr("You are signed in but not an admin.");
        }
      } catch (e) {
        console.error(e);
        setErr("Could not verify admin role.");
      }
    });
    return () => unsub();
  }, [onAuthed]);

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      // onAuthStateChanged will handle role check & URL pin
    } catch (e) {
      console.error(e);
      setErr(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFD] flex items-center justify-center p-6">
      <div className="rounded-2xl border border-[#D0E8F0] bg-white shadow p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#004581] mb-2">Admin Login</h1>
        <p className="text-gray-600 mb-4">Sign in with your admin account.</p>
        <form className="grid gap-3" onSubmit={login}>
          <input
            className="px-3 py-2 rounded-md border border-[#D0E8F0] focus:outline-none focus:ring-2 focus:ring-[#019ABD]"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="px-3 py-2 rounded-md border border-[#D0E8F0] focus:outline-none focus:ring-2 focus:ring-[#019ABD]"
            placeholder="••••••••"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button
            disabled={busy}
            className="h-10 px-4 rounded-2xl bg-[#004581] text-white font-semibold hover:bg-[#019ABD]"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {err && <p className="text-sm text-red-700 mt-2">{err}</p>}
        </form>
      </div>
    </div>
  );
}

/** ---------- Main Admin screen (requires role=admin) ---------- */
export default function AdminWaitlist() {
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load waitlist after successful admin auth
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toMillis ? data.createdAt.toMillis() : null;
          return {
            id: d.id,
            email: data.email || "",
            company: data.company || "",
            createdAt: ts,
          };
        });
        setRows(items);
      } catch (e) {
        console.error(e);
        setError("Failed to load waitlist.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return <AuthGate onAuthed={setUser} />;

  const total = rows.length;
  const latest = useMemo(
    () => (rows[0]?.createdAt ? new Date(rows[0].createdAt).toLocaleString() : "—"),
    [rows]
  );

  return (
    <div className="min-h-screen bg-[#F9FBFD] text-gray-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-[#D0E8F0]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <a href="/" className="flex items-center gap-2 select-none">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#004581] to-[#019ABD]" />
            <span className="text-xl font-extrabold tracking-tight text-[#004581]">
              Kova<span className="text-[#019ABD]">Flo</span> Admin
            </span>
          </a>
          <div className="flex items-center gap-4">
            <div className="text-sm text-[#004581]">
              {total} entries • Latest: {latest}
            </div>
            <button
              onClick={() => signOut(auth)}
              className="text-sm text-[#004581] underline"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-2xl border border-[#D0E8F0] bg-white shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h1 className="text-2xl font-bold text-[#004581]">Waitlist</h1>
            <div className="flex gap-3">
              <button
                onClick={() => downloadCSV(rows)}
                className="inline-flex items-center justify-center h-10 px-4 rounded-2xl bg-[#004581] text-white font-semibold hover:bg-[#019ABD]"
                disabled={!rows.length}
              >
                Export CSV
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center h-10 px-4 rounded-2xl border border-[#D0E8F0] text-[#004581] font-semibold hover:bg-[#F1F7FA]"
              >
                Back to Site
              </a>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading…</p>
          ) : error ? (
            <p className="text-red-700">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-gray-600">No signups yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-[#E6F0F4] text-[#004581]">
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-[#F0F6F9]">
                      <td className="py-2 pr-4">{r.email}</td>
                      <td className="py-2 pr-4">{r.company || "—"}</td>
                      <td className="py-2">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-[#004581] text-white text-center py-6 text-sm mt-16">
        © {new Date().getFullYear()} KovaFlo
      </footer>
    </div>
  );
}
