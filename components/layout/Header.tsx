// components/layout/Header.tsx
"use client"

import { Bell, Settings, LogOut, Command, ChevronRight, Clock3, ExternalLink, Check, CheckCheck, AlertTriangle } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { apiService } from "@/services/api/api.service"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type NewsItem = {
  id: string
  title: string
  pubDate: string
  link: string
}

const FEED_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews"
const FEED_POLL_INTERVAL_MS = 120000
const READ_IDS_STORAGE_KEY = "chameleon_news_read_ids"

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Operational overview" },
  "/dashboard/mitre": { title: "MITRE Dashboard", subtitle: "ATT&CK operational intelligence" },
  "/dashboard/upload": { title: "Upload & Analyze", subtitle: "Submit binaries and inspect behavior" },
  "/dashboard/reports": { title: "Analysis Reports", subtitle: "Review completed investigations" },
  "/dashboard/threat-intel": { title: "Threat Intelligence", subtitle: "Cross-source IOC intelligence" },
  "/dashboard/threat-intel/virustotal": { title: "VirusTotal Scanner", subtitle: "Multi-engine detection telemetry" },
  "/dashboard/threat-intel/unified": { title: "Unified Scanner", subtitle: "Single query across intel providers" },
  "/dashboard/integrations": { title: "Integrations", subtitle: "Connected provider management" },
  "/dashboard/frameworks": { title: "Frameworks", subtitle: "Mapping to security knowledge bases" },
}

const breadcrumbNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  upload: "Upload",
  reports: "Reports",
  "threat-intel": "Threat Intel",
  virustotal: "VirusTotal",
  abuseipdb: "AbuseIPDB",
  abusech: "Abuse.ch",
  alienvault: "AlienVault",
  malwarebazaar: "MalwareBazaar",
  filescan: "Filescan",
  hybridanalysis: "Hybrid Analysis",
  unified: "Unified Scanner",
  integrations: "Integrations",
  frameworks: "Frameworks",
  mitre: "MITRE Dashboard",
  "mitre-attack": "MITRE ATT&CK",
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentTitle, setCurrentTitle] = useState("Dashboard")
  const [currentSubtitle, setCurrentSubtitle] = useState("Operational overview")
  const [userName, setUserName] = useState("Analyst")
  const [currentTime, setCurrentTime] = useState("")
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [readNewsIds, setReadNewsIds] = useState<Set<string>>(new Set())

  const unreadCount = useMemo(
    () => newsItems.filter((item) => !readNewsIds.has(item.id)).length,
    [newsItems, readNewsIds]
  )

  const formatNewsTimeAgo = (input: string) => {
    const date = new Date(input)
    if (Number.isNaN(date.getTime())) return "recent"

    const diffMs = Date.now() - date.getTime()
    const mins = Math.max(1, Math.floor(diffMs / 60000))
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const markOneAsRead = (id: string) => {
    setReadNewsIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const markAllAsRead = () => {
    setReadNewsIds(new Set(newsItems.map((item) => item.id)))
  }

  const openNewsLink = (item: NewsItem) => {
    markOneAsRead(item.id)
    window.open(item.link, "_blank", "noopener,noreferrer")
  }

  const fetchNewsFeed = async (signal?: AbortSignal) => {
    setNewsLoading(true)
    try {
      const response = await fetch(FEED_URL, {
        signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Feed request failed with status ${response.status}`)
      }

      const payload = await response.json()
      if (payload?.status !== "ok" || !Array.isArray(payload?.items)) {
        throw new Error("Feed returned an unexpected payload")
      }

      const parsedItems: NewsItem[] = payload.items.slice(0, 10).map((item: { title?: string; pubDate?: string; link?: string }) => {
        const title = (item.title ?? "Untitled incident").replace(/&amp;/g, "&").trim()
        const pubDate = item.pubDate ?? new Date().toISOString()
        const link = item.link ?? "https://thehackernews.com/"
        return {
          id: link || `${title}-${pubDate}`,
          title,
          pubDate,
          link,
        }
      })

      setNewsItems(parsedItems)
      setNewsError(null)
    } catch {
      setNewsError("News feed is temporarily unavailable")
    } finally {
      setNewsLoading(false)
    }
  }

  useEffect(() => {
    const storedUser = apiService.getStoredUser()
    if (storedUser?.name) {
      setUserName(storedUser.name)
    }
  }, [])

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }

    updateTime()
    const timer = window.setInterval(updateTime, 60000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    // Find the best matching title
    let page = { title: "Dashboard", subtitle: "Operational overview" }
    const matchingPath = Object.keys(pageTitles)
      .filter(path => pathname?.startsWith(path))
      .sort((a, b) => b.length - a.length)[0]
    
    if (matchingPath) {
      page = pageTitles[matchingPath]
    }
    
    setCurrentTitle(page.title)
    setCurrentSubtitle(page.subtitle)
  }, [pathname])

  useEffect(() => {
    const raw = window.localStorage.getItem(READ_IDS_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setReadNewsIds(new Set(parsed.filter((item) => typeof item === "string")))
      }
    } catch {
      // Ignore malformed localStorage payload.
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(Array.from(readNewsIds)))
  }, [readNewsIds])

  useEffect(() => {
    const controller = new AbortController()
    void fetchNewsFeed(controller.signal)

    const intervalId = window.setInterval(() => {
      void fetchNewsFeed()
    }, FEED_POLL_INTERVAL_MS)

    return () => {
      controller.abort()
      window.clearInterval(intervalId)
    }
  }, [])

  const breadcrumbSegments = (pathname || "/dashboard")
    .split("/")
    .filter(Boolean)
    .slice(1)

  const breadcrumbItems = breadcrumbSegments.map((segment, index) => ({
    label: breadcrumbNameMap[segment] || segment.replace(/-/g, " "),
    path: `/${["dashboard", ...breadcrumbSegments.slice(0, index + 1)].join("/")}`,
    isLast: index === breadcrumbSegments.length - 1,
  }))
  const shouldShowBreadcrumbs = breadcrumbItems.length > 1

  const userInitial = (userName || "A").trim().charAt(0).toUpperCase()

  return (
    <header className="h-16 border-b border-border/80 bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
      <div className="min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm md:text-base font-semibold text-foreground truncate">{currentTitle}</h1>
          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
          <p className="hidden xl:block text-xs text-muted-foreground truncate">{currentSubtitle}</p>
        </div>

        {shouldShowBreadcrumbs && (
          <div className="mt-1 hidden md:flex items-center gap-1 text-xs text-muted-foreground/90">
            {breadcrumbItems.map((item) => (
              <div key={item.path} className="inline-flex items-center gap-1">
                {item.isLast ? (
                  <span className="text-foreground/90">{item.label}</span>
                ) : (
                  <button
                    className="hover:text-foreground transition-colors"
                    onClick={() => router.push(item.path)}
                  >
                    {item.label}
                  </button>
                )}
                {!item.isLast && <ChevronRight className="w-3 h-3" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="hidden lg:inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-border"
          title="Command palette coming soon"
        >
          <Command className="w-3.5 h-3.5" />
          Quick Actions
          <span className="rounded border border-border/70 px-1.5 py-0.5 text-[10px]">Ctrl+K</span>
        </button>

        <div className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/50 px-2.5 py-1.5 text-xs text-muted-foreground">
          <Clock3 className="w-3.5 h-3.5" />
          {currentTime}
        </div>

        <button
          onClick={() => router.push("/profile")}
          className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card/50 px-2.5 md:px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-border"
          title="Profile"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
            {userInitial}
          </span>
          <span className="hidden md:inline">{userName}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              title="Notifications"
            >
              {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />}
              <Bell className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="z-[100] w-[360px] border border-[#1a1a1a] bg-[#0d0d0d] p-0">
              <div className="flex items-center justify-between border-b border-[#1a1a1a] px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-foreground">Threat News Feed</p>
                  <p className="text-[11px] text-muted-foreground">The Hacker News live feed</p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">
                      {unreadCount} new
                    </span>
                  )}
                  <button
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 rounded-md border border-[#1a1a1a] px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {newsLoading && newsItems.length === 0 && (
                  <div className="px-2 py-6 text-center text-xs text-muted-foreground">Loading live feed...</div>
                )}

                {newsError && newsItems.length === 0 && (
                  <div className="mx-1 mb-2 flex items-center gap-2 rounded-lg border border-[#2a1a1a] bg-[#1a1111] px-2 py-2 text-xs text-amber-200">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {newsError}
                  </div>
                )}

                {!newsLoading && newsItems.length === 0 && !newsError && (
                  <div className="px-2 py-6 text-center text-xs text-muted-foreground">No feed items available.</div>
                )}

                {newsItems.map((item) => {
                  const isRead = readNewsIds.has(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`mb-1 rounded-lg border px-2.5 py-2 ${
                        isRead
                          ? "border-[#1a1a1a] bg-[#0a0a0a]"
                          : "border-primary/30 bg-primary/5"
                      }`}
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <button
                          onClick={() => openNewsLink(item)}
                          className="line-clamp-2 text-left text-xs text-foreground hover:text-primary transition-colors"
                        >
                          {item.title}
                        </button>
                        <button
                          onClick={() => markOneAsRead(item.id)}
                          className="shrink-0 rounded-md border border-[#1a1a1a] p-1 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">{formatNewsTimeAgo(item.pubDate)}</span>
                        <button
                          onClick={() => openNewsLink(item)}
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                        >
                          Open
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={() => router.push("/dashboard/integrations")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            apiService.logout()
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}