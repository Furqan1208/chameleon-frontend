interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  className?: string
}

export default function StatCard({
  label,
  value,
  icon,
  className = ""
}: StatCardProps) {
  return (
    <div className={`p-4 rounded-lg bg-muted/5 border border-border ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-lg font-semibold text-foreground mt-1">{value}</p>
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  )
}
