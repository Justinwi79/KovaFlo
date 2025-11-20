import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { generateSjbPdf } from "../../utils/pdf/sjbPdf";
import AdminNav from "./AdminNav.jsx"; // add this import

// in the header <nav> right side:
<AdminNav />


const LS_KEY = "sjb-reports"; // array of { id, createdAt, meta, data }

export default function AdminReports() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setRows(list);
    } catch {
      setRows([]);
    }
  }, []);

  function exportCSV() {
    const header = ["id","createdAt","project","date","inspector","operatorContractor","location"];
    const lines = [header.join(",")];
    rows.forEach(r => {
      const m = r.meta || {};
      const vals = [
        r.id,
        r.createdAt || "",
        m.projectName || "",
        m.date || "",
        m.inspector || "",
        m.client || "",
        m.location || "",
      ];
      lines.push(vals.map(v => (v && /[\",\n]/.test(v) ? `"${String(v).replaceAll('"','""')}"` : (v ?? ""))).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reExportPDF(row) {
    if (!row?.data) return;
    generateSjbPdf(row.data);
  }

  function deleteRow(id) {
    const next = rows.filter(r => r.id !== id);
    setRows(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
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
          <h1 className="text-2xl font-bold text-[#004581]">Reports</h1>
          <button className="btn" onClick={exportCSV}>Export CSV</button>
        </div>

        {!rows.length ? (
          <p className="text-sm text-gray-600">
            No saved reports yet. Submit from the SJB form to add one.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#D0E8F0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#004581]">
                  <th className="py-2 px-3">Project</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Inspector</th>
                  <th className="py-2 px-3">Operator / Contractor</th>
                  <th className="py-2 px-3">Created</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-[#D0E8F0]">
                    <td className="py-2 px-3">{r.meta?.projectName || "—"}</td>
                    <td className="py-2 px-3">{r.meta?.date || "—"}</td>
                    <td className="py-2 px-3">{r.meta?.inspector || "—"}</td>
                    <td className="py-2 px-3">{r.meta?.client || "—"}</td>
                    <td className="py-2 px-3">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button className="btn-secondary" onClick={() => reExportPDF(r)}>Re-export PDF</button>
                        <button className="btn-secondary" onClick={() => deleteRow(r.id)}>Delete</button>
                      </div>
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
