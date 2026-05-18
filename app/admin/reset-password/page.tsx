"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, CheckCircle, Copy, Lock, Shield, Sparkles } from "lucide-react"
import { apiService } from "@/services/api/api.service"
import { Sora, Inter, JetBrains_Mono } from "next/font/google"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" }
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" }
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: "Password must contain at least one symbol (!@#$%^&* etc)" }
  }
  return { valid: true }
}

export default function AdminResetPasswordPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [resetUserId, setResetUserId] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!apiService.isAuthenticated()) {
          router.push("/login")
          return
        }

        const me = await apiService.getMe()
        setCurrentUser(me)

        if (!me?.is_admin) {
          setError("Access Denied: You must be an admin to access this page.")
          setIsAuthorized(false)
        } else {
          setIsAuthorized(true)
          await fetchAllUsers()
        }
      } catch (err) {
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchAllUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
    } catch (err: any) {
      console.error("Error fetching users:", err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSelectUser = (user: any) => {
    setSelectedUser(user)
    setResetUserId(user.id)
    setError(null)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!resetUserId.trim()) {
      setError("User ID is required")
      return
    }

    if (!newPassword) {
      setError("New password is required")
      return
    }

    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || "Invalid password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsResetting(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/admin/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            user_id: resetUserId,
            new_password: newPassword,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to reset password")
      }

      setSuccessMessage(`Password reset successfully for ${selectedUser?.email || resetUserId}!`)
      setResetUserId("")
      setNewPassword("")
      setConfirmPassword("")
      setSelectedUser(null)
    } catch (err: any) {
      setError(err.message || "Failed to reset password")
    } finally {
      setIsResetting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} flex min-h-screen items-center justify-center bg-background text-foreground`}>
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/35 border-t-primary" />
          <p className="mt-4 font-[var(--font-inter)] text-muted-foreground">Checking authorization...</p>
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
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-secondary/12 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 inline-flex items-center gap-2 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-border/90 bg-black/70 p-8"
        >
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <p className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.2em] text-primary">
                  Admin Only
                </p>
                <h1 className="font-[var(--font-sora)] text-3xl font-semibold">Reset User Password</h1>
              </div>
            </div>
            <p className="font-[var(--font-inter)] text-sm text-muted-foreground">
              As an administrator, you can reset a user's password. Select a user or enter their ID directly.
            </p>
          </div>

          {!isAuthorized && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/35 bg-red-500/10 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div>
                <p className="font-semibold text-red-300">{error}</p>
                <p className="mt-1 font-[var(--font-inter)] text-sm text-red-300/80">
                  Only admin users can access this page.
                </p>
              </div>
            </div>
          )}

          {isAuthorized && (
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              {/* Users List */}
              <div>
                <h2 className="mb-4 font-[var(--font-sora)] text-lg font-semibold">All Users</h2>
                <div className="rounded-lg border border-border bg-card/30 p-4">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center gap-2 py-8">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/35 border-t-primary" />
                      <p className="font-[var(--font-inter)] text-sm text-muted-foreground">Loading users...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <p className="font-[var(--font-inter)] text-sm text-muted-foreground">No users found</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {users.map((user: any) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className={`w-full rounded-lg border p-3 text-left transition-colors ${
                            selectedUser?.id === user.id
                              ? "border-primary/50 bg-primary/10"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{user.name}</p>
                              <p className="font-[var(--font-inter)] text-xs text-muted-foreground">{user.email}</p>
                              {user.username && (
                                <p className="font-[var(--font-jetbrains-mono)] text-xs text-muted-foreground">@{user.username}</p>
                              )}
                              <p className="font-[var(--font-jetbrains-mono)] text-[10px] text-muted-foreground/50 mt-1">{user.id}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(user.id)
                              }}
                              className="ml-2 p-1 hover:text-primary"
                              title="Copy user ID"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reset Form */}
              <div>
                <h2 className="mb-4 font-[var(--font-sora)] text-lg font-semibold">Reset Password</h2>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="rounded-lg border border-border bg-card/30 p-4">
                    <p className="mb-2 font-[var(--font-inter)] text-xs text-muted-foreground">
                      Admin User: <span className="text-primary">{currentUser?.email}</span>
                    </p>
                    <p className="font-[var(--font-inter)] text-xs text-muted-foreground">
                      Admin privileges: {currentUser?.is_admin ? "✓ Enabled" : "✗ Disabled"}
                    </p>
                  </div>

                  {selectedUser && (
                    <div className="rounded-lg border border-primary/25 bg-primary/8 p-3">
                      <p className="font-[var(--font-inter)] text-sm">
                        Resetting password for: <span className="font-semibold text-primary">{selectedUser.email}</span>
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="mb-2">
                      <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-1">
                        New Password
                      </label>
                      <p className="font-[var(--font-inter)] text-xs text-muted-foreground">
                        Minimum 8 characters • At least 1 number • At least 1 symbol
                      </p>
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isResetting}
                      className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-inter)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                      placeholder="e.g., MyPass123!"
                    />
                  </div>

                  <div>
                    <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isResetting}
                      className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-inter)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                      placeholder="Confirm password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting || !resetUserId || !newPassword || !confirmPassword}
                    className="w-full rounded-lg bg-primary px-4 py-2 font-[var(--font-inter)] text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isResetting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/35 border-t-black" />
                        Resetting password...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>

                  {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-500/35 bg-red-500/10 p-4">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                      <p className="font-[var(--font-inter)] text-sm text-red-300">{error}</p>
                    </div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 rounded-lg border border-green-500/35 bg-green-500/10 p-4"
                    >
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                      <p className="font-[var(--font-inter)] text-sm text-green-300">{successMessage}</p>
                    </motion.div>
                  )}
                </form>

                <div className="mt-6 rounded-lg border border-primary/25 bg-primary/8 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="font-semibold text-primary">Security Note</p>
                      <p className="mt-1 font-[var(--font-inter)] text-xs text-muted-foreground">
                        Admin password resets are logged. Users will need to authenticate with the new password on next login.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!apiService.isAuthenticated()) {
          router.push("/login")
          return
        }

        const me = await apiService.getMe()
        setCurrentUser(me)

        if (!me?.is_admin) {
          setError("Access Denied: You must be an admin to access this page.")
          setIsAuthorized(false)
        } else {
          setIsAuthorized(true)
        }
      } catch (err) {
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!resetUserId.trim()) {
      setError("User ID is required")
      return
    }

    if (!newPassword) {
      setError("New password is required")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsResetting(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/admin/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            user_id: resetUserId,
            new_password: newPassword,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to reset password")
      }

      setSuccessMessage("Password reset successfully!")
      setResetUserId("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "Failed to reset password")
    } finally {
      setIsResetting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} flex min-h-screen items-center justify-center bg-background text-foreground`}>
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/35 border-t-primary" />
          <p className="mt-4 font-[var(--font-inter)] text-muted-foreground">Checking authorization...</p>
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
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-secondary/12 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-4xl px-6 py-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 inline-flex items-center gap-2 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-border/90 bg-black/70 p-8"
        >
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <p className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.2em] text-primary">
                  Admin Only
                </p>
                <h1 className="font-[var(--font-sora)] text-3xl font-semibold">Reset User Password</h1>
              </div>
            </div>
            <p className="font-[var(--font-inter)] text-sm text-muted-foreground">
              As an administrator, you can reset a user's password. The user will need to set a new password on next login.
            </p>
          </div>

          {!isAuthorized && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/35 bg-red-500/10 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div>
                <p className="font-semibold text-red-300">{error}</p>
                <p className="mt-1 font-[var(--font-inter)] text-sm text-red-300/80">
                  Only admin users can access this page.
                </p>
              </div>
            </div>
          )}

          {isAuthorized && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="rounded-lg border border-border bg-card/30 p-4">
                <p className="mb-2 font-[var(--font-inter)] text-xs text-muted-foreground">
                  Current Admin User: <span className="text-primary">{currentUser?.email}</span>
                </p>
                <p className="font-[var(--font-inter)] text-xs text-muted-foreground">
                  Admin privileges: {currentUser?.is_admin ? "✓ Enabled" : "✗ Disabled"}
                </p>
              </div>

              <div>
                <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-2">
                  User ID to Reset (MongoDB ObjectId)
                </label>
                <input
                  type="text"
                  value={resetUserId}
                  onChange={(e) => setResetUserId(e.target.value)}
                  disabled={isResetting}
                  className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-jetbrains-mono)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                  placeholder="e.g., 507f1f77bcf86cd799439011"
                />
                <p className="mt-1 font-[var(--font-inter)] text-xs text-muted-foreground">
                  You can find user IDs from the user management dashboard or database.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isResetting}
                    className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-inter)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div>
                  <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isResetting}
                    className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-inter)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isResetting || !resetUserId || !newPassword || !confirmPassword}
                className="w-full rounded-lg bg-primary px-4 py-2 font-[var(--font-inter)] text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isResetting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/35 border-t-black" />
                    Resetting password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>

              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/35 bg-red-500/10 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                  <p className="font-[var(--font-inter)] text-sm text-red-300">{error}</p>
                </div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 rounded-lg border border-green-500/35 bg-green-500/10 p-4"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  <p className="font-[var(--font-inter)] text-sm text-green-300">{successMessage}</p>
                </motion.div>
              )}
            </form>
          )}

          <div className="mt-8 rounded-lg border border-primary/25 bg-primary/8 p-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-semibold text-primary">Security Note</p>
                <p className="mt-1 font-[var(--font-inter)] text-xs text-muted-foreground">
                  Admin password resets are logged. Users will need to set a new password upon their next login attempt. Share the temporary password securely with the user.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
