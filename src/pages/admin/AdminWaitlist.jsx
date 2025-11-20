import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function AdminWaitlist() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRows(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function exportCSV() {
    const header = ["email", "name", "company", "notes", "createdAt"];
    const lines = [header.join(",")];
    rows.forEach(r => {
      const created = r.createdAt?.toDate?.()
        ? r.createdAt.toDate().toISOString()
        : (r.createdAt || "");
      const vals = [
        r.email || "",
        r.name || "",
        r.company || "",
        (r.notes || "").replaceAll('"', '""'),
        created,
      ];
      lines.push(vals.map(v => /[",\n]/.test(v) ? `"${v}"` : v).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#F9FBFD] text-gray-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-[#D0E8F0]">
        <nav className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 select-none">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#004581] to-[#019ABD]" />
            <span className="text-lg font-extrabold text-[#004581]">
              Kova<span className="text-[#019ABD]">Flo</span>
            </span>
          </Link>
          <Link to="/admin" className="px-3 py-2 rounded-xl text-[#004581] hover:bg-[#E6F0F4]">Admin</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#004581]">Waitlist</h1>
          <button className="btn" onClick={exportCSV}>Export CSV</button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Loading…</p>
        ) : !rows.length ? (
          <p className="text-sm text-gray-600">No waitlist entries.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#D0E8F0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#004581]">
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Company</th>
                  <th className="py-2 px-3">Notes</th>
                  <th className="py-2 px-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-[#D0E8F0]">
                    <td className="py-2 px-3">{r.email || "—"}</td>
                    <td className="py-2 px-3">{r.name || "—"}</td>
                    <td className="py-2 px-3">{r.company || "—"}</td>
                    <td className="py-2 px-3">{r.notes || "—"}</td>
                    <td className="py-2 px-3">
                      {r.createdAt?.toDate?.()?.toLocaleString?.() || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
