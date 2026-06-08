"use client";

import { useEffect, useState } from "react";
import {
  getUsers,
  getPendingUsers,
  createUser,
  deleteUser,
  approveUser,
  changeAdminPassword,
  logout,
} from "@/actions/auth";
import {
  UserPlus,
  Trash2,
  Shield,
  User,
  LogOut,
  ArrowLeft,
  CheckCircle,
  KeyRound,
  Clock,
  X,
  AlertTriangle,
  MessageSquare,
  Settings2,
  CheckCheck,
  XCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";


export default function AdminPortal() {
  const [users, setUsers] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [changePassNew, setChangePassNew] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // ── AI Chat Quota state ────────────────────────────────────────────────────
  const [quotaSettings, setQuotaSettings] = useState<{ period: string; defaultLimit: number } | null>(null);
  const [quotaRequests, setQuotaRequests] = useState<any[]>([]);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [approveModalId, setApproveModalId] = useState<number | null>(null);
  const [approveAmount, setApproveAmount] = useState("");

  const fetchQuotaData = async () => {
    try {
      const [settingsRes, requestsRes] = await Promise.all([
        fetch("/api/chat/quota-settings"),
        fetch("/api/chat/quota-request"),
      ]);
      if (settingsRes.ok) setQuotaSettings(await settingsRes.json());
      if (requestsRes.ok) {
        const d = await requestsRes.json();
        setQuotaRequests(d.requests ?? []);
      }
    } catch {}
  };

  const handleSaveQuotaSettings = async () => {
    if (!quotaSettings) return;
    setQuotaLoading(true);
    try {
      await fetch("/api/chat/quota-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quotaSettings),
      });
      setActionSuccess("Quota settings saved.");
    } catch {
      setActionError("Failed to save quota settings.");
    } finally {
      setQuotaLoading(false);
    }
  };

  const handleQuotaAction = async (id: number, action: "approve" | "partially_approve" | "reject") => {
    setActionError("");
    setActionSuccess("");
    try {
      const res = await fetch("/api/chat/quota-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: id,
          action,
          approvedAmount: action === "partially_approve" ? parseInt(approveAmount) : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Request ${action === "reject" ? "rejected" : "approved"} (${data.approvedAmount ?? 0} extra messages).`);
        setApproveModalId(null);
        setApproveAmount("");
        fetchQuotaData();
      } else {
        setActionError(data.error ?? "Action failed.");
      }
    } catch {
      setActionError("Network error.");
    }
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: number;
    username: string;
    isPending: boolean;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const resUsers = await getUsers();
    if (resUsers.success && resUsers.users) {
      setUsers(resUsers.users);
    }
    const resPending = await getPendingUsers();
    if (resPending.success && resPending.users) {
      setPendingUsers(resPending.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    fetchQuotaData();
  }, []);


  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");

    if (!newUsername || !newPassword) {
      setActionError("Please provide both username and password.");
      return;
    }

    const res = await createUser(newUsername, newPassword, isAdmin);
    if (res.success) {
      setActionSuccess(`User ${newUsername} created successfully.`);
      setNewUsername("");
      setNewPassword("");
      setIsAdmin(false);
      fetchData();
    } else {
      setActionError(res.error || "Failed to create user.");
    }
  };

  const handleDeleteUser = (
    id: number,
    username: string,
    isPending = false,
  ) => {
    setConfirmModal({ isOpen: true, id, username, isPending });
  };

  const executeDelete = async () => {
    if (!confirmModal) return;
    const { id, username, isPending } = confirmModal;
    setConfirmModal(null);

    setActionError("");
    setActionSuccess("");

    const res = await deleteUser(id);
    if (res.success) {
      setActionSuccess(
        `User ${username} ${isPending ? "rejected" : "deleted"} successfully.`,
      );
      fetchData();
    } else {
      setActionError(
        res.error || `Failed to ${isPending ? "reject" : "delete"} user.`,
      );
    }
  };

  const handleApproveUser = async (id: number, username: string) => {
    setActionError("");
    setActionSuccess("");

    const res = await approveUser(id);
    if (res.success) {
      setActionSuccess(`User ${username} approved successfully.`);
      fetchData();
    } else {
      setActionError(res.error || "Failed to approve user.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");
    setPassLoading(true);

    if (!oldPassword || !changePassNew) {
      setActionError("Please provide both current and new password.");
      setPassLoading(false);
      return;
    }

    const res = await changeAdminPassword(oldPassword, changePassNew);
    if (res.success) {
      setActionSuccess("Password changed successfully.");
      setOldPassword("");
      setChangePassNew("");
    } else {
      setActionError(res.error || "Failed to change password.");
    }
    setPassLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black flex items-center gap-3">
                <Shield className="w-8 h-8 text-indigo-500" />
                Admin Portal
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Manage system access, pending account requests, and user
                credentials.
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Notifications */}
        {actionError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 font-bold">
            {actionError}
          </div>
        )}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold">
            {actionSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Forms */}
          <div className="md:col-span-1 space-y-8">
            {/* Create User Form */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" /> Add New User
              </h2>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-50 transition-all font-medium"
                    placeholder="e.g. jdoe"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-50 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAdmin}
                      onChange={(e) => setIsAdmin(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Grant Admin Privileges
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-colors mt-4"
                >
                  Create User
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-500" /> Change My
                Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={changePassNew}
                    onChange={(e) => setChangePassNew(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-colors mt-4 disabled:opacity-50"
                >
                  {passLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: User Lists */}
          <div className="md:col-span-2 space-y-8">
            {/* Pending Users */}
            {pendingUsers.length > 0 && (
              <div className="bg-amber-50/70 dark:bg-amber-950/20 backdrop-blur-xl p-6 rounded-3xl border border-amber-200 dark:border-amber-800/40 shadow-xl">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-amber-900 dark:text-amber-200">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />{" "}
                  Pending Account Requests ({pendingUsers.length})
                </h2>

                <div className="space-y-3">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-amber-100 dark:border-amber-800/40 shadow-sm"
                    >
                      <div>
                        <div className="font-bold text-lg">{user.username}</div>
                        <div className="text-xs text-slate-50 font-medium mt-1">
                          Requested{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleApproveUser(user.id, user.username)
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-colors"
                          title="Approve User"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteUser(user.id, user.username, true)
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                          title="Reject Request"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Managed Users */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl min-h-[400px]">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" /> Managed Users (
                {users.length})
              </h2>

              {loading ? (
                <div className="flex items-center justify-center h-48 opacity-50">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">
                            {user.username}
                          </span>
                          {user.isAdmin && (
                            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-1">
                          Created{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {user.username !== "admin" && (
                        <button
                          onClick={() =>
                            handleDeleteUser(user.id, user.username)
                          }
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {users.length === 0 && (
                    <div className="text-center py-12 text-slate-500 font-medium">
                      No users found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Confirmation Modal */}
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
              <button
                onClick={() => setConfirmModal(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Confirm Action</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Are you sure you want to{" "}
                {confirmModal.isPending
                  ? "reject the account request for"
                  : "permanently delete the user"}{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {confirmModal.username}
                </span>
                ?
              </p>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-500/30"
                >
                  {confirmModal.isPending ? "Reject" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Quotas Section */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-indigo-200 dark:border-indigo-800/40 shadow-xl">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" /> AI Chat Quotas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Global Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Global Settings
              </h3>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Reset Period</label>
                <select
                  value={quotaSettings?.period ?? "DAY"}
                  onChange={(e) => setQuotaSettings((s) => ({ ...(s ?? { defaultLimit: 20 }), period: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                >
                  <option value="DAY">Per Day</option>
                  <option value="WEEK">Per Week</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Default Message Limit</label>
                <input
                  type="number" min={1}
                  value={quotaSettings?.defaultLimit ?? 20}
                  onChange={(e) => setQuotaSettings((s) => ({ ...(s ?? { period: "DAY" }), defaultLimit: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>
              <button
                onClick={handleSaveQuotaSettings} disabled={quotaLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {quotaLoading ? "Saving…" : "Save Settings"}
              </button>
            </div>

            {/* Pending Requests */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Pending Requests
                {quotaRequests.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full">{quotaRequests.length}</span>
                )}
              </h3>
              {quotaRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm font-medium border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  No pending quota requests
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {quotaRequests.map((req: any) => (
                    <div key={req.id} className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/30 rounded-2xl">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-sm">{req.user?.username}</span>
                          <span className="text-xs text-slate-500 ml-2">wants +{req.requestedExtra} msgs</span>
                          {req.reason && <p className="text-xs text-slate-500 mt-1 italic">"{req.reason}"</p>}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setApproveModalId(req.id); setApproveAmount(String(req.requestedExtra)); }}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCheck className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleQuotaAction(req.id, "reject")}
                            className="p-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {approveModalId === req.id && (
                        <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/30 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Approve how many? (max {req.requestedExtra})
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number" min={1} max={req.requestedExtra} value={approveAmount}
                              onChange={(e) => setApproveAmount(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button
                              onClick={() => handleQuotaAction(req.id, parseInt(approveAmount) >= req.requestedExtra ? "approve" : "partially_approve")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl"
                            >
                              Confirm
                            </button>
                            <button onClick={() => setApproveModalId(null)} className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs rounded-xl">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
