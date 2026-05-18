"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Users, Activity, CheckCircle, AlertTriangle, LockKeyhole, Power } from "lucide-react"
import { apiService } from "@/services/api/api.service"
import { Sora, Inter, JetBrains_Mono } from "next/font/google"
import { DashboardSwitcher } from "@/components/dashboard/DashboardSwitcher"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingReports, setLoadingReports] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [reportsCountByUser, setReportsCountByUser] = useState<any[]>([]) // for simple chart
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizeUser = (user: any) => ({
    ...user,
    id: user?.id ?? user?._id ?? user?.user_id ?? null,
  })

  const getUserKey = (user: any) => user?.id ?? user?._id ?? user?.email ?? user?.username

  const selectedUserReports = selectedUser
    ? reportsCountByUser.find((report) => report.userId === selectedUser.id)?.reports ?? 0
    : 0

  // Normalize current user for comparison (handles both id and _id fields)
  const normalizedCurrentUser = currentUser ? normalizeUser(currentUser) : null
  const normalizedSelectedUser = selectedUser ? normalizeUser(selectedUser) : null
  const isSelectedSelfImproved = Boolean(
    normalizedCurrentUser?.id &&
    normalizedSelectedUser?.id &&
    String(normalizedCurrentUser.id) === String(normalizedSelectedUser.id)
  )

  const handleSelectUser = (user: any) => {
    setSelectedUser(normalizeUser(user))
    setStatusMessage(null)
    setStatusError(null)
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleToggleSelectedUserStatus = async () => {
    if (!selectedUser?.id) return
    if (isSelectedSelfImproved) {
      setStatusError("You cannot disable your own admin account.")
      return
    }

    setIsSavingStatus(true)
    setStatusError(null)
    setStatusMessage(null)
    try {
      const updated = await apiService.updateUserStatus(selectedUser.id, !selectedUser.is_active)
      const normalized = normalizeUser(updated)
      setUsers((prev) => prev.map((user) => (getUserKey(user) === getUserKey(normalized) ? normalized : user)))
      setSelectedUser(normalized)
      setStatusMessage(normalized.is_active ? "User enabled successfully." : "User disabled successfully.")
    } catch (err: any) {
      setStatusError(err?.message || "Failed to update user status")
    } finally {
      setIsSavingStatus(false)
    }
  }

  const handleResetSelectedUserPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedUser?.id) return

    setStatusError(null)
    setStatusMessage(null)

    if (!newPassword) {
      setStatusError("New password is required.")
      return
    }

    if (newPassword !== confirmPassword) {
      setStatusError("Passwords do not match.")
      return
    }

    setIsResettingPassword(true)
    try {
      await apiService.adminResetPassword(selectedUser.id, newPassword)
      setStatusMessage("Password updated successfully.")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setStatusError(err?.message || "Failed to update password")
    } finally {
      setIsResettingPassword(false)
    }
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!apiService.isAuthenticated()) {
          router.push('/login')
          return
        }
        const me = await apiService.getMe()
        setCurrentUser(me)
        if (!me?.is_admin) {
          setError('Access denied')
          router.push('/dashboard')
          return
        }
        await loadUsers()
      } catch (e) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    void bootstrap()
  }, [router])

  const loadUsers = async () => {
    setLoadingReports(true)
    try {
      const all = await apiService.listAllUsersAdmin()
      const normalizedUsers = (Array.isArray(all) ? all : []).map(normalizeUser)
      setUsers(normalizedUsers)

      // Fetch accurate analysis counts for each user using the admin reports endpoint.
      const reportCounts = await Promise.all(
        normalizedUsers.map(async (u: any) => {
          if (!u.id) {
            return {
              name: u.username || u.email,
              reports: 0,
              userId: null,
            }
          }

          try {
            const response = await apiService.getUserReports(u.id, 1000, 0)
            const count =
              typeof response?.total === "number"
                ? response.total
                : Array.isArray(response?.data)
                  ? response.data.length
                  : typeof response?.count === "number"
                    ? response.count
                    : Array.isArray(response)
                      ? response.length
                      : 0

            return {
              name: u.username || u.email,
              reports: count,
              userId: u.id,
            }
          } catch (err: any) {
            console.error(`Failed to fetch reports for ${u.email}:`, err?.message || err)
            return {
              name: u.username || u.email,
              reports: 0,
              userId: u.id,
            }
          }
        })
      )

      setReportsCountByUser(reportCounts)
    } catch (err: any) {
      setError(err?.message || 'Failed to load users')
    } finally {
      setLoadingReports(false)
    }
  }

  if (loading) {
    return (
      <div className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} flex min-h-screen items-center justify-center bg-background text-foreground`}>
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/35 border-t-primary" />
          <p className="mt-4 font-[var(--font-inter)] text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} flex min-h-screen items-center justify-center bg-background text-foreground`}>
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-4 font-[var(--font-inter)] text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-hidden bg-background text-foreground`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "52px 52px", "0px 0px"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.2em] text-primary">Admin Console</p>
            <h1 className="font-[var(--font-sora)] text-3xl font-semibold">Administrator Dashboard</h1>
            <p className="font-[var(--font-inter)] text-sm text-muted-foreground mt-1">Overview of user activity and system usage.</p>
          </div>
          <div>
            <DashboardSwitcher currentPath="/dashboard/admin" />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-border/90 bg-black/70 p-6">
            <h2 className="mb-4 text-lg font-semibold">User Activity Summary</h2>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={reportsCountByUser}>
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reports" fill="#00ff88" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((u) => (
                <button
                  key={getUserKey(u)}
                  type="button"
                  onClick={() => handleSelectUser(u)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 ${
                    selectedUser?.id === u.id ? "border-primary/60 bg-primary/10" : "border-border bg-card/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email} {u.username ? ` • @${u.username}` : ''}</p>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      {loadingReports ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary/35 border-t-primary" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        `Reports: ${reportsCountByUser.find((r) => r.userId === u.id)?.reports ?? 0}`
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-black/60 p-6">
              <h3 className="font-[var(--font-sora)] text-xl font-semibold">Quick Metrics</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4 bg-card/30">
                  <p className="text-xs text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-semibold mt-1">{users.length}</p>
                </div>
                <div className="rounded-lg border border-border p-4 bg-card/30">
                  <p className="text-xs text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-semibold mt-1">
                    {loadingReports ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      reportsCountByUser.reduce((sum, r) => sum + (r.reports || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-black/60 p-6">
              <h3 className="font-[var(--font-sora)] text-xl font-semibold">Selected User Activity</h3>
              {selectedUser ? (
                <div className="mt-4 space-y-5 text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <p><strong>Reports:</strong> {selectedUserReports}</p>
                    <p><strong>Name:</strong> {selectedUser.name}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Username:</strong> {selectedUser.username || '—'}</p>
                    <p><strong>Status:</strong> {selectedUser.is_active ? 'Active' : 'Disabled'}</p>
                  </div>

                  {statusMessage && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-200">
                      {statusMessage}
                    </div>
                  )}
                  {statusError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-200">
                      {statusError}
                    </div>
                  )}

                  <div className="space-y-3 rounded-xl border border-border/70 bg-card/20 p-4">
                    <div className="flex items-center gap-2 text-foreground">
                      <Power className="h-4 w-4 text-primary" />
                      <span className="font-medium">Account Controls</span>
                    </div>

                    {isSelectedSelfImproved ? (
                      <div className="rounded-lg border border-border/60 bg-card/30 p-3 text-xs text-muted-foreground">
                        <p className="mb-2 font-medium text-foreground">Your Admin Account</p>
                        <p>You cannot disable your own account. If you need account changes, contact another administrator.</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleToggleSelectedUserStatus}
                        disabled={isSavingStatus}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Users className="h-4 w-4" />
                        {isSavingStatus
                          ? 'Updating status...'
                          : selectedUser.is_active
                            ? 'Disable User'
                            : 'Enable User'}
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleResetSelectedUserPassword} className="space-y-3 rounded-xl border border-border/70 bg-card/20 p-4">
                    <div className="flex items-center gap-2 text-foreground">
                      <LockKeyhole className="h-4 w-4 text-primary" />
                      <span className="font-medium">Change Password</span>
                    </div>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="New password"
                      className="h-11 w-full rounded-lg border border-[#22262d] bg-[#101214] px-3 font-[var(--font-inter)] text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm new password"
                      className="h-11 w-full rounded-lg border border-[#22262d] bg-[#101214] px-3 font-[var(--font-inter)] text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    />

                    <button
                      type="submit"
                      disabled={isResettingPassword}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isResettingPassword ? 'Saving password...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Select a user from the list to view activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
