import React, { useState, useEffect } from "react";
import { Loader2, Users, UserX, ShieldBan, ShieldCheck, Mail, Eye } from "lucide-react";
import { getAllUsers, getAllGuests, toggleUserBan, type SiteUser, type GuestSession } from "../../lib/firebase";

export function AdminUsers() {
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [guests, setGuests] = useState<GuestSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // Refresh every 30s to update online status realtime without reloading the page entirely
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [u, g] = await Promise.all([getAllUsers(), getAllGuests()]);
      setUsers(u);
      setGuests(g);
    } catch (err) {
      console.error("Error loading users:", err);
    }
    setLoading(false);
  };

  const handleToggleBan = async (uid: string, currentStatus: boolean) => {
    setActionLoading(uid);
    try {
      await toggleUserBan(uid, !currentStatus);
      await loadData();
    } catch (err) {
      console.error("Error toggling ban:", err);
    }
    setActionLoading(null);
  };

  const isOnline = (lastSeen: any) => {
    if (!lastSeen) return false;
    const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
    return (Date.now() - date.getTime()) < 120000; // 2 minutes tracking threshold
  };

  const onlineUsers = users.filter((u) => isOnline(u.lastSeen)).length;
  const offlineUsers = users.length - onlineUsers;
  const onlineGuests = guests.filter((g) => isOnline(g.lastSeen)).length;
  const offlineGuests = guests.length - onlineGuests;

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 size={40} className="animate-spin" style={{ color: "#06b6d4" }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-[#06b6d4]/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#06b6d4]/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 text-[#06b6d4] flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-500 mb-1 font-arabic">المستخدمين المسجلين</div>
              <div className="text-2xl font-black text-white">{users.length}</div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-4 text-xs font-bold font-arabic">
             <div className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2 py-1 rounded-md">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>{onlineUsers} متصل
             </div>
             <div className="flex items-center gap-1.5 text-gray-500 bg-white/5 px-2 py-1 rounded-md">
               <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>{offlineUsers} غير متصل
             </div>
          </div>
        </div>

        {/* Guests */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-[#a855f7]/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 text-[#a855f7] flex items-center justify-center">
              <Eye size={24} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-500 mb-1 font-arabic">الزوار (غير مسجلين)</div>
              <div className="text-2xl font-black text-white">{guests.length}</div>
            </div>
          </div>
           <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-4 text-xs font-bold font-arabic">
             <div className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2 py-1 rounded-md">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>{onlineGuests} متصل
             </div>
             <div className="flex items-center gap-1.5 text-gray-500 bg-white/5 px-2 py-1 rounded-md">
               <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>{offlineGuests} غير متصل
             </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-3 font-arabic">
            <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4]">
              <Users size={16} />
            </div>
            قائمة المستخدمين المسجلين
          </h2>
        </div>
        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <UserX size={24} />
            </div>
            <p className="font-bold font-arabic">لا يوجد مستخدمين مسجلين بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-gray-400 text-sm font-bold font-arabic">
                  <th className="p-4 whitespace-nowrap border-b border-white/5">المستخدم</th>
                  <th className="p-4 whitespace-nowrap border-b border-white/5">الحالة</th>
                  <th className="p-4 whitespace-nowrap border-b border-white/5">تاريخ التسجيل</th>
                  <th className="p-4 whitespace-nowrap text-left border-b border-white/5">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => {
                  const online = isOnline(user.lastSeen);
                  const isBanned = user.isBanned;

                  return (
                    <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                            isBanned 
                              ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                              : online 
                                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                : 'bg-white/5 border-white/10 text-gray-400'
                          }`}>
                            <Mail size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm" style={{ textDecoration: isBanned ? 'line-through' : 'none', color: isBanned ? '#888' : '#fff' }}>
                               {user.email || 'مستخدم بدون بريد'}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{user.uid}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-arabic">
                           <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${online ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-white/10'}`}>
                             {online && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                             {online ? 'متصل الآن' : 'غير متصل'}
                         </div>
                         {isBanned && (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                               محظور
                            </div>
                         )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-400 font-medium font-mono">
                        {user.createdAt ? new Date(user.createdAt.toDate ? user.createdAt.toDate() : user.createdAt).toLocaleDateString('ar-IQ') : '—'}
                      </td>
                      <td className="p-4 text-left">
                        {user.uid !== "1kxnlTP7AlZvFwc82E546aNFX8j2" ? (
                           <button
                             onClick={() => handleToggleBan(user.uid, isBanned)}
                             disabled={actionLoading === user.uid}
                             className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 font-arabic ${
                               isBanned 
                                 ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20' 
                                 : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20'
                             }`}
                           >
                             {actionLoading === user.uid ? (
                               <Loader2 size={16} className="animate-spin" />
                             ) : isBanned ? (
                               <>
                                 <ShieldCheck size={16} />
                                 فك الحظر
                               </>
                             ) : (
                               <>
                                 <ShieldBan size={16} />
                                 حظر المستخدم
                               </>
                             )}
                           </button>
                        ): (
                            <div className="text-xs font-bold text-gray-600 bg-white/5 inline-block px-3 py-1.5 rounded-lg border border-white/5">المدير</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
