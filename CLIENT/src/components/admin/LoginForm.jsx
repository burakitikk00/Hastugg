import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import ForgotPasswordForm from './ForgotPasswordForm';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err) {
      setError(err.message || 'Giriş sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090e] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
        <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-[#0b101b] border border-slate-800 rounded-3xl p-8 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Logo & Başlık */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-[#07090e] font-black text-2xl mx-auto shadow-[0_0_25px_rgba(229,169,60,0.35)] mb-4">
            H
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="font-bold text-white tracking-wider text-lg font-sans">HASTUĞ</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
          <p className="text-[11px] uppercase font-mono tracking-widest text-slate-400 font-semibold">
            YÖNETİM KONTROL PANELİ
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Lütfen yetkili yönetici kimlik bilgilerinizle giriş yapın.
          </p>
        </div>

        {/* Hata Bildirimi */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={handleChange}
                placeholder="Yönetici kullanıcı adı"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm transition-all"
              />
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
              Parola
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm transition-all font-mono"
              />
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(229,169,60,0.2)] hover:shadow-[0_0_25px_rgba(229,169,60,0.35)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
            >
              Şifrenizi mi unuttunuz?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
