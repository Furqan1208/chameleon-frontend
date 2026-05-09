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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />

          <span className="text-sm text-muted-foreground">
            Loading settings...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 rounded-2xl border bg-card px-8 py-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl border bg-muted/40 p-3">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Workspace Settings
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
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
            <Card className="overflow-hidden">
              <div className="h-24 border-b bg-muted/30" />

              <CardContent className="relative p-6">
                <div className="-mt-14 flex items-end gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-background bg-card shadow-sm">
                    <User2 className="h-8 w-8 text-primary" />
                  </div>

                  <div className="pb-1">
                    <h2 className="text-xl font-semibold">
                      {userInfo?.name ||
                        userInfo?.username ||
                        "Analyst"}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {userInfo?.role || "SOC Analyst"}
                    </p>
                  </div>
                </div>

                {userLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
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
                      value="MFA Enabled"
                    />

                    <Separator />

                    <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Platform Status
                        </p>

                        <p className="text-sm font-medium">
                          Operational
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />

                        <span className="text-sm font-medium text-green-600">
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
                <CardTitle className="text-base">
                  Reset Preferences
                </CardTitle>

                <CardDescription>
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
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-xl">
          {title}
        </CardTitle>

        <CardDescription className="max-w-2xl">
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
    <div className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="rounded-lg border bg-muted/30 p-3 text-primary">
            {icon}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">
                {title}
              </h3>

              {locked && (
                <Badge
                  variant="secondary"
                  className="text-[10px]"
                >
                  CORE
                </Badge>
              )}
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
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
    <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
      <div className="rounded-lg bg-muted/40 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="truncate text-sm font-medium">
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
    <div className="rounded-xl border bg-muted/20 px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <h3 className="mt-1 text-xl font-semibold">
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
          ? "border-green-500/20 bg-green-500/10 text-green-600"
          : "border-border bg-card"
      }`}
    >
      {icon}

      <span>{message}</span>
    </div>
  );
}