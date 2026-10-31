import { useState } from 'react';
import { FiMail, FiArrowLeft, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import adminService from '../../services/adminService';

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminService.forgotPassword(email);
      setIsEmailSent(true);
      setMessage({
        type: 'success',
        text: response.message || 'Şifre sıfırlama e-postası başarıyla gönderildi!'
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage({
          type: 'error',
          text: 'Bu e-posta adresi sistemde kayıtlı değil. Lütfen doğru e-posta adresini girin.'
        });
      } else {
        setMessage({
          type: 'error',
          text: error.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="relative z-10 max-w-md w-full bg-[#0b101b] border border-slate-800 rounded-3xl p-8 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          <FiCheck size={24} />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">E-Posta İletildi!</h2>
        
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-left">
          <p className="text-emerald-200 text-xs leading-relaxed">
            Şifre sıfırlama talimatı <strong className="text-white">{email}</strong> adresine iletildi. 
            Lütfen gelen kutunuzu ve spam klasörünüzü kontrol ediniz.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onBackToLogin}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <FiArrowLeft size={14} />
            <span>Giriş Sayfasına Dön</span>
          </button>
          
          <button
            onClick={() => {
              setIsEmailSent(false);
              setEmail('');
              setMessage({ type: '', text: '' });
            }}
            className="w-full px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Farklı bir e-posta ile dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-md w-full bg-[#0b101b] border border-slate-800 rounded-3xl p-8 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(229,169,60,0.2)]">
          <FiMail size={24} />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Şifremi Unuttum</h2>
        <p className="text-xs text-slate-400 mt-1">
          Kayıtlı yönetici e-posta adresinizi giriniz.
        </p>
      </div>

      {message.text && (
        <div
          className={`mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}
        >
          {message.type === 'success' ? (
            <FiCheck className="shrink-0 text-emerald-400" size={16} />
          ) : (
            <FiAlertTriangle className="shrink-0 text-rose-400" size={16} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
            E-Posta Adresi
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm transition-all"
              placeholder="ornek@hastugg.com"
              required
            />
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
            Bilgilendirme:
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            E-posta adresiniz sistemle eşleşirse sıfırlama şifresi oluşturulup posta kutunuza iletilecektir.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(229,169,60,0.2)] hover:shadow-[0_0_25px_rgba(229,169,60,0.35)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                <span>İletiliyor...</span>
              </>
            ) : (
              'Sıfırlama Bağlantısı Gönder'
            )}
          </button>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <FiArrowLeft size={13} />
            <span>Giriş ekranına dön</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
