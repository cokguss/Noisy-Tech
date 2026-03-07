import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface WelcomeToastProps {
  userName: string;
  isAdmin: boolean;
}

export function WelcomeToast({ userName, isAdmin }: WelcomeToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if we've already shown the toast in this session
    const hasShownToast = sessionStorage.getItem('hasShownWelcomeToast');
    
    if (!hasShownToast) {
      // Show after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('hasShownWelcomeToast', 'true');
      }, 1000);
      
      // Hide after 5 seconds
      const hideTimer = setTimeout(() => setIsVisible(false), 6000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  const message = isAdmin 
    ? t('welcome_owner') 
    : t('welcome_user').replace('{name}', userName);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[400px]"
        >
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            
            <div className="relative flex items-center gap-4 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white leading-tight">
                  {message}
                </p>
              </div>

              <button 
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
