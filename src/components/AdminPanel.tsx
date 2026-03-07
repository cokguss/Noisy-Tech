import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Trash2, UserPlus, Activity, Search, Megaphone, Send, X, Clock, History, Circle, Ban, CheckCircle, UserCog } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { logActivity, ActivityLog, getStatus } from '@/lib/activity';

interface UserData {
  username: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
}

interface UserOverride {
  role?: 'admin' | 'user';
  status?: 'active' | 'suspended';
}

export function AdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [isBroadcastSent, setIsBroadcastSent] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const loadData = () => {
      // Load users
      const registeredUser = localStorage.getItem('registeredUser');
      const overrides: Record<string, UserOverride> = JSON.parse(localStorage.getItem('user_overrides') || '{}');
      
      const mockUsers: UserData[] = [
        { username: 'noisy', name: 'Noisy Tech Owner', role: 'admin', status: 'active' },
        { username: 'demo_user', name: 'Demo User', role: 'user', status: 'active' }
      ];

      if (registeredUser) {
        const parsed = JSON.parse(registeredUser);
        if (parsed.username !== 'noisy') {
          mockUsers.push({ 
            username: parsed.username, 
            name: parsed.name, 
            role: 'user',
            status: 'active'
          });
        }
      }

      // Apply overrides
      const finalUsers = mockUsers.map(u => ({
        ...u,
        ...overrides[u.username]
      }));

      setUsers(finalUsers);

      // Load activities
      const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
      setActivities(logs);
    };

    loadData();
    
    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleUpdateUser = (username: string, updates: Partial<UserData>) => {
    if (username === 'noisy') return;

    const overrides: Record<string, UserOverride> = JSON.parse(localStorage.getItem('user_overrides') || '{}');
    
    overrides[username] = {
      ...overrides[username],
      ...updates
    };

    localStorage.setItem('user_overrides', JSON.stringify(overrides));
    
    // Log activity
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const action = updates.role ? (updates.role === 'admin' ? 'activity_promote' : 'activity_demote') : (updates.status === 'suspended' ? 'activity_suspend' : 'activity_activate');
    logActivity(currentUser.username || 'admin', currentUser.name || 'Admin', action as any, username);

    // Refresh data
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteUser = (username: string) => {
    if (username === 'noisy') return;
    
    // Update local state
    const updatedUsers = users.filter(u => u.username !== username);
    setUsers(updatedUsers);
    
    // Update localStorage
    const registeredUser = localStorage.getItem('registeredUser');
    if (registeredUser) {
      const parsed = JSON.parse(registeredUser);
      if (parsed.username === username) {
        localStorage.removeItem('registeredUser');
      }
    }
    
    localStorage.removeItem(`portfolio_${username}`);
    localStorage.removeItem(`favorites_${username}`);
    setConfirmDelete(null);
  };

  const handleSendBroadcast = () => {
    if (!broadcastText.trim()) return;
    localStorage.setItem('broadcast_message', broadcastText);
    setIsBroadcastSent(true);
    setTimeout(() => setIsBroadcastSent(false), 3000);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    logActivity(user.username || 'admin', user.name || 'Admin', 'activity_broadcast');
    
    // Trigger a storage event for other tabs
    window.dispatchEvent(new Event('storage'));
  };

  const handleClearBroadcast = () => {
    localStorage.removeItem('broadcast_message');
    setBroadcastText('');
    window.dispatchEvent(new Event('storage'));
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{t('total_users')}</p>
            <h4 className="text-3xl font-mono font-bold text-white">{users.length}</h4>
          </div>
        </Card>
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-24 h-24 text-cyan-400" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{t('active_sessions')}</p>
            <h4 className="text-3xl font-mono font-bold text-white">1</h4>
          </div>
        </Card>
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-24 h-24 text-purple-400" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{t('role')}</p>
            <h4 className="text-xl font-display font-bold text-emerald-400">{t('admin_role')}</h4>
          </div>
        </Card>
      </div>

      {/* Broadcast Message Section */}
      <Card className="p-6 border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
        <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Megaphone className="w-32 h-32 text-emerald-400 transform -rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-emerald-400" />
              {t('broadcast_message')}
            </h3>
            <AnimatePresence>
              {isBroadcastSent && (
                <motion.span 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-xs font-bold text-emerald-400 flex items-center gap-1"
                >
                  <Activity className="h-3 w-3 animate-pulse" />
                  {t('broadcast_sent')}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input 
                placeholder={t('broadcast_placeholder')}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-12 pr-12"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
              />
              {broadcastText && (
                <button 
                  onClick={handleClearBroadcast}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSendBroadcast}
              disabled={!broadcastText.trim()}
              className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {t('send_broadcast')}
            </Button>
          </div>
        </div>
      </Card>

      {/* User List */}
      <Card className="border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            {t('user_management')}
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder={t('search_placeholder')}
              className="pl-9 h-9 bg-white/5 border-white/10 rounded-lg text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">{t('full_name')}</th>
                <th className="p-4">{t('username')}</th>
                <th className="p-4">{t('status')}</th>
                <th className="p-4">{t('role')}</th>
                <th className="p-4">{t('account')}</th>
                <th className="p-4 text-center">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => {
                const status = getStatus(user.username);
                return (
                  <motion.tr 
                    layout
                    key={user.username} 
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-medium text-white">{user.name}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-400 text-xs">@{user.username}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Circle className={`h-2 w-2 fill-current ${status === 'online' ? 'text-emerald-500 animate-pulse' : 'text-slate-600'}`} />
                        <span className={`text-xs ${status === 'online' ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                          {status === 'online' ? t('online') : t('offline')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-white/5'
                      }`}>
                        {user.role === 'admin' ? t('admin_role') : t('user_role')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        user.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {user.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                        {user.status === 'active' ? t('status_active') : t('status_suspended')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {user.username !== 'noisy' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-slate-500 hover:text-white hover:bg-white/10"
                              title={user.role === 'admin' ? t('demote_user') : t('promote_admin')}
                              onClick={() => handleUpdateUser(user.username, { role: user.role === 'admin' ? 'user' : 'admin' })}
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 rounded-lg ${user.status === 'active' ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10' : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'}`}
                              title={user.status === 'active' ? t('suspend_user') : t('activate_user')}
                              onClick={() => handleUpdateUser(user.username, { status: user.status === 'active' ? 'suspended' : 'active' })}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {confirmDelete === user.username ? (
                          <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-7 px-2 text-[10px] font-bold uppercase"
                              onClick={() => handleDeleteUser(user.username)}
                            >
                              Ya
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 px-2 text-[10px] font-bold uppercase text-slate-400"
                              onClick={() => setConfirmDelete(null)}
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 transition-all"
                            disabled={user.username === 'noisy'}
                            onClick={() => setConfirmDelete(user.username)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Activity Log Section */}
      <Card className="border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-cyan-400" />
            {t('recent_activity')}
          </h3>
          <Clock className="h-4 w-4 text-slate-500" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">{t('time')}</th>
                <th className="p-4">{t('user')}</th>
                <th className="p-4">{t('event')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activities.length > 0 ? (
                activities.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 text-slate-500 font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{log.name}</span>
                        <span className="text-slate-500 text-[10px] font-mono">@{log.username}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">
                          {t(log.event).replace('{coin}', log.details || '')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500 italic">
                    {t('no_activity')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
