import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api';
import { Cross, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data.data!;
      setAuth(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[420px] shrink-0 p-10" style={{ background: 'linear-gradient(160deg,#006B58 0%,#00A68A 100%)' }}>
        {/* Logo only — no tagline */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Cross className="w-4 h-4 text-white" />
          </div>
          <p className="font-sans font-semibold text-sm text-white">Himalaya Hospital</p>
        </div>

        {/* Bottom — hospital name large, no "Clinical Sanctuary" */}
        <div className="mt-auto">
          <h1 className="font-sans text-4xl font-semibold text-white leading-tight">
            Himalaya<br />Hospital
          </h1>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Hospital Management System — managing patients, admissions, billing and pharmacy operations.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { label: 'Patients', sub: 'Registered' },
              { label: 'Doctors', sub: 'Active' },
              { label: 'Departments', sub: 'Operational' },
              { label: 'Beds', sub: 'Available' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-white/60">{item.sub}</p>
                <p className="text-sm font-semibold text-white mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#006B58,#00A68A)' }}>
              <Cross className="w-4 h-4 text-white" />
            </div>
            <span className="font-sans font-semibold text-sm text-[#1A2332]">Himalaya Hospital</span>
          </div>

          <h2 className="font-sans text-2xl font-semibold text-[#1A2332] mb-1">Welcome back</h2>
          <p className="text-sm text-[#4A5568] mb-7">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#4A5568]">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@himalaya.np"
                required
                autoFocus
              />
            </div>

            {/* Password with toggle */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#4A5568]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#1A2332] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-[#FFDAD6] rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-[#BA1A1A] shrink-0" />
                <p className="text-xs text-[#410002]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-[#4A5568]">
            Himalaya Hospital Management System · Secure Access
          </p>
        </div>
      </div>
    </div>
  );
}