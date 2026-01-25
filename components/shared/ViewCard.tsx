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
    green: "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20",
    pink: "bg-pink-500/10 text-pink-600 border-pink-200 hover:bg-pink-500/20",
    accent: "bg-accent/10 text-accent border-accent/30 hover:bg-accent/20"
  }

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all text-left ${
        active
          ? `${colorClasses[color as keyof typeof colorClasses]} border-current`
          : "bg-muted/5 border-border hover:bg-muted/10"
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
