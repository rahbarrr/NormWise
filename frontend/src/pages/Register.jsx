import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { BrandMark } from "../components/common/BrandMark";
import { registerApi } from "../services/api";

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function submit(event) {
    event.preventDefault(); setError(""); setSaving(true);
    try { await registerApi(form); navigate("/login", { state: { registered: true } }); }
    catch (err) { setError(err.message || "We could not create this account."); }
    finally { setSaving(false); }
  }
  return <div className="min-h-screen bg-[#fffaf5] px-5 py-10 sm:px-8"><div className="mx-auto max-w-5xl"><div className="flex items-center justify-between"><Link to="/"><BrandMark /></Link><Link to="/login" className="text-sm font-bold text-violet-700">Already registered? Sign in</Link></div><div className="mx-auto mt-12 grid max-w-4xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-violet-950/10 lg:grid-cols-[.9fr_1.1fr]"><div className="bg-gradient-to-br from-slate-950 via-violet-950 to-fuchsia-900 p-8 text-white sm:p-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-orange-300">Build your review desk</p><h1 className="mt-8 text-4xl font-black leading-tight">Make every standard decision easier to defend.</h1><p className="mt-5 leading-7 text-white/70">Create a NormWise workspace for procurement officers and technical reviewers.</p></div><form onSubmit={submit} className="p-8 sm:p-12"><h2 className="text-2xl font-black">Create your account</h2><p className="mt-2 text-sm text-slate-500">Use your work identity to get started.</p>{error && <div className="mt-5 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}<div className="mt-7 space-y-4">{[["name","Full name",UserRound,"Your name"],["email","Work email",Mail,"you@organisation.gov.in"],["password","Password",LockKeyhole,"At least 8 characters"]].map(([key,label,Icon,placeholder])=><label key={key} className="block text-sm font-bold text-slate-700">{label}<span className="relative mt-2 block"><Icon className="absolute left-3 top-3 h-4 w-4 text-violet-500" /><input required type={key === "password" ? "password" : key} value={form[key]} onChange={update(key)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" /></span></label>)}</div><button disabled={saving} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-bold text-white hover:bg-violet-700 disabled:opacity-60">{saving ? "Creating account…" : "Create account"}<ArrowRight className="h-4 w-4" /></button></form></div></div></div>;
}
