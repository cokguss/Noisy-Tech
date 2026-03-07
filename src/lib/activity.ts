export interface ActivityLog {
  id: string;
  username: string;
  name: string;
  event: string;
  details?: string;
  timestamp: number;
}

export const logActivity = (username: string, name: string, event: string, details?: string) => {
  const logs: ActivityLog[] = JSON.parse(localStorage.getItem('activity_logs') || '[]');
  
  const newLog: ActivityLog = {
    id: Math.random().toString(36).substring(2, 9),
    username,
    name,
    event,
    details,
    timestamp: Date.now(),
  };
  
  // Keep only last 50 logs
  const updatedLogs = [newLog, ...logs].slice(0, 50);
  localStorage.setItem('activity_logs', JSON.stringify(updatedLogs));
  
  // Also update user's last active timestamp
  localStorage.setItem(`last_active_${username}`, Date.now().toString());
  
  // Trigger storage event for real-time updates in Admin Panel
  window.dispatchEvent(new Event('storage'));
};

export const getStatus = (username: string): 'online' | 'offline' => {
  const lastActive = localStorage.getItem(`last_active_${username}`);
  if (!lastActive) return 'offline';
  
  const lastActiveTime = parseInt(lastActive);
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  
  return lastActiveTime > fiveMinutesAgo ? 'online' : 'offline';
};
