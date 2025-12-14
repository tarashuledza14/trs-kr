"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
      })

      if (result?.error) {
        setError("Невірний email")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Сталася помилка")
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = async (userEmail: string) => {
    setEmail(userEmail)
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: userEmail,
        redirect: false,
      })

      if (result?.error) {
        setError("Невірний email")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Сталася помилка")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Вхід до системи</CardTitle>
          <CardDescription className="text-center">
            Система тестування та аналізу рівня підготовленості студентів
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Завантаження..." : "Увійти"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Або швидкий вхід</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button
              variant="outline"
              onClick={() => quickLogin("teacher@example.com")}
              disabled={isLoading}
              className="w-full"
            >
              Увійти як Викладач
            </Button>
            <Button
              variant="outline"
              onClick={() => quickLogin("student@example.com")}
              disabled={isLoading}
              className="w-full"
            >
              Увійти як Студент
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>Тестові облікові записи:</p>
            <p>teacher@example.com - Викладач</p>
            <p>student@example.com - Студент</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
