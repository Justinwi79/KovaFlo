import { Link } from "react-router-dom";

export default function AdminDashboard() {
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
          <div className="flex gap-2">
            <Link to="/" className="px-3 py-2 rounded-xl text-[#004581] hover:bg-[#E6F0F4]">Home</Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-[#004581] mb-6">Admin</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/admin/waitlist" className="block rounded-2xl border border-[#D0E8F0] bg-white p-6 hover:shadow">
            <h2 className="text-lg font-semibold text-[#004581]">Waitlist</h2>
            <p className="text-sm text-gray-600">View beta signups and export a CSV.</p>
          </Link>

          <Link to="/admin/reports" className="block rounded-2xl border border-[#D0E8F0] bg-white p-6 hover:shadow">
            <h2 className="text-lg font-semibold text-[#004581]">Reports</h2>
            <p className="text-sm text-gray-600">List submitted daily reports, re-export PDFs, export CSV.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
