import React from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Globe2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BrandMark } from "../components/common/BrandMark";

export function Login() {
  const { loginAs, authenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/recommend";
  if (!loading && authenticated) return <Navigate to={from} replace />;
  const choose = (mode) => { loginAs(mode); navigate(from, { replace: true }); };
  return (
    <div className="min-h-screen bg-[#fffaf5] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between"><Link to="/"><BrandMark /></Link><Link to="/recommend" className="text-sm font-bold text-violet-700 hover:text-fuchsia-600">Continue without signing in</Link></div>
        <div className="mx-auto mt-14 max-w-3xl rounded-[2rem] border border-white bg-white p-8 shadow-2xl shadow-violet-950/10 sm:p-12">
          <div className="mx-auto max-w-xl text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-orange-100 text-violet-700"><ShieldCheck className="h-7 w-7" /></div><h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">Choose how you’ll use NormWise</h1><p className="mt-3 text-slate-600">There are two access paths. Select the one that matches your role.</p></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <button type="button" onClick={() => choose("officer")} className="group rounded-2xl border border-violet-200 bg-violet-50/60 p-6 text-left transition hover:-translate-y-1 hover:border-violet-400 hover:bg-violet-50 hover:shadow-xl hover:shadow-violet-200/40"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-600 text-white"><BriefcaseBusiness className="h-5 w-5" /></span><ArrowRight className="h-5 w-5 text-violet-400 transition group-hover:translate-x-1" /></div><h2 className="mt-6 text-xl font-black text-slate-950">Officer</h2><p className="mt-2 text-sm leading-6 text-slate-600">For procurement officers who create requirements and review standards.</p><span className="mt-5 flex items-center gap-2 text-xs font-bold text-violet-700"><CheckCircle2 className="h-4 w-4" /> Procurement workspace</span></button>
            <button type="button" onClick={() => choose("anyone")} className="group rounded-2xl border border-orange-200 bg-orange-50/70 p-6 text-left transition hover:-translate-y-1 hover:border-orange-400 hover:bg-orange-50 hover:shadow-xl hover:shadow-orange-200/40"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-fuchsia-500 text-white"><Globe2 className="h-5 w-5" /></span><ArrowRight className="h-5 w-5 text-orange-400 transition group-hover:translate-x-1" /></div><h2 className="mt-6 text-xl font-black text-slate-950">Anyone</h2><p className="mt-2 text-sm leading-6 text-slate-600">For visitors who want to explore standards recommendations without an officer role.</p><span className="mt-5 flex items-center gap-2 text-xs font-bold text-orange-700"><CheckCircle2 className="h-4 w-4" /> Public access</span></button>
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">These two access paths work without the optional legacy authentication service.</p>
        </div>
      </div>
    </div>
  );
}
export default Login;
