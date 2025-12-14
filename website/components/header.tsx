"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export function Header() {
  const { data: session } = useSession()
  const user = session?.user as any

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Система тестування</h1>
          {user?.role === "teacher" && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Викладач</span>
          )}
          {user?.role === "student" && (
            <span className="rounded-full bg-blue-500 px-3 py-1 text-xs text-white">Студент</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{user?.name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Вихід
          </Button>
        </div>
      </div>
    </header>
  )
}
