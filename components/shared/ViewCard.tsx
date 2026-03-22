interface ViewCardProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  color?: string
  description?: string
}

export default function ViewCard({
  icon,
  label,
  active,
  onClick,
  color = "blue",
  description
}: ViewCardProps) {
  const colorClasses = {
    green: "bg-green-500/15 text-green-300 border-green-400/40 hover:bg-green-500/20",
    blue: "bg-blue-500/15 text-blue-300 border-blue-400/40 hover:bg-blue-500/20",
    pink: "bg-pink-500/15 text-pink-300 border-pink-400/40 hover:bg-pink-500/20",
    purple: "bg-violet-500/15 text-violet-300 border-violet-400/40 hover:bg-violet-500/20",
    accent: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/20"
  }

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all text-left ${
        active
          ? `${colorClasses[color as keyof typeof colorClasses]} border-current`
          : "bg-muted/5 border-border text-foreground/85 hover:bg-muted/10 hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground ml-6">{description}</p>
      )}
    </button>
  )
}
