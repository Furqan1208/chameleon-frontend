"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Bug, CircleOff, RadioTower, ShieldCheck, TimerReset, Zap } from "lucide-react"

type RssItem = {
  title: string
  pubDate: string
  link: string
}

type FeedState = {
  items: RssItem[]
  updatedAt: Date | null
  error: string | null
  loading: boolean
}

const FEED_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews"
const REFRESH_INTERVAL_MS = 120000
const MARQUEE_DURATION_SECONDS = 100

function normalizeTitle(rawTitle: string) {
  return rawTitle.replace(/&amp;/g, "&").trim()
}

function inferThreatTag(title: string) {
  const lower = title.toLowerCase()
  if (lower.includes("zero-day") || lower.includes("cve") || lower.includes("vulnerability")) return "VULN"
  if (lower.includes("apt") || lower.includes("state") || lower.includes("espionage")) return "THREAT"
  if (lower.includes("ransom") || lower.includes("malware") || lower.includes("trojan") || lower.includes("backdoor")) return "MALWARE"
  if (lower.includes("exploit") || lower.includes("poisoning") || lower.includes("botnet")) return "EXPLOIT"
  return "INTEL"
}

function timeAgo(input: string) {
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

async function getCyberNews(signal?: AbortSignal): Promise<RssItem[]> {
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

  return payload.items.slice(0, 12).map((item: { title?: string; pubDate?: string; link?: string }) => ({
    title: normalizeTitle(item.title ?? "Untitled incident"),
    pubDate: item.pubDate ?? new Date().toISOString(),
    link: item.link ?? "https://thehackernews.com/",
  }))
}

export function APTThreatGlobe() {
  const [state, setState] = useState<FeedState>({
    items: [],
    updatedAt: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      const controller = new AbortController()

      try {
        const nextItems = await getCyberNews(controller.signal)
        if (!isMounted) return

        setState({
          items: nextItems,
          updatedAt: new Date(),
          error: null,
          loading: false,
        })
      } catch (error) {
        if (!isMounted) return

        setState((prev) => ({
          ...prev,
          error: "Live feed temporarily unavailable",
          loading: false,
        }))
      }
    }

    void load()
    const intervalId = window.setInterval(() => {
      void load()
    }, REFRESH_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const tickerText = useMemo(() => {
    if (!state.items.length) {
      return "[INTEL] Awaiting threat feed initialization"
    }

    return state.items
      .map((item) => `[${inferThreatTag(item.title)}] ${item.title}`)
      .join("     •     ")
  }, [state.items])

  return (
    <div className="relative h-[24rem] w-full max-w-full overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-[#06120f] via-[#071018] to-[#101523]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,136,0.12),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(0,174,239,0.12),transparent_34%)]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(0,255,136,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.08) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      <motion.div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex h-full min-w-0 flex-col p-4">
        <div className="shrink-0 flex flex-col items-start justify-between gap-3 rounded-lg border border-border/80 bg-black/45 p-3 backdrop-blur-sm sm:flex-row sm:items-start">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-[var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.2em] text-primary">
              <RadioTower className="h-3.5 w-3.5" />
              Live Cyber Threat Intelligence
            </div>
            <p className="font-[var(--font-sora)] text-lg font-semibold text-foreground">The Hacker News SOC Feed</p>
            <p className="mt-1 break-all font-[var(--font-inter)] text-xs text-muted-foreground">Source: feeds.feedburner.com/TheHackersNews via rss2json conversion</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-black/55 px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,136,0.8)]" />
              <span className="font-[var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.14em] text-primary">Live</span>
            </div>
            <p className="mt-2 font-[var(--font-jetbrains-mono)] text-[10px] text-muted-foreground">
              {state.updatedAt ? `Updated ${timeAgo(state.updatedAt.toISOString())}` : "Waiting for first sync"}
            </p>
          </div>
        </div>

        <div className="relative mt-3 shrink-0 overflow-hidden rounded-lg border border-primary/25 bg-black/70 py-2">
          <motion.div
            className="absolute left-0 top-1/2 inline-flex -translate-y-1/2 whitespace-nowrap px-4 font-[var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.12em] text-primary"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: MARQUEE_DURATION_SECONDS, repeat: Infinity, ease: "linear" }}
          >
            {`${tickerText}     •     ${tickerText}     •     `}
          </motion.div>
          <div className="h-4" />
        </div>

        <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {(state.items.length ? state.items : Array.from({ length: 6 }, (_, idx) => ({
            title: `Loading intelligence item ${idx + 1}`,
            pubDate: new Date().toISOString(),
            link: "#",
          }))).map((item, idx) => {
            const tag = inferThreatTag(item.title)

            return (
              <a
                key={`${item.title}-${idx}`}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-20 min-w-0 flex-col overflow-hidden rounded-md border border-border/80 bg-black/55 px-3 py-2 transition-colors hover:border-primary/40"
              >
                <div className="shrink-0 flex items-center justify-between gap-2">
                  <span className="font-[var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.16em] text-secondary">{tag}</span>
                  <span className="font-[var(--font-jetbrains-mono)] text-[10px] text-muted-foreground">{timeAgo(item.pubDate)}</span>
                </div>
                <p className="mt-1 min-w-0 flex-1 overflow-hidden text-ellipsis break-words [overflow-wrap:anywhere] font-[var(--font-inter)] text-xs leading-relaxed text-foreground/95 transition-colors line-clamp-3 group-hover:text-primary">
                  {item.title}
                </p>
              </a>
            )
          })}
        </div>

        <div className="mt-3 shrink-0 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-black/55 px-2 py-1.5 font-[var(--font-jetbrains-mono)] text-[10px] text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3 w-3 text-primary" />
            Feed Integrity: Verified
          </div>
          <div className="rounded-md border border-border bg-black/55 px-2 py-1.5 font-[var(--font-jetbrains-mono)] text-[10px] text-muted-foreground">
            <TimerReset className="mr-1 inline h-3 w-3 text-secondary" />
            Refresh: {Math.floor(REFRESH_INTERVAL_MS / 1000)}s
          </div>
          <div className="rounded-md border border-border bg-black/55 px-2 py-1.5 font-[var(--font-jetbrains-mono)] text-[10px] text-muted-foreground">
            <Zap className="mr-1 inline h-3 w-3 text-primary" />
            Items: {state.items.length || "--"}
          </div>
        </div>
      </div>

      {(state.error || state.loading) && (
        <div className="pointer-events-none absolute right-4 top-4 rounded-md border border-border bg-black/70 px-2 py-1 font-[var(--font-jetbrains-mono)] text-[10px] text-muted-foreground">
          {state.loading ? (
            <>
              <CircleOff className="mr-1 inline h-3.5 w-3.5 text-secondary" />
              Initializing feed...
            </>
          ) : (
            <>
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-secondary" />
              {state.error}
            </>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute left-4 top-4 hidden rounded-md border border-border bg-black/60 px-2 py-1 font-[var(--font-jetbrains-mono)] text-[10px] text-muted-foreground md:block">
        <Bug className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
        Breaking Threat Bulletin
      </div>
    </div>
  )
}
