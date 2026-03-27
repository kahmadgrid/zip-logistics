import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";

export function LandingPage() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-white p-8 shadow-soft">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-pulse rounded-full bg-brand-200/50" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 animate-pulse rounded-full bg-brand-300/30" />

      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-700">Smart Logistics System</p>
          <h1 className="mb-4 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
            Move Faster.
            <br />
            Deliver Smarter.
          </h1>
          <p className="mb-8 text-slate-600">
            AI-powered route optimization for EXPRESS and STANDARD deliveries with warehouse intelligence, batching, and
            live tracking.
          </p>
          <div className="flex gap-3">
            <Link to="/login">
              <Button>Get Started</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Create Account</Button>
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6">
          <div className="space-y-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-brand-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-brand-200" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-brand-200" />
          </div>
          <div className="mt-8 grid gap-3">
            <div className="rounded-xl border border-brand-100 bg-white p-3">
              <p className="text-xs text-slate-500">Route Engine</p>
              <p className="font-bold text-slate-800">Distance + Weather + Traffic</p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-white p-3">
              <p className="text-xs text-slate-500">Warehouse Intelligence</p>
              <p className="font-bold text-slate-800">Zone Batching + Capacity Balance</p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-white p-3">
              <p className="text-xs text-slate-500">Tracking</p>
              <p className="font-bold text-slate-800">Live Driver Location Timeline</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

