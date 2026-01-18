import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

/* ---------- Small logo ---------- */
function Logo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#004581] to-[#019ABD]" />
      <span className="text-xl font-extrabold tracking-tight text-[#004581]">
        Kova<span className="text-[#019ABD]">Flo</span>
      </span>
    </div>
  );
}

/* ---------- Top nav ---------- */
function Navbar({ onLogin }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#D0E8F0]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
        <Logo />
        <div className="hidden md:flex items-center gap-4 text-sm font-semibold text-[#004581]">
          <a href="#features" className="inline-flex items-center h-10 px-2 hover:text-[#019ABD]">Features</a>
          <a href="#about" className="inline-flex items-center h-10 px-2 hover:text-[#019ABD]">About</a>
          <a href="#waitlist" className="inline-flex items-center h-10 px-2 hover:text-[#019ABD]">Join Beta</a>
          <Button onClick={onLogin} className="h-10 px-4 bg-[#004581] text-white hover:bg-[#019ABD] font-semibold shadow-sm">
            Login
          </Button>
        </div>
        <div className="md:hidden flex items-center gap-3">
          <a href="#waitlist" className="inline-flex items-center h-10 px-2 text-sm font-semibold text-[#004581]">Join</a>
          <Button onClick={onLogin} className="h-10 px-4 text-sm bg-[#004581] text-white hover:bg-[#019ABD]">Login</Button>
        </div>
      </nav>
    </header>
  );
}

/* ---------- Waitlist card (inline to avoid import issues) ---------- */
function SignupForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!email) {
      setMsg("Please enter an email address.");
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, "waitlist"), {
        email: email.trim(),
        company: company.trim() || null,
        notes: notes.trim() || null,
        pid: "sjb",
        createdAt: serverTimestamp(),
      });
      setMsg("Thanks! You’re on the list.");
      setEmail(""); setCompany(""); setNotes("");
    } catch (err) {
      console.error("Waitlist submit failed:", err);
      setMsg("Could not submit right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="shadow-md border border-[#D0E8F0] bg-white rounded-2xl max-w-xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-3 text-left">
          <label className="text-sm font-semibold text-[#004581]">Work Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="px-3 py-2 rounded-md border border-[#D0E8F0] focus:outline-none focus:ring-2 focus:ring-[#019ABD]"
          />
          <label className="text-sm font-semibold text-[#004581] mt-2">Company (optional)</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            className="px-3 py-2 rounded-md border border-[#D0E8F0] focus:outline-none focus:ring-2 focus:ring-[#019ABD]"
          />
          <label className="text-sm font-semibold text-[#004581] mt-2">Notes (optional)</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What problem should we solve first?"
            className="px-3 py-2 rounded-md border border-[#D0E8F0] focus:outline-none focus:ring-2 focus:ring-[#019ABD]"
          />
          <div className="pt-2">
            <Button type="submit" disabled={busy} className="bg-[#004581] text-white hover:bg-[#019ABD] font-semibold">
              {busy ? "Submitting…" : "Join the Beta"}
            </Button>
          </div>
          {msg && (
            <p className={`text-sm mt-2 ${msg.startsWith("Thanks") ? "text-green-700" : "text-red-700"}`}>
              {msg}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

/* ---------- Login modal with Project ID ---------- */
function LoginModal({ open, onClose }) {
  const [projId, setProjId] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (!open) return null;

  async function onLogin(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const id = (projId || "").toLowerCase().trim();
      if (!id) {
        setStatus('Please enter a project ID (e.g., "sjb").');
        setBusy(false);
        return;
      }
      const pSnap = await getDoc(doc(db, "projects", id));
      if (!pSnap.exists()) {
        setStatus("Unknown project ID. Check your code (e.g., 'sjb').");
        setBusy(false);
        return;
      }
      await signInWithEmailAndPassword(auth, email, pw);
      onClose();
      navigate(`/p/${id}/choose`);
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-[#D0E8F0]">
        <div className="px-6 py-4 border-b border-[#D0E8F0] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#004581]">Login</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="p-6">
          <form className="grid gap-3" onSubmit={onLogin}>
            <input
              className="px-3 py-2 rounded-md border border-[#D0E8F0] focus:outline-none focus:ring-2 focus:ring-[#019ABD]"
              placeholder='Project ID (e.g., "sjb")'
              value={projId}
              onChange={(e) => setProjId(e.target.value)}
            />
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
            <Button disabled={busy} className="bg-[#004581] text-white hover:bg-[#019ABD]">
              {busy ? "Signing in..." : "Sign in"}
            </Button>
            {status && <p className="text-sm text-red-700">{status}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function KovaFloHomepage() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#D0E8F0] text-gray-900">
      <Navbar onLogin={() => setLoginOpen(true)} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#004581] to-[#019ABD] text-white">
        <div className="mx-auto max-w-6xl px-6 py-28 text-center">
          <motion.h1
            className="text-5xl font-extrabold mb-4 tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Strong Data. Seamless Flow.
          </motion.h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Automate daily reports and weekly summaries for pipeline, construction, and utility teams.
          </p>
          <a href="#waitlist">
            <Button className="bg-white text-[#004581] hover:bg-[#70C8DC] transition-all font-semibold">
              Request a Demo
            </Button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold text-[#004581] mb-12">Why KovaFlo</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Automated Daily Reports", desc: "Generate and store inspection reports instantly from the field." },
              { title: "Weekly Summaries in Seconds", desc: "Compile a full week of data into clean, professional summaries automatically." },
              { title: "Cloud-Based Access", desc: "Access your data securely from any device, anywhere, anytime." },
            ].map((feature) => (
              <Card key={feature.title} className="shadow-md border border-[#D0E8F0] hover:shadow-lg transition-all bg-white rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-[#019ABD] mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 bg-[#004581] text-white">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6">About KovaFlo</h2>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed">
            Born from real-world field experience, KovaFlo bridges the gap between inspection teams and data reporting.
            With automation, accuracy, and flexibility at its core, KovaFlo transforms how teams manage, share, and analyze field data.
          </p>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-20 px-6 bg-[#70C8DC] text-[#004581]">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Streamline Your Field Reports?</h2>
        </div>
        <div className="max-w-xl mx-auto">
          <SignupForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#004581] text-white text-center py-6 text-sm">
        © {new Date().getFullYear()} KovaFlo. All rights reserved.
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
