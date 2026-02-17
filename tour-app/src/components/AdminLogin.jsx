import { useState } from 'react';
import { useTour } from '../context/TourContext';

export default function AdminLogin() {
  const { showLoginModal, setShowLoginModal, loginAdmin } = useTour();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showLoginModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = loginAdmin(username, password);
      if (!success) {
        setError('Credenciales incorrectas');
      }
      setLoading(false);
    }, 600);
  };

  const handleClose = () => {
    setShowLoginModal(false);
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm mx-4 overflow-hidden"
        style={{
          background: 'rgba(15,15,15,0.97)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
        }}
      >
        {/* Thin top accent line */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="p-10">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={(e) => (e.target.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.25)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
          </div>

          <h2 className="text-white/90 text-lg font-light text-center mb-1 tracking-wide">
            Administrador
          </h2>
          <p className="text-white/30 text-xs text-center mb-8 tracking-wide font-light">
            Introduce tus credenciales para acceder
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/35 text-[10px] tracking-[0.15em] uppercase block mb-2 ml-1 font-light">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="admin"
                autoFocus
                className="w-full rounded-lg px-4 py-3 text-white/90 text-sm font-light focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            <div>
              <label className="text-white/35 text-[10px] tracking-[0.15em] uppercase block mb-2 ml-1 font-light">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-3 text-white/90 text-sm font-light focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 text-sm rounded-lg px-3 py-2.5"
                style={{
                  color: 'rgba(220,160,160,0.9)',
                  background: 'rgba(180,80,80,0.08)',
                  border: '1px solid rgba(180,80,80,0.15)',
                  fontSize: '13px',
                  fontWeight: 300,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 rounded-lg text-sm font-light tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-1"
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#0a0a0a',
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) e.target.style.background = 'rgba(255,255,255,1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.9)';
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="text-white/15 text-[10px] text-center mt-8 tracking-wider font-light">
            Demo: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
