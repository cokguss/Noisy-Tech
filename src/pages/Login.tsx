import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout';
import { Lock, User, ArrowRight, AlertCircle, TrendingUp, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { logActivity } from '@/lib/activity';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotInfo, setShowForgotInfo] = useState(false);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'noisy' && password === 'noisy') {
      const user = { username: 'noisy', name: 'Noisy Tech Owner', role: 'admin' };
      localStorage.setItem('user', JSON.stringify(user));
      logActivity(user.username, user.name, 'activity_login');
      navigate('/dashboard');
      return;
    }

    const storedUser = localStorage.getItem('registeredUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.username === username && user.password === password) {
        const sessionUser = { username: user.username, name: user.name };
        localStorage.setItem('user', JSON.stringify(sessionUser));
        logActivity(sessionUser.username, sessionUser.name, 'activity_login');
        navigate('/dashboard');
        return;
      }
    }

    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.username === username) {
             setError(language === 'id' ? 'Kata sandi salah. Silakan coba lagi.' : 'Invalid password. Please try again.');
        } else {
             setError(language === 'id' ? 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.' : 'Account not found. Please register first.');
        }
    } else {
        setError(language === 'id' ? 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.' : 'Account not found. Please register first.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col"
    >
      <Layout className="flex items-center justify-center p-4 flex-1">
        {/* Language Switcher */}
        <div className="absolute top-6 right-6 z-50">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1">
          <button
            onClick={() => setLanguage('id')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              language === 'id' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            ID
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              language === 'en' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] relative"
      >
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-[32px] blur-xl opacity-50" />
        
        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 border border-emerald-500/20 mb-6">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-2">
              {t('login_title')}
            </h1>
            <p className="text-sm text-slate-400">{t('login_subtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, mb: 0 }}
                  animate={{ opacity: 1, height: 'auto', mb: 24 }}
                  exit={{ opacity: 0, height: 0, mb: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">{language === 'id' ? 'Nama Pengguna' : 'Username'}</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  type="text"
                  placeholder="noisy"
                  className="pl-11 h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('password_label')}</label>
                <button 
                  type="button"
                  onClick={() => setShowForgotInfo(!showForgotInfo)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {language === 'id' ? 'Lupa?' : 'Forgot?'}
                </button>
              </div>
              
              <AnimatePresence>
                {showForgotInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-[10px] leading-relaxed mb-2"
                  >
                    {language === 'id' 
                      ? 'Fitur reset kata sandi sedang dalam pemeliharaan. Silakan hubungi Admin (noisy) untuk bantuan.' 
                      : 'Password reset feature is under maintenance. Please contact Admin (noisy) for assistance.'}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl bg-white text-black hover:bg-slate-200 font-medium text-sm group transition-all" size="lg">
              {t('login_button')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            {t('no_account')}{' '}
            <Link to="/register" className="text-white hover:text-emerald-400 font-medium transition-colors">
              {t('register_link')}
            </Link>
          </div>
        </div>
      </motion.div>
      </Layout>
    </motion.div>
  );
}
