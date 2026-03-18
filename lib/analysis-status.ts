const COMPLETED_STATUSES = new Set([
  "complete",
  "completed",
  "done",
  "success",
  "succeeded",
  "finished",
])

const PROCESSING_STATUSES = new Set([
  "created",
  "pending",
  "processing",
  "in_progress",
  "inprogress",
  "queued",
  "running",
  "submitted",
  "uploading",
  "analyzing",
  "started",
])

const FAILED_STATUSES = new Set([
  "failed",
  "error",
  "crashed",
  "timeout",
  "timed_out",
  "cancelled",
  "canceled",
  "aborted",
])

function normalizeStatus(status?: string): string {
  return (status ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_")
}

export function isCompletedStatus(status?: string): boolean {
  return COMPLETED_STATUSES.has(normalizeStatus(status))
}

export function isPendingStatus(status?: string): boolean {
  return PROCESSING_STATUSES.has(normalizeStatus(status))
}

export function isFailedStatus(status?: string): boolean {
  return FAILED_STATUSES.has(normalizeStatus(status))
}
