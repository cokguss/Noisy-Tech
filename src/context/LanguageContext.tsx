import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'id' | 'en';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // Login Page
  login_title: { id: 'Selamat Datang Kembali', en: 'Welcome Back' },
  login_subtitle: { id: 'Masuk ke akun Anda untuk mengelola portofolio kripto Anda', en: 'Log in to your account to manage your crypto portfolio' },
  email_label: { id: 'Alamat Email', en: 'Email Address' },
  password_label: { id: 'Kata Sandi', en: 'Password' },
  login_button: { id: 'Masuk', en: 'Sign In' },
  no_account: { id: 'Belum punya akun?', en: "Don't have an account?" },
  register_link: { id: 'Daftar sekarang', en: 'Register now' },
  
  // Dashboard Header
  search_placeholder: { id: 'Cari koin...', en: 'Search coins...' },
  logout: { id: 'Keluar', en: 'Logout' },
  
  // Dashboard Stats
  total_balance: { id: 'Total Saldo', en: 'Total Balance' },
  active_assets: { id: 'Aset Aktif', en: 'Active Assets' },
  dominance: { id: 'Dominasi BTC', en: 'BTC Dominance' },
  
  // Welcome Message
  welcome_owner: { id: 'Halo Noisy, Selamat Datang Di Website Kami', en: 'Hello Noisy, Welcome To Our Website' },
  welcome_user: { id: 'Halo {name}, Senang Melihat Anda Kembali!', en: 'Hello {name}, Glad To See You Back!' },
  
  // Admin Panel
  admin_panel: { id: 'Panel Admin', en: 'Admin Panel' },
  user_management: { id: 'Manajemen Pengguna', en: 'User Management' },
  platform_stats: { id: 'Statistik Platform', en: 'Platform Stats' },
  total_users: { id: 'Total Pengguna', en: 'Total Users' },
  active_sessions: { id: 'Sesi Aktif', en: 'Active Sessions' },
  registered_users_list: { id: 'Daftar Pengguna Terdaftar', en: 'Registered Users List' },
  username: { id: 'Nama Pengguna', en: 'Username' },
  full_name: { id: 'Nama Lengkap', en: 'Full Name' },
  role: { id: 'Peran', en: 'Role' },
  admin_role: { id: 'Administrator', en: 'Administrator' },
  user_role: { id: 'Pengguna', en: 'User' },
  delete_user_confirm: { id: 'Apakah Anda yakin ingin menghapus pengguna ini?', en: 'Are you sure you want to delete this user?' },
  add_asset: { id: 'Tambah Aset', en: 'Add Asset' },
  market_overview: { id: 'Ikhtisar Pasar', en: 'Market Overview' },
  market_overview_subtitle: { id: 'Kripto teratas berdasarkan kapitalisasi pasar', en: 'Top cryptocurrencies by market cap' },
  crypto_converter: { id: 'Konverter Kripto', en: 'Crypto Converter' },
  trending_coins: { id: 'Koin Populer', en: 'Trending Coins' },
  latest_news: { id: 'Berita Terbaru', en: 'Latest News' },
  live_feed: { id: 'Siaran Langsung', en: 'Live Feed' },
  live_status: { id: 'Langsung', en: 'Live' },
  last_updated: { id: 'Terakhir diperbarui', en: 'Last updated' },
  toggle_converter: { id: 'Buka Konverter', en: 'Toggle Converter' },
  action: { id: 'Aksi', en: 'Action' },
  no_assets_found: { id: 'Aset tidak ditemukan', en: 'No assets found' },
  adjust_search: { id: 'Coba sesuaikan kata kunci pencarian Anda.', en: 'Try adjusting your search terms.' },
  
  // Table Headers
  asset: { id: 'Aset', en: 'Asset' },
  price: { id: 'Harga', en: 'Price' },
  change_24h: { id: 'Perubahan 24j', en: '24h Change' },
  market_cap: { id: 'Kap Pasar', en: 'Market Cap' },
  
  // Converter
  usd_label: { id: 'USD (Dolar Amerika Serikat)', en: 'USD (United States Dollar)' },
  crypto_amount: { id: 'Jumlah Kripto', en: 'Crypto Amount' },
  
  // Portfolio Modal
  edit_portfolio: { id: 'Edit Portofolio', en: 'Edit Portfolio' },
  select_coin: { id: 'Pilih Koin', en: 'Select Coin' },
  amount_held: { id: 'Jumlah yang Dimiliki', en: 'Amount Held' },
  save_changes: { id: 'Simpan Perubahan', en: 'Save Changes' },
  cancel: { id: 'Batal', en: 'Cancel' },
  remove_asset: { id: 'Hapus Aset', en: 'Remove Asset' },
  enter_amount: { id: 'Masukkan Jumlah', en: 'Enter Amount' },
  select_asset: { id: 'Pilih Aset', en: 'Select Asset' },
  in_portfolio: { id: 'Di Portofolio', en: 'In Portfolio' },
  no_coins_found: { id: 'Koin tidak ditemukan.', en: 'No coins found.' },
  change: { id: 'Ubah', en: 'Change' },
  amount_you_own: { id: 'Jumlah yang Anda miliki', en: 'Amount you own' },
  currently_holding: { id: 'Saat ini memiliki', en: 'Currently holding' },
  back: { id: 'Kembali', en: 'Back' },
  save_asset: { id: 'Simpan Aset', en: 'Save Asset' },

  // Coin Detail Modal
  price_history_7d: { id: 'Riwayat Harga 7 Hari', en: '7D Price History' },
  loading_chart: { id: 'Memuat data grafik...', en: 'Loading chart data...' },
  chart_unavailable: { id: 'Data grafik tidak tersedia', en: 'Chart data unavailable' },
  all_time_high: { id: 'Harga Tertinggi Sepanjang Masa', en: 'All Time High' },
  total_volume: { id: 'Total Volume', en: 'Total Volume' },
  supply_info: { id: 'Informasi Pasokan', en: 'Supply Information' },
  circulating_supply: { id: 'Pasokan Beredar', en: 'Circulating Supply' },
  total_supply: { id: 'Total Pasokan', en: 'Total Supply' },
  low_24h: { id: 'Terendah 24j', en: 'Low 24h' },
  high_24h: { id: 'Tertinggi 24j', en: 'High 24h' },

  // Register Page
  register_title: { id: 'Gabung Noisy Tech', en: 'Join Noisy Tech' },
  register_subtitle: { id: 'Buat akun Anda untuk memulai.', en: 'Create your account to get started.' },
  full_name_label: { id: 'Nama Lengkap', en: 'Full Name' },
  confirm_password_label: { id: 'Konfirmasi Kata Sandi', en: 'Confirm Password' },
  create_account_button: { id: 'Buat Akun', en: 'Create Account' },
  already_have_account: { id: 'Sudah punya akun?', en: 'Already have an account?' },
  sign_in_link: { id: 'Masuk', en: 'Sign in' },
  portfolio_allocation: { id: 'Alokasi Portofolio', en: 'Portfolio Allocation' },
  other_assets: { id: 'aset lainnya', en: 'other assets' },
  your_assets: { id: 'Aset Anda', en: 'Your Assets' },
  broadcast_message: { id: 'Pesan Siaran', en: 'Broadcast Message' },
  broadcast_placeholder: { id: 'Tulis pesan untuk semua pengguna...', en: 'Write a message for all users...' },
  send_broadcast: { id: 'Kirim Siaran', en: 'Send Broadcast' },
  clear_broadcast: { id: 'Hapus Siaran', en: 'Clear Broadcast' },
  broadcast_sent: { id: 'Pesan siaran berhasil dikirim!', en: 'Broadcast message sent successfully!' },
  broadcast_cleared: { id: 'Pesan siaran telah dihapus.', en: 'Broadcast message cleared.' },
  trend_7d: { id: 'Tren 7 Hari', en: '7D Trend' },
  recent_activity: { id: 'Aktivitas Terbaru', en: 'Recent Activity' },
  status: { id: 'Status', en: 'Status' },
  online: { id: 'Online', en: 'Online' },
  offline: { id: 'Offline', en: 'Offline' },
  activity_login: { id: 'Masuk ke akun', en: 'Logged in' },
  activity_add_asset: { id: 'Menambah aset {coin}', en: 'Added asset {coin}' },
  activity_remove_asset: { id: 'Menghapus aset {coin}', en: 'Removed asset {coin}' },
  activity_broadcast: { id: 'Mengirim pesan siaran', en: 'Sent a broadcast message' },
  no_activity: { id: 'Belum ada aktivitas tercatat.', en: 'No activity recorded yet.' },
  time: { id: 'Waktu', en: 'Time' },
  user: { id: 'Pengguna', en: 'User' },
  event: { id: 'Kejadian', en: 'Event' },
  filter_all: { id: 'Semua Koin', en: 'All Coins' },
  filter_favorites: { id: 'Favorit Saya', en: 'My Favorites' },
  no_favorites_found: { id: 'Belum ada koin favorit.', en: 'No favorite coins yet.' },
  add_favorites_hint: { id: 'Klik ikon bintang pada koin untuk menambahkannya ke daftar favorit Anda.', en: 'Click the star icon on a coin to add it to your favorites list.' },
  suspend_user: { id: 'Blokir Pengguna', en: 'Suspend User' },
  activate_user: { id: 'Aktifkan Pengguna', en: 'Activate User' },
  promote_admin: { id: 'Jadikan Admin', en: 'Promote to Admin' },
  demote_user: { id: 'Jadikan User', en: 'Demote to User' },
  status_active: { id: 'Aktif', en: 'Active' },
  status_suspended: { id: 'Diblokir', en: 'Suspended' },
  portfolio_distribution: { id: 'Distribusi Portofolio', en: 'Portfolio Distribution' },
  activity_promote: { id: 'Mempromosikan user {coin} menjadi Admin', en: 'Promoted user {coin} to Admin' },
  activity_demote: { id: 'Menurunkan user {coin} menjadi User', en: 'Demoted user {coin} to User' },
  activity_suspend: { id: 'Memblokir user {coin}', en: 'Suspended user {coin}' },
  activity_activate: { id: 'Mengaktifkan user {coin}', en: 'Activated user {coin}' },
  
  // Transaction History
  transaction_history: { id: 'Riwayat Transaksi', en: 'Transaction History' },
  search_transactions: { id: 'Cari transaksi...', en: 'Search transactions...' },
  no_transactions: { id: 'Belum Ada Transaksi', en: 'No Transactions Yet' },
  no_transactions_hint: { id: 'Riwayat transaksi Anda akan muncul di sini setelah Anda menambahkan aset ke portofolio.', en: 'Your transaction history will appear here once you add assets to your portfolio.' },
  no_transactions_found: { id: 'Tidak ada transaksi yang cocok dengan pencarian Anda.', en: 'No transactions found matching your search.' },
  delete_transaction: { id: 'Hapus Transaksi', en: 'Delete Transaction' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'id';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
