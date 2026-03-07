import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout';
import { User, Lock, ArrowRight, TrendingUp, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { logActivity } from '@/lib/activity';

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(t('passwords_not_match') || "Passwords don't match!");
      return;
    }
    if (name && username && password) {
      // Store user credentials for mock login
      // In a real app, never store passwords in local storage!
      const userData = { name, username, password }; 
      localStorage.setItem('registeredUser', JSON.stringify(userData));
      
      // Auto login
      localStorage.setItem('user', JSON.stringify({ username, name }));
      logActivity(username, name, 'activity_login');
      navigate('/dashboard');
    }
  };

  return (
    <Layout className="flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-300 hover:text-white"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">{language}</span>
        </button>
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
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 border border-emerald-500/20 mb-6">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-2">
              {t('register_title')}
            </h1>
            <p className="text-sm text-slate-400">{t('register_subtitle')}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">{t('full_name_label')}</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="pl-11 h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">{t('username_label')}</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  type="text"
                  placeholder="johndoe"
                  className="pl-11 h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">{t('password_label')}</label>
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

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">{t('confirm_password_label')}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 mt-6 rounded-xl bg-white text-black hover:bg-slate-200 font-medium text-sm group transition-all" size="lg">
              {t('create_account_button')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            {t('already_have_account')}{' '}
            <Link to="/login" className="text-white hover:text-emerald-400 font-medium transition-colors">
              {t('sign_in_link')}
            </Link>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
