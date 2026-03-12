import { ModeToggle } from "@/components/mode-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      {children}
    </div>
  )
}
