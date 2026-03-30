import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Package, Truck, ShieldCheck, Zap,
  ArrowRight, Menu, X, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Nav ────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const dashMap = {
    ROLE_ADMIN:  '/admin/dashboard',
    ROLE_DRIVER: '/driver/dashboard',
    ROLE_USER:   '/user/dashboard',
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-border
                    bg-surface/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <MapPin size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white font-display tracking-tight">
            SmartLogix
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features"  className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#how"       className="text-sm text-slate-400 hover:text-white transition-colors">How it works</a>
          <a href="#pricing"   className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link
                to={dashMap[user.role] ?? '/user/dashboard'}
                className="text-sm text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-1.5">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="text-sm text-slate-300 hover:text-white px-3 py-1.5 transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-surface-border bg-surface-card px-5 py-4 space-y-3 animate-fade-in">
          <a href="#features" onClick={() => setOpen(false)}
            className="block text-sm text-slate-400 hover:text-white py-1">Features</a>
          <a href="#how" onClick={() => setOpen(false)}
            className="block text-sm text-slate-400 hover:text-white py-1">How it works</a>
          {user ? (
            <>
              <Link to={dashMap[user.role] ?? '/user/dashboard'}
                className="block text-sm text-white py-1">Dashboard</Link>
              <button onClick={handleLogout} className="btn-secondary text-sm w-full justify-center">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="block text-sm text-slate-300 py-1">Login</Link>
              <Link to="/register" className="btn-primary text-sm w-full justify-center">
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

// ── Hero ───────────────────────────────────────────────────────────
function Hero() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const handleBooking = () => {
    if (user) {
      navigate('/user/create-booking');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-5 pt-14 overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[700px] h-[700px] bg-brand-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0
                        w-[400px] h-[400px] bg-sky-700/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10 animate-slide-up">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                        bg-brand-600/10 border border-brand-500/20 text-brand-300
                        text-xs font-semibold mb-6">
          <Zap size={11} />
          Smart Logistics Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white font-display leading-tight mb-6">
          Deliver Smarter,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-400">
            Track Faster
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          End-to-end logistics management for customers, drivers and admins.
          Book deliveries, track in real-time, and optimize routes — all in one place.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleBooking}
            className="btn-primary text-base px-6 py-3 shadow-lg shadow-brand-600/20"
          >
            <Package size={18} />
            {user ? 'Create Booking' : 'Book a Delivery'}
            <ArrowRight size={16} />
          </button>

          {!user && (
            <Link to="/register" className="btn-secondary text-base px-6 py-3">
              Create Free Account
            </Link>
          )}

          {user && (
            <Link
              to={
                user.role === 'ROLE_ADMIN'  ? '/admin/dashboard'  :
                user.role === 'ROLE_DRIVER' ? '/driver/dashboard' :
                '/user/dashboard'
              }
              className="btn-secondary text-base px-6 py-3"
            >
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {/* Login nudge for guests */}
        {!user && (
          <p className="text-xs text-slate-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
            {' '}to create a booking
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 mt-14 flex-wrap">
          {[
            { value: '10K+', label: 'Deliveries' },
            { value: '500+', label: 'Drivers' },
            { value: '99.2%', label: 'On-time Rate' },
            { value: '5 Zones', label: 'Coverage' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white font-display">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Package,
    title: 'Easy Booking',
    desc: 'Create deliveries in seconds with our smart booking form. Standard or Express — your choice.',
    accent: 'bg-brand-600/15 text-brand-400',
  },
  {
    icon: MapPin,
    title: 'Real-time Tracking',
    desc: 'Track your package at every step — from warehouse to your doorstep with live status updates.',
    accent: 'bg-sky-600/15 text-sky-400',
  },
  {
    icon: Truck,
    title: 'Smart Driver Matching',
    desc: 'Our batching engine assigns the nearest available driver to minimize delivery time.',
    accent: 'bg-purple-600/15 text-purple-400',
  },
  {
    icon: Zap,
    title: 'Express Delivery',
    desc: 'Need it fast? Express delivery gets your package there with priority routing.',
    accent: 'bg-amber-600/15 text-amber-400',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    desc: 'JWT-secured accounts, role-based access, and full audit logs for every order.',
    accent: 'bg-green-600/15 text-green-400',
  },
  {
    icon: CheckCircle,
    title: 'Multi-zone Coverage',
    desc: 'Delivering across North, South, East, West and Central zones with warehouse support.',
    accent: 'bg-teal-600/15 text-teal-400',
  },
];

function Features() {
  return (
    <section id="features" className="py-24 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display">
            Everything you need to ship
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Built for customers who ship, drivers who deliver, and admins who manage it all.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card hover:border-surface-border/80 transition-all duration-200 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.accent}`}>
                <f.icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ───────────────────────────────────────────────────
const STEPS = [
  { step: '01', title: 'Create Account',   desc: 'Register as a Customer, Driver or Admin in seconds.' },
  { step: '02', title: 'Book a Delivery',  desc: 'Fill in pickup, drop, package details and get an instant price estimate.' },
  { step: '03', title: 'Driver Picks Up',  desc: 'Nearest available driver accepts and picks up your package.' },
  { step: '04', title: 'Track & Receive',  desc: 'Follow real-time status updates until delivery is confirmed.' },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24 px-5 border-t border-surface-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display">
            Ship in 4 simple steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-surface-border" />

          {STEPS.map((s) => (
            <div key={s.step} className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-surface-card border border-surface-border
                              flex items-center justify-center mx-auto mb-4 relative z-10">
                <span className="text-xl font-bold text-brand-400 font-display">{s.step}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" className="py-24 px-5 border-t border-surface-border">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display">
            Simple, transparent pricing
          </h2>
          <p className="text-slate-400 mt-3">No hidden fees. Pay only for what you ship.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Standard */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-700/40 flex items-center justify-center text-xl">
                📦
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Standard</h3>
                <p className="text-xs text-slate-500">Economy delivery</p>
              </div>
            </div>
            <div className="mb-5">
              <span className="text-3xl font-bold text-white">₹49</span>
              <span className="text-slate-500 text-sm ml-1">base + ₹12/kg</span>
            </div>
            <ul className="space-y-2 mb-6">
              {['Regular speed delivery', 'Real-time tracking', 'Zone-based pricing', 'GST inclusive'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle size={13} className="text-green-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-secondary w-full justify-center text-sm">
              Get Started
            </Link>
          </div>

          {/* Express */}
          <div className="card border-brand-500/30 bg-brand-900/10 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="badge border text-[10px] font-bold
                               text-amber-400 bg-amber-400/10 border-amber-400/30">
                ⚡ Popular
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl">
                ⚡
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Express</h3>
                <p className="text-xs text-slate-500">Priority delivery</p>
              </div>
            </div>
            <div className="mb-5">
              <span className="text-3xl font-bold text-white">₹99</span>
              <span className="text-slate-500 text-sm ml-1">base + ₹20/kg</span>
            </div>
            <ul className="space-y-2 mb-6">
              {['Faster priority delivery', 'Real-time tracking', 'Zone-based pricing', 'GST inclusive'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle size={13} className="text-brand-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-primary w-full justify-center text-sm">
              Get Started
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          Zone multipliers apply · Same zone 1× · Adjacent 1.4× · Cross zone 1.9×
        </p>
      </div>
    </section>
  );
}

// ── CTA Banner ─────────────────────────────────────────────────────
function CTABanner() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  return (
    <section className="py-24 px-5 border-t border-surface-border">
      <div className="max-w-3xl mx-auto text-center">
        <div className="card border-brand-500/20 bg-gradient-to-br from-brand-900/20 to-surface-card py-12">
          <h2 className="text-3xl font-bold text-white font-display mb-3">
            Ready to ship?
          </h2>
          <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
            Join thousands of customers already using SmartLogix for their deliveries.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(user ? '/user/create-booking' : '/login')}
              className="btn-primary text-base px-6 py-3 shadow-lg shadow-brand-600/20"
            >
              <Package size={17} />
              {user ? 'Create Booking' : 'Start Shipping'}
              <ArrowRight size={16} />
            </button>
            {!user && (
              <Link to="/register" className="btn-secondary text-base px-6 py-3">
                Create Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-surface-border px-5 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
            <MapPin size={12} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white font-display">SmartLogix</span>
        </div>
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} SmartLogix. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/login"    className="text-xs text-slate-500 hover:text-slate-300">Login</Link>
          <Link to="/register" className="text-xs text-slate-500 hover:text-slate-300">Register</Link>
        </div>
      </div>
    </footer>
  );
}

// ── Main Export ────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  );
}