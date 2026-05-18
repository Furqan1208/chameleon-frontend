/*
  DESIGN DIRECTION
  ----------------
  - Minimal SOC dashboard aesthetic
  - Cleaner spacing & alignment
  - Less glow / less gradients
  - More enterprise + modern security platform look
  - Uniform card heights
  - Better typography hierarchy
  - Professional muted palette
  - No unnecessary badges everywhere
*/

"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Database,
  FileBarChart2,
  Layers3,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  Mail,
  Navigation,
  Radar,
  RefreshCcw,
  Settings2,
  ShieldCheck,
  Upload,
  User2,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useUiPreferences } from "@/hooks/useUiPreferences";

import {
  DEFAULT_UI_PREFERENCES,
  SidebarPreferences,
  TabPreferences,
} from "@/lib/types/preferences";

import { apiService } from "@/services/api/api.service";

type Item = {
  key: string;
  title: string;
  description: string;
  icon: any;
  locked?: boolean;
};

export default function SettingsPage() {
  const { preferences, loading, error, updatePreferences, resetPreferences } =
    useUiPreferences();

  const [saving, setSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [saveError, setSaveError] = useState<string | null>(null);

  const [userInfo, setUserInfo] = useState<any>(null);

  const [userLoading, setUserLoading] = useState(true);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaMessage, setMfaMessage] = useState<string | null>(null);
  const [mfaSetup, setMfaSetup] = useState<any>(null);
  const [mfaCode, setMfaCode] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiService.getCurrentUser();
        setUserInfo(res);
      } catch (err) {
        console.error(err);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  useEffect(() => {
    if (saveError) {
      const timer = setTimeout(() => setSaveError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveError]);

  const tabs = (preferences.tabs ?? DEFAULT_UI_PREFERENCES.tabs)!;

  const sidebar =
    (preferences.sidebar ?? DEFAULT_UI_PREFERENCES.sidebar)!;

  const isMfaEnabled = Boolean(userInfo?.mfa_enabled);

  const handleStartMfaSetup = async () => {
    try {
      setMfaLoading(true);
      setMfaError(null);
      setMfaMessage(null);

      const setup = await apiService.beginMfaSetup();
      setMfaSetup(setup);
      setMfaCode("");
      setMfaMessage(
        "Scan the QR code with Google Authenticator or Microsoft Authenticator, then confirm the 6-digit code.",
      );
    } catch (err: any) {
      setMfaError(err?.message || "Unable to start MFA setup");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleConfirmMfaSetup = async () => {
    if (mfaCode.length !== 6) return;

    try {
      setMfaLoading(true);
      setMfaError(null);

      const updated = await apiService.confirmMfaSetup(mfaCode);
      setUserInfo(updated);
      setMfaSetup(null);
      setMfaCode("");
      setMfaMessage("MFA enabled successfully.");
    } catch (err: any) {
      setMfaError(err?.message || "Unable to verify MFA code");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    const confirmed = window.confirm(
      "Disable multi-factor authentication for your account?",
    );

    if (!confirmed) return;

    try {
      setMfaLoading(true);
      setMfaError(null);

      const updated = await apiService.disableMfa();
      setUserInfo(updated);
      setMfaSetup(null);
      setMfaCode("");
      setMfaMessage("MFA disabled.");
    } catch (err: any) {
      setMfaError(err?.message || "Unable to disable MFA");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleCancelMfaSetup = () => {
    setMfaSetup(null);
    setMfaCode("");
    setMfaError(null);
    setMfaMessage(null);
  };

  const analysisModules: Item[] = useMemo(
    () => [
      {
        key: "overview",
        title: "Overview",
        description: "Primary malware intelligence summary",
        icon: ShieldCheck,
        locked: true,
      },
      {
        key: "cape",
        title: "Sandbox Report",
        description: "Execution telemetry & behavioral traces",
        icon: Radar,
      },
      {
        key: "ai",
        title: "AI Analysis",
        description: "AI-assisted behavioral intelligence",
        icon: BrainCircuit,
      },
      {
        key: "parsed",
        title: "Parsed Analysis",
        description: "Structured indicators & extracted data",
        icon: Database,
      },
      {
        key: "threat_intel",
        title: "Threat Intelligence",
        description: "IOC enrichment & correlation",
        icon: Layers3,
      },
    ],
    [],
  );

  const navigationItems: Item[] = useMemo(
    () => [
      {
        key: "dashboard",
        title: "Dashboard",
        description: "Workspace overview",
        icon: LayoutDashboard,
      },
      {
        key: "upload",
        title: "Upload",
        description: "Sample submission",
        icon: Upload,
      },
      {
        key: "reports",
        title: "Reports",
        description: "Generated analysis reports",
        icon: FileBarChart2,
      },
      {
        key: "threat_intel",
        title: "Threat Intel",
        description: "Intelligence feeds & IOC pivots",
        icon: Radar,
      },
      {
        key: "integrations",
        title: "Integrations",
        description: "Connected services",
        icon: Workflow,
      },
      {
        key: "frameworks",
        title: "Frameworks",
        description: "MITRE ATT&CK mappings",
        icon: Layers3,
      },
      {
        key: "ml_dashboard",
        title: "ML Dashboard",
        description: "AI confidence & model insights",
        icon: Cpu,
      },
    ],
    [],
  );

  const handleTabToggle = async (
    tab: keyof TabPreferences,
  ) => {
    if (tab === "overview") return;

    try {
      setSaving(true);

      await updatePreferences({
        tabs: {
          ...tabs,
          [tab]: !(tabs?.[tab] ?? true),
        },
      });

      setSaveMessage("Settings updated");

      setTimeout(() => window.location.reload(), 600);
    } catch {
      setSaveError("Unable to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSidebarToggle = async (
    item: keyof SidebarPreferences,
  ) => {
    try {
      setSaving(true);

      await updatePreferences({
        sidebar: {
          ...sidebar,
          [item]: !(sidebar?.[item] ?? true),
        },
      });

      setSaveMessage("Settings updated");

      setTimeout(() => window.location.reload(), 600);
    } catch {
      setSaveError("Unable to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Reset all preferences to default values?",
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await resetPreferences();

      setSaveMessage("Preferences restored");

      setTimeout(() => window.location.reload(), 600);
    } catch {
      setSaveError("Failed to reset preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#131313]">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4 backdrop-blur-sm shadow-2xl shadow-black/10">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />

          <span className="text-sm text-white/65">
            Loading settings...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#131313]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-500/6 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 rounded-3xl border border-border bg-card/50 px-8 py-7 shadow-2xl shadow-black/10 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-emerald-400">
                <Settings2 className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Workspace Settings
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-white/65">
                  Configure analysis modules, threat intelligence
                  views, AI workflows, and workspace navigation.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                Malware Analysis
              </Badge>

              <Badge variant="secondary">
                Threat Intelligence
              </Badge>

              <Badge variant="secondary">
                AI Analysis
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 lg:w-[320px]">
            <StatCard
              label="Modules"
              value={
                Object.values(tabs ?? {}).filter(Boolean).length
              }
            />

            <StatCard
              label="Navigation"
              value={
                Object.values(sidebar ?? {})
                  .filter(Boolean)
                  .length
              }
            />

            <StatCard
              label="Status"
              value="Active"
            />

            <StatCard
              label="Threat Intel"
              value="Online"
            />
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          {saveMessage && (
            <AlertBox
              success
              icon={<CheckCircle2 className="h-4 w-4" />}
              message={saveMessage}
            />
          )}

          {saveError && (
            <AlertBox
              icon={<AlertCircle className="h-4 w-4" />}
              message={saveError}
            />
          )}

          {error && (
            <AlertBox
              icon={<AlertCircle className="h-4 w-4" />}
              message="Some preferences may be stored locally."
            />
          )}
        </div>

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left */}
          <div className="space-y-6 xl:col-span-4">
            {/* Profile */}
            <Card className="overflow-hidden border-border bg-card/50 shadow-2xl shadow-black/10 backdrop-blur-sm">
              <CardContent className="relative p-6">
                <div className="flex items-end gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-[#131313] bg-white/[0.03] shadow-lg shadow-black/15">
                    <User2 className="h-8 w-8 text-emerald-400" />
                  </div>

                  <div className="pb-1">
                    <h2 className="text-xl font-bold text-white">
                      {userInfo?.name ||
                        userInfo?.username ||
                        "Analyst"}
                    </h2>

                    <p className="text-sm text-white/60">
                      {userInfo?.role || "SOC Analyst"}
                    </p>
                  </div>
                </div>

                {userLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <InfoRow
                      icon={Mail}
                      label="Email"
                      value={
                        userInfo?.email ||
                        "No email configured"
                      }
                    />

                    <InfoRow
                      icon={ShieldCheck}
                      label="Security"
                      value="Protected Session"
                    />

                    <InfoRow
                      icon={LockKeyhole}
                      label="Authentication"
                      value={isMfaEnabled ? "MFA Enabled" : "MFA Disabled"}
                    />

                    {mfaError && (
                      <AlertBox
                        icon={<AlertCircle className="h-4 w-4" />}
                        message={mfaError}
                      />
                    )}

                    {mfaMessage && (
                      <AlertBox
                        success
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        message={mfaMessage}
                      />
                    )}

                    {!mfaSetup ? (
                      <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">
                              Multi-Factor Authentication
                            </p>

                            <p className="mt-1 text-xs text-white/60">
                              Add an authenticator app to require a 6-digit code during sign-in.
                            </p>
                          </div>

                          <Badge variant={isMfaEnabled ? "default" : "secondary"} className="shrink-0 border border-white/10 bg-white/[0.04] text-white/80">
                            {isMfaEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            onClick={handleStartMfaSetup}
                            disabled={mfaLoading}
                            className="flex-1"
                            variant={isMfaEnabled ? "outline" : "default"}
                          >
                            {mfaLoading ? "Preparing..." : isMfaEnabled ? "Reconfigure MFA" : "Enable MFA"}
                          </Button>

                          {isMfaEnabled && (
                            <Button
                              type="button"
                              onClick={handleDisableMfa}
                              disabled={mfaLoading}
                              variant="outline"
                              className="flex-1"
                            >
                              Disable MFA
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">Scan the QR code</p>
                            <p className="mt-1 text-xs text-white/60">
                              Use Google Authenticator or Microsoft Authenticator to scan this code.
                            </p>
                          </div>

                          <Button type="button" variant="ghost" onClick={handleCancelMfaSetup} className="self-start text-white/70 hover:text-white">
                            Cancel
                          </Button>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                          <div className="flex items-center justify-center rounded-2xl border border-white/5 bg-[#0f0f0f] p-3">
                            <img
                              src={mfaSetup.qr_code_data_url}
                              alt="MFA QR code"
                              className="h-36 w-36 max-w-full rounded-lg sm:h-40 sm:w-40"
                            />
                          </div>

                          <div className="min-w-0 space-y-3">
                            <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] px-3 py-2 text-xs text-white/60">
                              <p className="mb-1 font-medium text-white">Secret key</p>
                              <div className="max-w-full overflow-x-auto whitespace-nowrap font-mono text-[11px] leading-5 tracking-[0.14em] text-white/80">
                                {mfaSetup.secret}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs text-white/60">
                                Enter the 6-digit code from your authenticator app to complete setup.
                              </p>

                              <div className="overflow-x-hidden pb-1">
                                <InputOTP value={mfaCode} onChange={setMfaCode} maxLength={6}>
                                  <InputOTPGroup className="gap-1.5 sm:gap-2">
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                  </InputOTPGroup>
                                </InputOTP>
                              </div>
                            </div>

                            <Button
                              type="button"
                              onClick={handleConfirmMfaSetup}
                              disabled={mfaLoading || mfaCode.length !== 6}
                              className="w-full"
                            >
                              {mfaLoading ? "Verifying..." : "Confirm and Enable MFA"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                      <div>
                        <p className="text-xs text-white/55">
                          Platform Status
                        </p>

                        <p className="text-sm font-medium text-white">
                          Operational
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />

                        <span className="text-sm font-medium text-emerald-400">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reset */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-white">
                  Reset Preferences
                </CardTitle>

                <CardDescription className="text-white/60">
                  Restore all settings to default values.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Button
                  onClick={handleReset}
                  disabled={saving}
                  variant="outline"
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reset Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-6 xl:col-span-8">
            {/* Analysis Modules */}
            <SettingsSection
              title="Analysis Modules"
              description="Control AI analysis, sandbox telemetry, intelligence correlation, and malware report generation."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {analysisModules.map((item) => {
                  const Icon = item.icon;

                  const checked =
                    item.key === "overview"
                      ? true
                      : tabs[
                          item.key as keyof TabPreferences
                        ];

                  return (
                    <SettingCard
                      key={item.key}
                      title={item.title}
                      description={item.description}
                      checked={checked}
                      locked={item.locked}
                      icon={<Icon className="h-5 w-5" />}
                      onChange={() =>
                        handleTabToggle(
                          item.key as keyof TabPreferences,
                        )
                      }
                      disabled={saving}
                    />
                  );
                })}
              </div>
            </SettingsSection>

            {/* Navigation */}
            <SettingsSection
              title="Navigation Controls"
              description="Configure workspace navigation and sidebar visibility."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SettingCard
                      key={item.key}
                      title={item.title}
                      description={item.description}
                      checked={
                        sidebar[
                          item.key as keyof SidebarPreferences
                        ]
                      }
                      icon={<Icon className="h-5 w-5" />}
                      onChange={() =>
                        handleSidebarToggle(
                          item.key as keyof SidebarPreferences,
                        )
                      }
                      disabled={saving}
                    />
                  );
                })}
              </div>
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  );
}

/* SECTION */

function SettingsSection({
  title,
  description,
  children,
}: any) {
  return (
    <Card className="border-border bg-card/50 shadow-2xl shadow-black/10 backdrop-blur-sm">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="text-xl text-white">
          {title}
        </CardTitle>

        <CardDescription className="max-w-2xl text-white/60">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}

/* CARD */

function SettingCard({
  title,
  description,
  checked,
  icon,
  onChange,
  disabled,
  locked,
}: any) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-emerald-400">
            {icon}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white">
                {title}
              </h3>

              {locked && (
                <Badge
                  variant="secondary"
                  className="border border-white/10 bg-white/[0.04] text-[10px] text-white/75"
                >
                  CORE
                </Badge>
              )}
            </div>

            <p className="text-sm leading-relaxed text-white/60">
              {description}
            </p>
          </div>
        </div>

        <Switch
          checked={checked}
          disabled={disabled || locked}
          onCheckedChange={onChange}
        />
      </div>
    </div>
  );
}

/* INFO */

function InfoRow({
  icon: Icon,
  label,
  value,
}: any) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <div className="rounded-lg border border-white/5 bg-white/[0.03] p-2 text-emerald-400">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/55">
          {label}
        </p>

        <p className="truncate text-sm font-medium text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

/* STATS */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wide text-white/55">
        {label}
      </p>

      <h3 className="mt-1 text-xl font-semibold text-white">
        {value}
      </h3>
    </div>
  );
}

/* ALERT */

function AlertBox({
  icon,
  message,
  success,
}: any) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-border bg-card/50 text-white/80"
      }`}
    >
      {icon}

      <span>{message}</span>
    </div>
  );
}