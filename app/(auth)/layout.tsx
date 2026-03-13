"use client"

import { ModeToggle } from "@/components/mode-toggle"

// Generate seed once at module level for consistency across re-renders
const randomSeed = Math.random().toString(36).substring(7)
const bgImage = `url("https://picsum.photos/seed/${randomSeed}/1920/1080")`

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: bgImage }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-md" />

      <div className="relative z-10">
        <div className="absolute top-4 right-4 z-50">
          <ModeToggle />
        </div>
        {children}
      </div>
    </div>
  )
}
