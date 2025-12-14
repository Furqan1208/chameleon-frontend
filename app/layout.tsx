// app/layout.tsx
import './globals.css'

export const metadata = {
  title: 'Chameleon Dashboard',
  description: 'Malware Analysis Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  )
}
